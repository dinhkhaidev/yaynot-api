const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: 400,
        message: "Validation error",
        details: error.details.map((err) => err.message),
      });
    } else {
      next();
    }
  };
};
module.exports = { validate };
