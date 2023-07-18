const { Configuration, OpenAIApi } = require("openai");
const generateProblem = require("./generative/problem");

const configuration = new Configuration({
  apiKey: process.env.OPENAPI_API_KEY
});
const openai = new OpenAIApi(configuration);

generateProblem(openai, "for loops").then(data => {
  console.log(data);
})