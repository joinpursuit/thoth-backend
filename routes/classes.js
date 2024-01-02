const express = require('express');
const router = express.Router();
const { PrismaClient, UserLevel } = require('@prisma/client');
const generateProblem = require('../generative/problem');
const prisma = new PrismaClient();

// Get all classes where the user is a member
router.get('/memberships', async (req, res) => {
  try {
    const memberships = await prisma.classMembership.findMany({
      where: {
        userId: req.user.id, // Assuming req.user.id contains the ID of the authenticated user
      },
      include: {
        associatedClass: true, // Include the associated class details
      },
    });

    res.json(memberships.map(m => m.associatedClass));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Something went wrong while retrieving class memberships' });
  }
});

// Get all class invitations for the user
router.get('/invitations', async (req, res) => {
  try {
    const invitations = await prisma.classInvitation.findMany({
      where: {
        email: req.user.email, // Assuming req.user.email contains the email of the authenticated user
      },
      include: {
        associatedClass: true, // Include the associated class details
      },
    });

    res.json(invitations.map(i => i.associatedClass));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Something went wrong while retrieving class invitations' });
  }
});

router.get('/:classId/modules', async (req, res) => {
  const { classId } = req.params;

  try {
    const modules = await prisma.module.findMany({
      where: { classId: Number(classId) },
      orderBy: {
        id: 'asc', // Order by id in ascending order
      },
    });

    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while fetching the modules for the class' });
  }
});

router.get('/:classId/modules/:moduleId/topics', async (req, res) => {
  const { classId, moduleId } = req.params;

  try {
    const results = await prisma.module.findMany({
      where: { 
        id: Number(moduleId), 
        classId: Number(classId) 
      },
      include: {
        topics: {
          orderBy: {
            id: 'asc'
          }
        }
      }
    });

    res.status(200).json(results[0].topics);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while retrieving the topics' });
  }
});

router.get('/:classId/modules/:moduleId/topics/:topicId/exercises', async (req, res) => {
  const { classId, moduleId, topicId } = req.params;

  try {
    // Retrieve the exercises related to the given topic
    const exercises = await prisma.exercise.findMany({
      where: {
        topicId: Number(topicId),
        // Add additional where clauses if exercises need to be filtered by classId and moduleId
      },
      include: {
        submissions: {
          orderBy: {
            id: 'desc'
          },
          take: 1,
        },
      }
    });

    // Send the exercises data as a response
    res.status(200).json(exercises);
  } catch (error) {
    console.error('Failed to fetch exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

router.post('/:classId/modules/:moduleId/topics/:topicId/exercises', async (req, res) => {
  try {
    const uid = req.user.uid; // The user ID associated with the currently signed-in user

    // You can use this user ID to fetch or create a user in your application database.
    // For the purpose of this example, let's assume that your user model is named "User"

    const user = await prisma.user.findUnique({ where: { firebaseId: uid } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const topic = await prisma.topic.findUnique({ where: { id: Number(req.params.topicId) } });

    if(!topic) {
      return res.status(404).json({ error: "Topic not found" })
    }

    const problem = await generateProblem(req.openai, topic.name, UserLevel.Developing);

    const nextProblem = await prisma.exercise.create({
      data: {
        name: problem.name,
        content: problem.description,
        testData: JSON.stringify(problem.testData),
        level: UserLevel.Developing,
        boilerplate: problem.boilerPlate,
        testCode: problem.testCode,
        topic: {
          connect: {
            id: Number(req.params.topicId)
          }
        },
        user: { connect: { id: user.id } }
      }
    });

    // Create a submission for the current user to this exercise
    await prisma.submission.create({
      data: {
        passing: false,
        exerciseId: nextProblem.id,
        userId: user.id,
        files: {
          create: {
            fileName: 'index.js',
            content: '',
            isFolder: false,
          },
        }
      }
    });
    // Return the user ID to the client
    return res.json(nextProblem);
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return res.status(500).json({ error: 'Error verifying ID token' });
  }
});


module.exports = router;