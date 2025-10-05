require("dotenv").config();
const cron = require("node-cron");
const { keys, get, set } = require("../../models/repositories/cache.repo");
const questionModel = require("../../models/question.model");
const { keyFlushViewQuestion } = require("../../utils/cacheRedis");
require("../../configs/redis.config");
const asyncViewCronjob = async ({ patternKeyViewQuestion, mode = "start" }) => {
  const task = cron.schedule(
    "*/10 * * * *",
    async () => {
      //after handle: Update distribute lock for cronjob, avoid error race condition
      //handle logic cronjob, batch or all
      await keys(patternKeyViewQuestion).then(async (keys) => {
        for (const key of keys) {
          const keyFlushValue = keyFlushViewQuestion(key.split(":")[1]);
          const keyView = await get(key);
          const keyFlush = (await get(keyFlushValue)) || keyView;
          await questionModel.updateOne(
            { _id: key.split(":")[1] },
            { $inc: { view: parseInt(keyView - keyFlush, 10) || 0 } }
          );
          await set(keyFlushValue, keyView, 3600);
        }
      });
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    }
  );
  if (typeof task[mode] === "function") {
    task[mode]();
  } else {
    console.log(`Invalid mode: ${mode}`);
  }
};
module.exports = asyncViewCronjob;
