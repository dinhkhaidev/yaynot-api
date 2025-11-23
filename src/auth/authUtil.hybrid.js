const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  BadRequestError,
  AuthFailureError,
  NotFoundError,
} = require("../core/error.response");
const asyncHandle = require("../helpers/asyncHandle");
const header = require("../constants/header");
const {
  getCache,
  setCache,
  delCache,
} = require("../infrastructures/cache/getCache");
const {
  keyAuthSession,
  keyAuthBlacklist,
} = require("../infrastructures/cache/keyBuilder");
const { JWT_CONFIG, SESSION_CONFIG } = require("../configs/auth.config");
const blacklistModel = require("../models/blacklist.model");

const createTokenPair = (payload, sessionId, tokenFamily = null) => {
  const { userId, role } = payload;

  const accessToken = jwt.sign(
    {
      userId,
      sessionId,
      role,
      type: "access",
    },
    JWT_CONFIG.ACCESS_SECRET,
    {
      algorithm: JWT_CONFIG.ALGORITHM,
      expiresIn: JWT_CONFIG.ACCESS_TTL,
    }
  );

  const refreshToken = jwt.sign(
    {
      userId,
      sessionId,
      tokenFamily: tokenFamily || crypto.randomUUID(),
      type: "refresh",
    },
    JWT_CONFIG.REFRESH_SECRET,
    {
      algorithm: JWT_CONFIG.ALGORITHM,
      expiresIn: JWT_CONFIG.REFRESH_TTL,
    }
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret, { algorithms: [JWT_CONFIG.ALGORITHM] });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new AuthFailureError("Token expired!");
    }
    throw new AuthFailureError("Invalid token!");
  }
};

const createSession = async (sessionData) => {
  const {
    sessionId,
    userId,
    role,
    username,
    email,
    deviceId,
    ipAddress,
    userAgent,
    tokenFamily,
  } = sessionData;

  const session = {
    userId,
    role,
    username,
    email,
    deviceId,
    ipAddress,
    userAgent,
    tokenFamily,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };

  await setCache(
    keyAuthSession(sessionId),
    JSON.stringify(session),
    SESSION_CONFIG.TTL
  );

  const userSessionsKey = `user:${userId}:sessions`;
  const sessions = await getCache(userSessionsKey);
  const sessionList = sessions ? JSON.parse(sessions) : [];

  sessionList.push({ sessionId, createdAt: session.createdAt });

  if (sessionList.length > SESSION_CONFIG.MAX_DEVICES) {
    const oldestSession = sessionList.shift();
    await delCache(keyAuthSession(oldestSession.sessionId));
  }

  await setCache(
    userSessionsKey,
    JSON.stringify(sessionList),
    SESSION_CONFIG.TTL
  );

  return session;
};

const getSession = async (sessionId) => {
  const cached = await getCache(keyAuthSession(sessionId));
  if (!cached) return null;

  const session = JSON.parse(cached);

  session.lastActivity = new Date().toISOString();
  setCache(
    keyAuthSession(sessionId),
    JSON.stringify(session),
    SESSION_CONFIG.TTL
  ).catch(() => {});

  return session;
};

const revokeSession = async (sessionId, userId) => {
  await delCache(keyAuthSession(sessionId));

  const userSessionsKey = `user:${userId}:sessions`;
  const sessions = await getCache(userSessionsKey);
  if (sessions) {
    const sessionList = JSON.parse(sessions).filter(
      (s) => s.sessionId !== sessionId
    );
    await setCache(
      userSessionsKey,
      JSON.stringify(sessionList),
      SESSION_CONFIG.TTL
    );
  }
};

const revokeAllUserSessions = async (userId) => {
  const userSessionsKey = `user:${userId}:sessions`;
  const sessions = await getCache(userSessionsKey);

  if (sessions) {
    const sessionList = JSON.parse(sessions);
    await Promise.all(
      sessionList.map((s) => delCache(keyAuthSession(s.sessionId)))
    );
    await delCache(userSessionsKey);
  }
};

const addToBlacklist = async (token, ttl = SESSION_CONFIG.TTL) => {
  const expiresAt = new Date(Date.now() + ttl * 1000);

  await blacklistModel.create({
    token: crypto.createHash("sha256").update(token).digest("hex"),
    expiresAt,
  });

  await setCache(keyAuthBlacklist(token), "1", ttl).catch(() => {});
};

const isBlacklisted = async (token) => {
  try {
    const result = await getCache(keyAuthBlacklist(token));
    return result === "1";
  } catch (err) {
    console.warn("Redis blacklist check failed, using MongoDB:", err.message);
  }
  //fallback
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const foundBlackList = await blacklistModel.findOne({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
  });
  const result = !!foundBlackList;
  return result;
};

const authentication = asyncHandle(async (req, res, next) => {
  const authHeader = req.header(header.AUTHORIZATION);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthFailureError("Missing or invalid authorization header!");
  }

  const accessToken = authHeader.replace("Bearer ", "");

  if (await isBlacklisted(accessToken)) {
    throw new AuthFailureError("Token has been revoked. Please login again.");
  }

  const decoded = verifyToken(accessToken, JWT_CONFIG.ACCESS_SECRET);

  if (decoded.type !== "access") {
    throw new AuthFailureError("Invalid token type!");
  }

  const session = await getSession(decoded.sessionId);
  if (!session) {
    throw new AuthFailureError(
      "Session expired or invalid. Please login again."
    );
  }

  if (session.userId !== decoded.userId) {
    throw new AuthFailureError("Token-session mismatch!");
  }

  //Optional: Device fingerprint validation
  // const deviceId = req.header("x-device-id");
  // if (deviceId && session.deviceId && session.deviceId !== deviceId) {
  //   // Suspicious: token used from different device
  //   await revokeSession(decoded.sessionId, session.userId);
  //   throw new AuthFailureError(
  //     "Suspicious activity detected. Please login again."
  //   );
  // }

  req.user = {
    user_id: session.userId,
    role: session.role,
    username: session.username,
    email: session.email,
    sessionId: decoded.sessionId,
  };
  req.session = session;
  req.accessToken = accessToken;
  next();
});

const authenticationRefreshToken = asyncHandle(async (req, res, next) => {
  const refreshToken = req.header(header.REFRESH_TOKEN);
  if (!refreshToken) {
    throw new AuthFailureError("Missing refresh token!");
  }

  if (await isBlacklisted(refreshToken)) {
    throw new AuthFailureError("Refresh token has been revoked!");
  }

  const decoded = verifyToken(refreshToken, JWT_CONFIG.REFRESH_SECRET);

  if (decoded.type !== "refresh") {
    throw new AuthFailureError("Invalid token type!");
  }

  const session = await getSession(decoded.sessionId);
  if (!session) {
    throw new AuthFailureError("Session expired!");
  }

  if (session.tokenFamily !== decoded.tokenFamily) {
    await revokeAllUserSessions(session.userId);
    throw new AuthFailureError(
      "Token reuse detected! All sessions revoked. Please login again."
    );
  }

  req.user = {
    userId: session.userId,
    role: session.role,
    username: session.username,
    email: session.email,
    sessionId: decoded.sessionId,
  };
  req.session = session;
  req.oldRefreshToken = refreshToken;

  next();
});

module.exports = {
  createTokenPair,
  verifyToken,
  createSession,
  getSession,
  revokeSession,
  revokeAllUserSessions,
  addToBlacklist,
  isBlacklisted,

  authentication,
  authenticationRefreshToken,

  JWT_CONFIG,
  SESSION_CONFIG,
};
