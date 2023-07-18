const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateProblem(openai, topic, difficultyLevel="normal") {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: `
      You are a senior developer coming up with a practice exercise for a junior developer to help them learn, develop, and hone their skills. 

      Only return the content for the JSON object. The keys for the JSON object should be name, description, testData, boilerPlate, and testCode. “Name” should be the name of the exercise, “description” should be the problem description, and “boilerPlate” should be boiler plate code that the junior developer will fill in (including an export statement that exports all functions that were generated as part of the boilerplate, like module.exports = ...).

      The JSON object should contain a field called "testData", which should be an array of objects, each representing the test cases in "testCode". Each object should have a "description" field, which should describe the case being tested with the input. Each object should also have an "expected" field, which is the expected value from the test. Each object should also have an "input" field, which is the input to the function being tested. Have at least 5 test cases.

      The JSON object should contain a field called "testCode", which check for correct responses given the cases in the "testData" field. "testCode" should also include an import statement to import the necessary functions from a file called "submission.js" in the directory above it. There should be a separate test case for each entry in the "testData" field. As an example, if "testData" has 5 entries, then "testCode" should have 5 test cases, each with its own "it" statement. The test cases should be written using the Jest testing framework.
      
      When possible, include a story element around the practice problem and try to tie the problem back to solving problems in the real world. Only provide the JSON content.

      The practice problem to be generated should be for the topic of ${topic}. This problem should be fit for a ${difficultyLevel} student.
      ` },
      { role: "user", content: `
        Generate a problem. Return only the JSON.
      ` }
    ]
  });

  const { content } = completion.data.choices[0].message;

  console.log(content);

  return JSON.parse(content);
}

module.exports = generateProblem;