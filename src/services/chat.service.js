const { createConventionInDB } = require("../models/repositories/chat.repo");

class ChatService {
  static async createConvention(payload) {
    return createConventionInDB(payload);
  }
}
module.expotrs = ChatService;
