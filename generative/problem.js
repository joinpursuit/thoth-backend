const fs = require("fs");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateProblem(openai, topic, difficultyLevel="normal") {

  // Read file from miniTest in helpers directory above
  const framework = fs.readFileSync("./helpers/miniTest.js", "utf8");

  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      { role: "system", content: `  
      Your job is to generate a practice problem for a junior developer to help them learn, develop, and hone their skills.
  
      When possible, include a story element around the practice problem and try to tie the problem back to solving problems in the real world.
  
      For reference, a custom test framework is provided. The code for that is as follows:

      ${framework}

      Returns a JSON object. The keys for the JSON object should be name, description, testData, boilerPlate, and testCode. 
        - “Name” should be the name of the exercise
        - “description” should be the problem description
        - “boilerPlate” should be boiler plate code that the junior developer will fill in
        - "testData", which should be an array of objects. Each object should have a "description" field, which should describe the case being tested with the input. Each object should also have an "expected" field, which is the expected value from the test. Each object should also have an "input" field, which is the input to the function being tested. Have at least 5 test cases.
        - "testCode", which checks for correct responses given the cases in the "testData" field. The test cases MUST line up 1 to 1 with the data in testData. The test cases should be written using the framework provided. No requires should be necessary, we are running this code in a VM and providing the framework through a context. A results variable will be exposed through a VM context, so ensure the last line updates the "results" variable to the results of the tests.
    ` },
      { role: "user", content: `
        Please generate a practice problem based on the topic "${topic}" with a difficulty level of "${difficultyLevel}". Return only the JSON data.
      ` },
    ]
  });

  const { content } = completion.data.choices[0].message;

  console.log(content);

  // Hacky, but can't get GPT4 to not use backticks, so JSON.parse always fails
  const details = eval(`let val = ${content}; val;`);

  return details;
}

module.exports = generateProblem;