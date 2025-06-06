const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        status: 400,
        message: "Validation error",
        details: error.details.map((err) => {
          return {
            message: err.message,
            path: err.path,
            type: err.type,
          };
        }),
      });
    } else {
      next();
    }
  };
};
module.exports = { validate };
