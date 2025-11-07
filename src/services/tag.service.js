const { NotFoundError } = require("../core/error.response");
const questionModel = require("../models/question.model");
const slugify = require("slugify");
const {
  findTagByNameInDB,
  findTagByQuestionId,
} = require("../models/repositories/tag.repo");
const { tagModel, tagQuestionModel } = require("../models/tag.model");

class TagService {
  static async upsertTag({ name, questionId }) {
    // const tagRecord = await findTagByNameInDB(name);
    const normalize = name.trim().toLowerCase();
    const filter = { name: normalize },
      payload = {
        $setOnInsert: {
          name: normalize,
          displayName: `#${normalize}`,
          slug: slugify(normalize),
        },
        $inc: { questionCount: 1 },
      },
      options = { upsert: true, new: true };
    const { _id } = await tagModel.findOneAndUpdate(filter, payload, options);
    await TagService.createTagQuestionMap({ questionId, tagId: _id });
  }
  static async createTagQuestionMap({ questionId, tagId }) {
    return await tagQuestionModel.create({ questionId, tagId });
  }
  static async getTagByName(slug, page, limit) {
    const tagRecord = await tagModel
      .findOne({ name: slug, isPublish: true })
      .select(" -isDeleted -isFlag -isPublish -__v");
    if (!tagRecord)
    {throw new NotFoundError("Tag not exists. Let create with new hashtag!");}
    const skip = page * limit;
    const tagMappings = await tagQuestionModel
      .find({ tagId: tagRecord._id })
      .limit(limit)
      .skip(skip)
      .select("questionId -_id ")
      .sort({ ctime: -1 })
      .lean();
    const questionIdValues = tagMappings.map((q) => {
      return q.questionId;
    });
    const getQuestionByListId = await questionModel
      .find({
        _id: { $in: questionIdValues },
        status: "publish",
        isDeleted: false,
        moderationStatus: "ok",
      })
      .select("title content image userId")
      .lean();
    //handle return && handle slug...
    return {
      tags: tagRecord,
      questions: getQuestionByListId,
    };
  }
  static async publicTagStatus({ questionId, type }) {
    //handle publish tag when public question
    const tagIdRecord = await findTagByQuestionId(questionId);
    tagIdRecord.forEach(async (tag) => {
      const tagId = tag.tagId;
      await tagModel.updateOne({ _id: tagId }, { isPublish: type });
    });
  }
  //handle cronjob if question in tag = null
}
module.exports = TagService;
