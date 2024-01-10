const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post("/create", async (req, res) => {
  const { firebaseId, email } = req.body;
  
  // Temporary to give new users access to a test class.
  // const demoClass = await prisma.class.findFirst({ where: { name: "Pursuit Alpha Test" } });
  
  let user = await prisma.user.findUnique({ where: { email } });
  let membership;

  if(user) {
    // membership = await prisma.classMembership.findUnique({ 
    //   where: { userId_classId: { userId: user.id, classId: demoClass.id }} 
    // });
  }
  else {
    user = await prisma.user.create({
      data: {
        email, firebaseId
      }
    });
  }

  // TODO: Remove this once we have a real login system.
  // if(!membership) {
  //   membership = await prisma.classMembership.create({
  //     data: {
  //       user: { connect: { id: user.id } },
  //       associatedClass: { connect: { id: demoClass.id } }
  //     }
  //   });
  // }
  res.json(user);
})

module.exports = router;