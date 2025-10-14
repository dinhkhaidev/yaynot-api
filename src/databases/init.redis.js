const Redis = require("ioredis");
let client = {},
  statusConnectRedis = {
    CONNECT: "connect",
    READY: "ready",
    ERROR: "error",
    CLOSE: "close",
  };
// const handleEvents = (event) => {
//   event.on(statusConnectRedis.CONNECT, () => console.log("Redis connected"));
//   event.on(statusConnectRedis.READY, () => console.log("Redis ready"));
//   event.on(statusConnectRedis.ERROR, (err) =>
//     console.error("Redis error:", err.message)
//   );
//   event.on(statusConnectRedis.CLOSE, () =>
//     console.log("Redis connection closed")
//   );
// };
const initRedis = () => {
  return new Promise((resolve, reject) => {
    const instanceRedis = new Redis({
      port: process.env.REDIS_PORT || 6379, // Redis port
      host: process.env.REDIS_HOST || "redis",
      username: process.env.REDIS_USERNAME || "",
      password: process.env.REDIS_PASSWORD || "",
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    client.instanceRedis = instanceRedis;

    // Handle connection events
    instanceRedis.on(statusConnectRedis.READY, () => {
      console.log("Redis ready");
      resolve(instanceRedis);
    });

    instanceRedis.on(statusConnectRedis.ERROR, (err) => {
      console.error("Redis error:", err.message);
      reject(err);
    });

    instanceRedis.on(statusConnectRedis.CONNECT, () => {
      console.log("Redis connected");
    });

    instanceRedis.on(statusConnectRedis.CLOSE, () => {
      console.log("Redis connection closed");
    });
  });
};
const getRedis = () => client;
const closeRedis = () => {};
module.exports = { initRedis, getRedis, closeRedis };
