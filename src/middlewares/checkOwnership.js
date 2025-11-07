const { default: mongoose } = require("mongoose");
const {
  BadRequestError,
  NotFoundError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { isObjectId } = require("../utils/validateType");
const checkOwnership = ({
  model,
  param = "body",
  resultId = "userId",
  ownerField = "userId",
}) => {
  return async (req, res, next) => {
    try {
      const id = req[param]?.[resultId];
      if (!id || !isObjectId(id))
      {throw new BadRequestError(
        "Missing field id or invalid value for check ownership!",
      );}
      const result = await model.findById(id);
      if (!result) {throw new NotFoundError(`${model.modelName} not found!`);}
      if (result[ownerField].toString() !== req.user.user_id)
      {throw new ForbiddenError("You do not own this resource");}
      req.resource = result;
      next();
    } catch (error) {
      next(error);
    }
  };
};
module.exports = { checkOwnership };
