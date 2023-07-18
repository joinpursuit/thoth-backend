const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Get all Modules
router.get('/', async (req, res) => {
  try {
    const modules = await prisma.module.findMany();
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get a single Module by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { firebaseId } = req.query;
  console.log(req.query)
  try {
    const module = await prisma.module.findUnique({ 
      where: { id: parseInt(id) },
      include: { topics: true }
    });
    const user = await prisma.user.findUnique({
      where: { firebaseId }
    });
    const levels = await prisma.userTopic.findMany({
      where: {
        user_id: user.id,
        topic_id: {
          in: module.topics.map(t => t.id)
        }
      }
    });
    console.log(levels)
    if (module) {
      res.status(200).json({module, levels});
    } else {
      res.status(404).json({ error: "Module not found" });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Create a new Module
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const newModule = await prisma.module.create({ data: { name } });
    res.status(201).json(newModule);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Update a Module by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedModule = await prisma.module.update({ 
      where: { id: parseInt(id) }, 
      data: { name } 
    });
    res.status(200).json(updatedModule);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Delete a Module by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedModule = await prisma.module.delete({ where: { id: parseInt(id) } });
    res.status(200).json(deletedModule);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
