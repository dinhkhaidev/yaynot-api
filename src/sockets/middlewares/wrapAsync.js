const wrapAsync = (func) => {
  return async function (...args) {
    const callback =
      typeof args[args.length - 1] === "function" ? args.pop() : null;
    try {
      await func.apply(this, args); // this === socket
    } catch (error) {
      if (error) {
        return callback({
          success: false,
          message: error.message || "Internal error",
        });
      } else {
        this.emit("error", error.message);
      }
    }
  };
};
module.exports = wrapAsync;
