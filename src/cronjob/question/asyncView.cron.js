require("dotenv").config();
const cron = require("node-cron");
const cacheRepo = require("../../models/repositories/cache.repo");
const questionModel = require("../../models/question.model");
const { keyFlushViewQuestion } = require("../../utils/cacheRedis");
// require("../../configs/redis.config");
const asyncViewCronjob = async ({ patternKeyViewQuestion, mode = "start" }) => {
  const task = cron.schedule(
    "*/10 * * * *",
    async () => {
      try {
        //after handle: Update distribute lock for cronjob, avoid error race condition
        //handle logic cronjob, batch or all
        await cacheRepo.keys(patternKeyViewQuestion).then(async (keysData) => {
          for (const key of keysData) {
            const keyFlushValue = keyFlushViewQuestion(key.split(":")[1]);
            const keyView = await cacheRepo.get(key);
            const keyFlush = (await cacheRepo.get(keyFlushValue)) || keyView;
            await questionModel.updateOne(
              { _id: key.split(":")[1] },
              { $inc: { view: parseInt(keyView - keyFlush, 10) || 0 } }
            );
            await cacheRepo.set(keyFlushValue, keyView, 3600);
          }
        });
      } catch (error) {
        console.error(
          "[NODE-CRON] [ERROR] Error in asyncViewCronjob:",
          error.message
        );
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    }
  );
  if (mode === "start" && typeof task[mode] === "function") {
    console.log("Cronjob view start");
    task[mode]();
  } else if (mode === "stop" && typeof task[mode] === "function") {
    console.log("Cronjob view close");
  } else {
    console.log(`Invalid mode: ${mode}`);
  }
};
module.exports = asyncViewCronjob;
