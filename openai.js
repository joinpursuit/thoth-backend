const dotenv = require("dotenv");
const { Configuration, OpenAIApi } = require("openai");
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAPI_API_KEY
});

const openai = new OpenAIApi(configuration);

module.exports = openai;