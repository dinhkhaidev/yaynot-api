const { CREATED, OK } = require("../../core/success.response");
const RbacService = require("../../services/rbac.service");

class RbacController {
  createResource = async (req, res, next) => {
    new CREATED({
      message: "Create resource successful!",
      metadata: await RbacService.createResource(req.body),
    }).send(res);
  };
  createRole = async (req, res, next) => {
    new CREATED({
      message: "Create list successful!",
      metadata: await RbacService.createRole(req.body),
    }).send(res);
  };
  getListResource = async (req, res, next) => {
    new OK({
      message: "Get resource successful!",
      metadata: await RbacService.resourceList(),
    }).send(res);
  };
  getListRole = async (req, res, next) => {
    new OK({
      message: "Get list successful!",
      metadata: await RbacService.roleList(),
    }).send(res);
  };
}
module.exports = new RbacController();
