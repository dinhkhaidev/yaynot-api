const { getListRole } = require("../controllers/rbac");
const { AuthFailureError } = require("../core/error.response");
const { ac } = require("./accessControl");

module.exports = (action, resource) => {
  return async (req, res, next) => {
    try {
      const roleName = req?.user.role;
      if (!roleName) {
        throw new AuthFailureError("Role not provided");
      }
      const listRole = await getListRole();
      const ac = new AccessControl();
      ac.setGrants(listRole);
      const permission = ac.can(roleName)[action](resource);
      if (!permission.granted) {
        throw new AuthFailureError("No Permission!");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
