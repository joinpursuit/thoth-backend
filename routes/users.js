const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  const { firebaseId } = req.body;
  const user = await prisma.user.findUnique({ where: { firebaseId } });
  if(user) {
    return res.json(user);
  }
  res.status(404).json({ error: "User not found." });
})

router.post("/create", async (req, res) => {
  const { firebaseId, email } = req.body;
  
  // Temporary to give new users access to a test class.
  // const demoClass = await prisma.class.findFirst({ where: { name: "Pursuit Alpha Test" } });
  
  let user = await prisma.user.findUnique({ where: { firebaseId } });

  if(user) {
    return res.json(user);
  }
  else {
    user = await prisma.user.create({
      data: {
        email,
        firebaseId
      }
    });
  }

  res.json(user);
})

module.exports = router;