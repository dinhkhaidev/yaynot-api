const { findTagByNameInDB } = require("../models/repositories/tag.repo");
const { tagModel, tagQuestionModel } = require("../models/tag.model");

class TagService {
  static async upsertTag({ name, questionId }) {
    // const tagRecord = await findTagByNameInDB(name);
    const normalize = name.trim().toLowerCase();
    console.log(normalize);
    const filter = { name },
      payload = {
        $setOnInsert: { name: normalize, displayName: `#${normalize}` },
        $inc: { questionCount: 1 },
      },
      options = { upsert: true, new: true };
    const { _id } = await tagModel.findOneAndUpdate(filter, payload, options);
    await TagService.createTagQuestionMap({ questionId, tagId: _id });
  }
  static async createTagQuestionMap({ questionId, tagId }) {
    return await tagQuestionModel.create({ questionId, tagId });
  }
}
module.exports = TagService;
