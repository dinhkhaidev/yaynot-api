//migrate to infra
const redisInfra = require("../infrastructures/cache/redis.client");

const Redis = require("ioredis");

let client = null;
let connectionPromise = null;

const statusConnectRedis = {
  CONNECT: "connect",
  READY: "ready",
  ERROR: "error",
  CLOSE: "close",
};

// const initRedis = () => {
//   // Return existing promise if already connecting/connected
//   if (connectionPromise) {
//     return connectionPromise;
//   }

//   connectionPromise = new Promise((resolve, reject) => {
//     const redisConfig = process.env.REDIS_URL
//       ? process.env.REDIS_URL
//       : {
//           port: process.env.REDIS_PORT || 6379,
//           host: process.env.REDIS_HOST || "redis",
//           username: process.env.REDIS_USERNAME || "",
//           password: process.env.REDIS_PASSWORD || "",
//           retryStrategy: (times) => Math.min(times * 50, 2000),
//           maxRetriesPerRequest: 3,
//           enableReadyCheck: false,
//           enableOfflineQueue: false,
//           lazyConnect: true,
//         };

//     const instanceRedis = new Redis(redisConfig);
//     client = instanceRedis;

//     instanceRedis.on(statusConnectRedis.READY, () => {
//       console.log("Redis ready");
//       resolve(instanceRedis);
//     });

//     instanceRedis.on(statusConnectRedis.ERROR, (err) => {
//       console.error("Redis error:", err.message);
//     });

//     instanceRedis.on(statusConnectRedis.CONNECT, () => {
//       console.log("Redis connecting...");
//     });

//     instanceRedis.on(statusConnectRedis.CLOSE, () => {
//       console.log("Redis closed");
//       client = null;
//       connectionPromise = null;
//     });

//     // Connect once
//     if (instanceRedis.status === "wait" || instanceRedis.status === "end") {
//       instanceRedis.connect().catch(reject);
//     } else {
//       console.log(`Redis status: ${instanceRedis.status}, skipping connect()`);
//       // If already connecting/connected, resolve when ready
//       instanceRedis.once(statusConnectRedis.READY, () =>
//         resolve(instanceRedis)
//       );
//     }
//   });

//   return connectionPromise;
// };

// const getRedis = () => client;

// const closeRedis = async () => {
//   if (client) {
//     await client.quit();
//     client = null;
//     connectionPromise = null;
//   }
// };

module.exports = {
  initRedis: redisInfra.initRedis,
  getRedis: redisInfra.getRedis,
  closeRedis: redisInfra.closeRedis,
};
