const express = require('express');
const { PrismaClient } = require("@prisma/client");
const openai = require("../openai");

const prisma = new PrismaClient();

const router = express.Router();

router.get('/', async (req, res) => {
  const topics = await prisma.topic.findMany();
  res.json(topics);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const topic = await prisma.topic.findUnique({
    where: { id: Number(id) },
  });

  if (topic) {
    res.json(topic);
  } else {
    res.status(404).send(`Topic with ID ${id} not found.`);
  }
});

router.post('/', async (req, res) => {
  const { name, moduleId } = req.body;
  const newTopic = await prisma.topic.create({
    data: { name, moduleId: Number(moduleId) },
  });

  res.status(201).json(newTopic);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const updatedTopic = await prisma.topic.update({
    where: { id: Number(id) },
    data: { name },
  });

  res.json(updatedTopic);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  await prisma.topic.delete({
    where: { id: Number(id) },
  });

  res.status(200).send(`Topic with ID ${id} has been deleted.`);
});

router.get('/:id/exercises', async (req, res) => {
  const { id } = req.params;

  try {

    const user = await prisma.user.findUnique({ where: { firebaseId: req.user.uid } });

    const topic = await prisma.topic.findUnique({
      where: { id: Number(id) },
      include: { 
        exercises: {
          where: { userId: user.id },
          include: {
            submissions: {
              orderBy: {
                id: 'desc', // Assuming 'createdAt' is a field in 'Submission'
              },
              take: 1,
            },
          },
        }, 
      },
    });

    console.log(topic);

    if (topic) {
      res.status(200).json(topic.exercises.pop());
    } else {
      res.status(404).json({ error: `Topic with ID ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post("/:id/update", async (req, res) => {
  const { currentCode } = req.body;
  const { id } = req.params;
  const topic = await prisma.topic.findUnique({ where: { id: Number(id) }, include: { exercises: true } });
  const exercise = topic.exercises.pop();

  await prisma.exercise.update({ where: { id: exercise.id }, data: { currentWork: currentCode } });

  res.status(200).json({});
})

router.post("/:id/messages", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { email: "johndoe@example.com" } });
  const topic = await prisma.topic.findUnique({ where: { id: Number(id) }, include: { exercises: true } });
  const exercise = topic.exercises.pop();
  const exerciseId = exercise.id;
  const { content } = req.body;

  const newChatMessage = await prisma.chatMessage.create({
    data: {
      content,
      user: { connect: { id: user.id } },
      exercise: { connect: { id: exerciseId } },
      isHuman: true
    },
  });

  const messages = await prisma.chatMessage.findMany({ where: { exerciseId } });
  const formatted = messages.map(m => ({ role: m.isHuman ? "user" : "assistant", content: m.content }));

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: `
        You are a helpful teaching assistant tasked with helping a student solve a programming problem. Do not explicitly provide the answers to the student, but guide the student to the correct answer by asking guiding questions. 
        
        The following is the question the student is attempting to answer: 
        
        ${exercise.content}
        
        The student's current code is: 
        
        ${exercise.currentWork}
        
        The student's code should satisfy the requirements defined by the question the student is trying to answer. When a student answers a question correctly, ensure that the student has written the corresponding code that matches their answer.` 
      },
      ...formatted
    ]
  });

  const textData = completion.data.choices[0].message.content;

    const aiMessage = await prisma.chatMessage.create({
      data: { 
        content: textData,
        user: { connect: { id: user.id } },
        exercise: { connect: { id: exerciseId } },
        isHuman: false
      }
    });

    res.json(aiMessage);
})

module.exports = router;
