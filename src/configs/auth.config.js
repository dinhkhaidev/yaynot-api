const JWT_CONFIG = {
  ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_TTL: process.env.TTL_ACCESS_TOKEN || "15m",
  REFRESH_TTL: process.env.TTL_REFRESH_TOKEN || "7d",
  ALGORITHM: "HS256",
};

const SESSION_CONFIG = {
  TTL: 7 * 24 * 60 * 60, // 7 days in seconds
  MAX_DEVICES: 5, // Max concurrent sessions per user
  BLACKLIST_TTL: 60 * 60 * 24 * 7, // 7 days
};

module.exports = {
  JWT_CONFIG,
  SESSION_CONFIG,
};
