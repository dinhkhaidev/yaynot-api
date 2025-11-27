const swaggerAutogen = require("swagger-autogen");
const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/routes/index.js"];

// Swagger document config
const doc = {
  info: {
    version: "1.0.0",
    title: "YayNot API",
    description: "API documentation for YayNot social Q&A platform",
  },
  host: "yaynot-api.onrender.com", // Domain only, no scheme
  basePath: "/api/v1",
  schemes: ["https"], // Use https for production
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "JWT token with Bearer prefix",
    },
  },
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger docs generated!");
});
