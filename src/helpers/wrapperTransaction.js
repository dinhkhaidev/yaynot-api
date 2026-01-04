const mongoose = require("mongoose");
const { BadRequestError } = require("../core/error.response");

const withTransaction = async (fn) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    console.log("Transaction error:", error);
    throw new BadRequestError(error);
  } finally {
    session.endSession();
  }
};
module.exports = {
  withTransaction,
};
