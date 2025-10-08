require("dotenv").config();
const cron = require("node-cron");
const { keys, get, set } = require("../../models/repositories/cache.repo");
const questionModel = require("../../models/question.model");
require("../../configs/redis.config");
const asyncDataCronjob = async ({
  patternKey,
  mode = "start",
  keyFlushFunc,
  fieldData,
}) => {
  const task = cron.schedule(
    "*/10 * * * *",
    async () => {
      //after handle: Update distribute lock for cronjob, avoid error race condition
      //handle logic cronjob, batch or all
      await keys(patternKey).then(async (keys) => {
        for (const key of keys) {
          const keyFlushValue = keyFlushFunc(key.split(":")[1]);
          const keyView = await get(key);
          const keyFlush = (await get(keyFlushValue)) || keyView;
          await questionModel.updateOne(
            { _id: key.split(":")[1] },
            { $inc: { [fieldData]: parseInt(keyView - keyFlush, 10) || 0 } }
          );
          await set(keyFlushValue, keyView, 3600);
        }
      });
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    }
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
