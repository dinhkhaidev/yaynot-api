const handleAsync = (func) => async (err, req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    next(err);
  }
};
module.exports = handleAsync;
