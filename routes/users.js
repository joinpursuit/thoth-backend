const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post("/create", async (req, res) => {
  const { firebaseId, email } = req.body;
  const user = await prisma.user.findUnique({ where: { firebaseId } });
  if(user) {
    res.json(user);
  }
  else {
    const nextUser = await prisma.user.create({
      data: {
        email, firebaseId
      }
    });
    res.json(nextUser);
  }
})

module.exports = router;