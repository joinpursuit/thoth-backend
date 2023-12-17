function parseHistory(chatHistory = []) {
  return chatHistory.map(c => {
    if(c.userId || c.role === "user") {
      return { role: "user", content: c.content }
    }
    return { role: "assistant", content: c.content }
  });
}

async function generateMessage(openai, exercise, submission, chatHistory=[]) {
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      { role: "system", content: `
      You are a senior developer advising a junior developer on a programming exercise. Here is the exercise in question:

      ${exercise.content}

      And here is the current attempt at a solution by the junior developer:

      ${submission.content}

      DO NOT immediately give away the answer to the question. Instead, try to guide the junior developer to the answer by asking questions and giving hints.
      ` },
      ...parseHistory(chatHistory)
    ]
  });

  const { content } = completion.data.choices[0].message;

  return content;
}

module.exports = generateMessage;