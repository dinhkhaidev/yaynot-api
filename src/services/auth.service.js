const crypto = require("crypto");
const bcrypt = require("bcrypt");
const blake = require("blakejs");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const userModel = require("../models/user.model");
const {
  createTokenPair,
  createSession,
  revokeSession,
  addToBlacklist,
  getSession,
  revokeAllUserSessions,
  verifyToken,
  SESSION_CONFIG,
} = require("../auth/authUtil.hybrid");
const {
  setCache,
  getCache,
  delCache,
} = require("../infrastructures/cache/getCache");
const {
  keyAuthSession,
  keyOtpToken,
} = require("../infrastructures/cache/keyBuilder");
const {
  sendEmailVerify,
  sendEmailVerifyStateless,
  getOtpToken,
} = require("./email.service");
const { findUserByEmail } = require("../models/repositories/access.repo");
const { checkOtpToken, checkOtpStateless } = require("./otp.service");
const { deleteOtpByEmail } = require("../models/repositories/email.repo");
const { SHA256 } = require("crypto-js");

const saltRounds = 10;

class AuthService {
  static async register({ name, email, password, deviceInfo }) {
    if (!name || !email || !password) {
      const missing = [];
      if (!name) missing.push("name");
      if (!email) missing.push("email");
      if (!password) missing.push("password");
      throw new BadRequestError(`Missing field: ${missing.join(", ")}`);
    }

    const foundUser = await findUserByEmail(email);
    if (foundUser) {
      throw new BadRequestError("Email already registered!");
    }

    const passwordHash = await bcrypt.hash(password.toString(), saltRounds);
    const newUser = await userModel.create({
      user_name: name,
      user_email: email,
      user_password: passwordHash,
    });

    if (!newUser) {
      throw new Error("User creation failed!");
    }

    // sendEmailVerifyStateless({
    //   email: newUser.user_email,
    //   name: "email-verify",
    // }).catch((err) => {
    //   console.error("Failed to send verification email:", err);
    // });

    sendEmailVerifyStateless({
      email: newUser.user_email,
    });

    // Auto login after registration
    const sessionId = crypto.randomUUID();
    const tokenFamily = crypto.randomUUID();

    await createSession({
      sessionId,
      userId: newUser._id.toString(),
      role: newUser.user_role || "user",
      username: newUser.user_name,
      email: newUser.user_email,
      deviceId: deviceInfo?.deviceId || "unknown",
      ipAddress: deviceInfo?.ipAddress || "unknown",
      userAgent: deviceInfo?.userAgent || "unknown",
      tokenFamily,
    });

    const { accessToken, refreshToken } = createTokenPair(
      {
        userId: newUser._id.toString(),
        role: newUser.user_role || "user",
      },
      sessionId,
      tokenFamily
    );

    return {
      user: {
        id: newUser._id,
        username: newUser.user_name,
        email: newUser.user_email,
        role: newUser.user_role,
        avatar: newUser.user_avatar,
        isVerified: newUser.user_isVerify,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
      otpToken: await getOtpToken(email),
      sessionId,
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  }

  static async verifyStatelessOtpLink({ token }) {
    const decodedToken = verifyToken(token, process.env.OTP_TOKEN_SECRET);
    const foundUser = await findUserByEmail(decodedToken.email);
    if (!foundUser) {
      throw new BadRequestError("User not found!");
    }
    if (foundUser.user_isVerify) {
      throw new BadRequestError("Invalid verification link!");
    }

    if (decodedToken) {
      const updateVerify = await userModel.updateOne(
        { user_email: decodedToken.email },
        { user_isVerify: true }
      );

      return updateVerify;
    } else {
      throw new BadRequestError("OTP incorrect!");
    }
  }

  static async verifyStatelessOtpManual({ token, otp }) {
    const decodedToken = verifyToken(token, process.env.OTP_TOKEN_SECRET);
    const foundUser = await findUserByEmail(decodedToken.email);
    if (!foundUser) {
      throw new BadRequestError("User not found!");
    }
    if (foundUser.user_isVerify) {
      throw new BadRequestError("Account has been verified!");
    }

    const saltVerify = process.env.SALT_VERIFY_EMAIL;
    if (!saltVerify) {
      throw new BadRequestError("SALT_VERIFY_EMAIL not found!");
    }
    const otpHash = blake.blake2bHex(otp + saltVerify);

    const checkOtp = checkOtpStateless(decodedToken.otpHash, otpHash);
    if (checkOtp) {
      const updateVerify = await userModel.updateOne(
        { user_email: decodedToken.email },
        { user_isVerify: true }
      );

      // await delCache(keyOtpToken(decodedToken.email));

      return decodedToken.email;
    } else {
      throw new BadRequestError("OTP incorrect!");
    }
  }
  static async verifyUser({ email, otp }) {
    const foundUser = await findUserByEmail(email);
    if (!foundUser) {
      throw new BadRequestError("User not found!");
    }
    if (foundUser.user_isVerify) {
      throw new BadRequestError("Account has been verified!");
    }
    const checkOtp = await checkOtpToken(otp);
    if (checkOtp) {
      const updateVerify = await userModel.updateOne(
        { user_email: email },
        { user_isVerify: true }
      );
      await deleteOtpByEmail(email);
      return updateVerify;
    } else {
      throw new BadRequestError("OTP incorrect!");
    }
  }

  static async login({ email, password, deviceInfo }) {
    const user = await userModel.findOne({ user_email: email }).lean();
    if (!user) {
      throw new BadRequestError("Invalid email or password!");
    }

    const isMatch = await bcrypt.compare(password, user.user_password);
    if (!isMatch) {
      throw new BadRequestError("Invalid email or password!");
    }

    if (user.user_status !== "active") {
      throw new AuthFailureError("Account is inactive or banned!");
    }

    const sessionId = crypto.randomUUID();
    const tokenFamily = crypto.randomUUID();

    await createSession({
      sessionId,
      userId: user._id.toString(),
      role: user.user_role || "user",
      username: user.user_name,
      email: user.user_email,
      deviceId: deviceInfo.deviceId || "unknown",
      ipAddress: deviceInfo.ipAddress || "unknown",
      userAgent: deviceInfo.userAgent || "unknown",
      tokenFamily,
    });

    const { accessToken, refreshToken } = createTokenPair(
      {
        userId: user._id.toString(),
        role: user.user_role || "user",
      },
      sessionId,
      tokenFamily
    );
    return {
      user: {
        id: user._id,
        username: user.user_name,
        email: user.user_email,
        role: user.user_role,
        avatar: user.user_avatar,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
      sessionId,
    };
  }

  static async refreshToken({ userId, sessionId, oldRefreshToken }) {
    const session = await getSession(sessionId);
    if (!session) {
      throw new AuthFailureError("Session expired!");
    }

    const newTokenFamily = crypto.randomUUID();

    session.tokenFamily = newTokenFamily;
    session.lastActivity = new Date().toISOString();

    await setCache(
      keyAuthSession(sessionId),
      JSON.stringify(session),
      SESSION_CONFIG.TTL
    );

    await addToBlacklist(oldRefreshToken);

    const { accessToken, refreshToken } = createTokenPair(
      {
        userId,
        role: session.role,
      },
      sessionId,
      newTokenFamily
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  static async logout({ userId, sessionId, accessToken }) {
    await revokeSession(sessionId, userId);

    await addToBlacklist(accessToken);

    return { message: "Logged out successfully" };
  }

  static async logoutAll({ userId, currentAccessToken }) {
    await revokeAllUserSessions(userId);

    await addToBlacklist(currentAccessToken);

    return { message: "Logged out from all devices" };
  }

  static async getActiveSessions(userId) {
    const userSessionsKey = `user:${userId}:sessions`;

    const cached = await getCache(userSessionsKey);
    if (!cached) return [];

    const sessionList = JSON.parse(cached);

    const sessions = await Promise.all(
      sessionList.map(async (s) => {
        const session = await getSession(s.sessionId);
        return session ? { ...session, sessionId: s.sessionId } : null;
      })
    );

    return sessions.filter(Boolean);
  }

  static async revokeSpecificSession({ userId, sessionId }) {
    await revokeSession(sessionId, userId);
    return { message: "Session revoked successfully" };
  }
}

module.exports = AuthService;
