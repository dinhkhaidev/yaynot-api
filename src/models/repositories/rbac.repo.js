const resourceModel = require("../resource.model");
const roleModel = require("../role.model");

const findNameRole = async (name) => {
  return await roleModel.findOne({ name }).lean();
};
const findNameResource = async (name) => {
  return await resourceModel.findOne({ name }).lean();
};
const createRoleInDB = async (payload) => {
  return await roleModel.create(payload);
};
const createResourceInDB = async (payload) => {
  console.log("payload", payload);
  return await resourceModel.create(payload);
};
const getListResourceInDB = async () => {
  return await resourceModel.aggregate([
    {
      $project: {
        _id: 0,
        resourceId: "$_id",
        name: "$name",
        description: "$description",
        slug: "$slug",
      },
    },
  ]);
};
const getListRoleInDB = async () => {
  const roleList = await roleModel.aggregate([
    {
      $unwind: "$grants",
    },
    {
      $lookup: {
        from: "resources",
        localField: "grants.resource",
        foreignField: "_id",
        as: "resource",
      },
    },
    {
      $unwind: "$resource",
    },
    {
      $project: {
        role: "$name",
        resource: "$resource.name",
        action: "$grants.action",
        attributes: "$grants.attributes",
        _id: 0,
      },
    },
    {
      $unwind: "$action",
    },
  ]);
  return roleList;
};
module.exports = {
  findNameRole,
  findNameResource,
  createResourceInDB,
  createRoleInDB,
  getListResourceInDB,
  getListRoleInDB,
};
