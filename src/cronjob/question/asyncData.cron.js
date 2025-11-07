require("dotenv").config();
const cron = require("node-cron");
const cacheRepo = require("../../models/repositories/cache.repo");
const questionModel = require("../../models/question.model");
// require("../../configs/redis.config");
const asyncDataCronjob = async ({
  patternKey,
  mode = "start",
  keyFlushFunc,
  fieldData,
}) => {
  const task = cron.schedule(
    "*/10 * * * *",
    async () => {
      try {
        //after handle: Update distribute lock for cronjob, avoid error race condition
        //handle logic cronjob, batch or all
        await cacheRepo.keys(patternKey).then(async (keysData) => {
          for (const key of keysData) {
            const keyFlushValue = keyFlushFunc(key.split(":")[1]);
            const keyView = await cacheRepo.get(key);
            const keyFlush = (await cacheRepo.get(keyFlushValue)) || keyView;
            await questionModel.updateOne(
              { _id: key.split(":")[1] },
              { $inc: { [fieldData]: parseInt(keyView - keyFlush, 10) || 0 } },
            );
            await cacheRepo.set(keyFlushValue, keyView, 3600);
          }
        });
      } catch (error) {
        console.error(
          "[NODE-CRON] [ERROR] Error in asyncDataCronjob:",
          error.message,
        );
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    },
  );
  if (mode === "start" && typeof task[mode] === "function") {
    console.log(`Cronjob ${fieldData} start `);
    task[mode]();
  } else if (mode === "stop" && typeof task[mode] === "function") {
    console.log(`Cronjob ${fieldData} close, turn on to use!`);
  } else {
    console.log(`Invalid mode: ${mode} in ${fieldData} cronjob`);
  }
};
module.exports = asyncDataCronjob;
