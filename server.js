require("dotenv").config();
const app = require("./src/app");
const port = process.env.PORT || 9999;
app.listen(port, () => {
  console.log(`Yaynot app listening on port ${port}`);
});
process.on("SIGINT", () => {
  console.log("Disconnect");
});
