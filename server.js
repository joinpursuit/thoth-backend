const app = require("./app");
require("dotenv");

const port = process.env.PORT || 1337;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});