const { BadRequestError } = require("../core/error.response");
const {
  findNameRole,
  createRoleInDB,
  createResourceInDB,
  getListResourceInDB,
  getListRoleInDB,
} = require("../models/repositories/rbac.repo");
const roleModel = require("../models/role.model");

class RbacService {
  static async createRole(payload) {
    const { name, description = "role", slug, grants = [] } = payload;
    const roleRecord = await findNameRole(name);
    if (roleRecord) {throw new BadRequestError("Role existed!");}
    return await createRoleInDB({ name, description, slug, grants });
  }
  static async createResource(payload) {
    const { name, description = "resource", slug } = payload;
    const roleRecord = await findNameRole(name);
    if (roleRecord) {throw new BadRequestError("Resource existed!");}
    return await createResourceInDB({ name, description, slug });
  }
  static async resourceList() {
    return await getListResourceInDB();
  }
  static async roleList() {
    return await getListRoleInDB();
  }
}
module.exports = RbacService;
