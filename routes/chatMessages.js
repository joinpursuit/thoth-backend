const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all chat messages
router.get('/', async (req, res) => {
  try {
    const chatMessages = await prisma.chatMessage.findMany();
    res.json(chatMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a specific chat message
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const chatMessage = await prisma.chatMessage.findUnique({ where: { id: Number(id) } });
    res.json(chatMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new chat message
router.post('/', async (req, res) => {
  const { content, userId, exerciseId } = req.body;
  try {
    const newChatMessage = await prisma.chatMessage.create({
      data: {
        content,
        user: { connect: { id: userId } },
        exercise: { connect: { id: exerciseId } },
      },
    });
    res.json(newChatMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT (update) a chat message
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { content, userId, exerciseId } = req.body;
  try {
    const updatedChatMessage = await prisma.chatMessage.update({
      where: { id: Number(id) },
      data: {
        content,
        user: { connect: { id: userId } },
        exercise: { connect: { id: exerciseId } },
      },
    });
    res.json(updatedChatMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a chat message
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedChatMessage = await prisma.chatMessage.delete({ where: { id: Number(id) } });
    res.json(deletedChatMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
