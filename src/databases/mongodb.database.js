const mongoose = require("mongoose");
const {
  db: { userMongodb, passwordMongodb },
} = require("../configs/mongodb.config");
const stringUrl = process.env.URL_MONGODB;

//singleton
class Mongodb {
  constructor() {
    this.connect();
  }
  async connect() {
    try {
      await mongoose.connect(stringUrl, {
        maxPoolSize:
          process.env.NODE_ENV === "developer"
            ? parseInt(process.env.POOL_SIZE_MONGODB_DEV)
            : parseInt(process.env.POOL_SIZE_MONGODB_PRODUCTION),
      });
      console.log("Connect mongodb success!");
    } catch (error) {
      console.log("Not connect to mongodb!", error);
    }
  }
  static getInstances() {
    if (!Mongodb.instance) {
      Mongodb.instance = new Mongodb();
    }
    return Mongodb.instance;
  }
}
const mongodbInstance = Mongodb.getInstances();
module.exports = mongodbInstance;
