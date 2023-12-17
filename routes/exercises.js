const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const generateMessage = require('../generative/message');
const prisma = new PrismaClient();

const vm = require('vm');

// GET all exercises
router.get('/', async (req, res) => {
  const exercises = await prisma.exercise.findMany();
  res.json(exercises);
});

// GET a single exercise by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const currentUser = await prisma.user.findUnique({
    where: { firebaseId: req.user.uid }
  });

  const exercise = await prisma.exercise.findUnique({
    where: { id: Number(id) },
    include: {
      submissions: {
        where: {
          userId: currentUser.id
        }
      }
    }
  });
  res.json(exercise);
});

// PUT (update) an exercise
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, content, level, topicId } = req.body;
  try {
    const updatedExercise = await prisma.exercise.update({
      where: { id: Number(id) },
      data: {
        name,
        content,
        level,
        topic: {
          connect: { id: topicId },
        },
      },
    });
    res.json(updatedExercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// DELETE an exercise
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.exercise.delete({
    where: { id: Number(id) },
  });
  res.json({ message: `Exercise ${id} has been deleted` });
});


router.post('/:exerciseId/submissions', async (req, res) => {
  try {
    // You can use this user ID to fetch or create a user in your application database.
    const user = await prisma.user.findUnique({ where: { firebaseId: req.user.uid } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { exerciseId } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id: Number(exerciseId) }
    });

    // Create a new submission
    const submission = await prisma.submission.create({
      data: {
        exerciseId: Number(exerciseId),
        userId: user.id,
        content: exercise.boilerplate,
        passing: false
      }
    });

    // Return the new submission to the client
    return res.json(submission);
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return res.status(500).json({ error: 'Error verifying ID token' });
  }
});

router.put('/:exerciseId/submissions/:submissionId', async (req, res) => {
  const { content } = req.body;
  const { submissionId } = req.params;

  const sub = await prisma.submission.update({
    data: {
      content
    },
    where: {
      id: Number(submissionId)
    }
  });

  res.json(sub);
});

// Get all messages for a given submission belonging to an exercise
router.get('/:exerciseId/submissions/:submissionId/messages', async (req, res) => {
  try {
    const { submissionId } = req.params;

    const messages = await prisma.chatMessage.findMany({
      where: {
        submissionId: Number(submissionId)
      }
    });

    return res.json(messages);
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return res.status(500).json({ error: 'Error verifying ID token' });
  }
});

router.post('/:exerciseId/submissions/:submissionId/messages', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseId: req.user.uid } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { submissionId, exerciseId } = req.params;
    const { content } = req.body;

    // Create a new chat message
    const message = await prisma.chatMessage.create({
      data: {
        content: content,
        userId: user.id,
        submissionId: Number(submissionId)
      }
    });

    const exercise = await prisma.exercise.findUnique({
      where: {
        id: Number(exerciseId)
      },
      include: {
        submissions: {
          where: {
            id: Number(submissionId)
          }
        }
      }
    });

    const currentMessages = await prisma.chatMessage.findMany({
      where: {
        submissionId: Number(submissionId)
      }
    });

    const response = await generateMessage(req.openai, exercise, exercise.submissions.pop(), currentMessages);

    const respMessage = await prisma.chatMessage.create({
      data: {
        content: response,
        userId: null,
        submissionId: Number(submissionId)
      }
    });

    // Return the new message to the client
    return res.json(respMessage);
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return res.status(500).json({ error: 'Error verifying ID token' });
  }
});

// A route for a given submission in relation to the exercise meant to run tests for that submission
router.post('/:exerciseId/submissions/:submissionId/run', async (req, res) => {
  const submissionId = req.params.submissionId;
  const exerciseId = req.params.exerciseId;

  // Get the submission from the database
  const submission = await prisma.submission.findUnique({
    where: { id: Number(submissionId) }
  });

  const exercise = await prisma.exercise.findUnique({
    where: { id: Number(exerciseId) }
  });

  const { content } = submission;
  const { testCode } = exercise;

  const fullFile = `${content}\n${testCode}`;

  const sandbox = {
    TestFramework: require("../helpers/miniTest"),
    testData: JSON.parse(exercise.testData),
    results: null,
  }
  const context = new vm.createContext(sandbox);
  
  const script = new vm.Script(fullFile);
  script.runInContext(context);

  const allPassed = sandbox.results.passed.length === exercise.testData.length;
  if(allPassed) {
    await prisma.submission.update({
      where: {
        id: Number(submissionId)
      },
      data: {
        passing: true
      }
    });
  }

  res.json(sandbox.results);
});


module.exports = router;
