const mongoose = require("mongoose");
const { BadRequestError } = require("../core/error.response");

const withTransaction = async (fn) => {
  const session = await mongoose.startSession();
  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw new BadRequestError("Something wrong about command handle!", error);
  } finally {
    session.endSession();
  }
};
module.exports = {
  withTransaction,
};
