const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseHistory(chatHistory = []) {
  return chatHistory.map(c => {
    if(c.userId || c.role === "user") {
      return { role: "user", content: c.content }
    }
    return { role: "assistant", content: c.content }
  });
}

async function generateMessage(openai, exercise, submission, chatHistory=[]) {
  
  const files = await prisma.file.findMany({
    where: {
      submissionId: submission.id
    }
  });

  const submissionContent = files.map(f => `// ${f.fileName}\n\n${f.content}`).join("\n");

  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      { role: "system", content: `
      You are a senior developer advising a junior developer on a programming exercise. Here is the exercise in question:

      -- Exercise Start --
      ${exercise.content}
      -- Exercise End --

      And here is the current attempt at a solution by the junior developer:

      -- Submission Start --
      ${submissionContent}
      -- Submission End --

      The submission is formatted to allow for the possibility of multiple files. Each file will start with a comment at the root level that says what fileName it is. For example, if the submission has two files, one called "index.js" and one called "utils.js", the submission will look like this:

      \`\`\`
      // index.js
      console.log("Hey!");

      // utils.js
      export function add(a, b) {
        return a + b;
      }
      \`\`\`

      DO NOT immediately give away the answer to the question. Instead, try to guide the junior developer to the answer by asking questions and giving hints.

      When the user discusses "their work" or "their submission", it refers to the submission above. When the user discusses "the exercise", it refers to the exercise above.

      You have context into the user's submission through the details above. Do NOT say that it is inaccessible or you're bound by limitations, it's literally in the text above.
      ` },
      ...parseHistory(chatHistory)
    ]
  });

  const { content } = completion.data.choices[0].message;

  return content;
}

module.exports = generateMessage;