const swaggerAutogen = require("swagger-autogen");
const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/routes/index.js"];

swaggerAutogen(outputFile, endpointsFiles).then(() => {
  console.log("Swagger docs generated!");
});
