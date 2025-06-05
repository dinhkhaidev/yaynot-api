const asyncHandle = (func) => async (err, req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    next(err);
  }
};
module.exports = asyncHandle;
