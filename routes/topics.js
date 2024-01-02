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

module.exports = router;
