const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const generateMessage = require('../generative/message');
const prisma = new PrismaClient();

const fs = require('fs');
const concat = require('concat-stream');

const copyDirectory = require('../helpers/copyDirectory');
const { fail } = require('assert');

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
          id: currentUser.id
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
  const { submissionId } = req.params;

  const submission = await prisma.submission.findUnique({
    where: { id: Number(submissionId) }
  });
  const { content } = submission;

  // Get the exercise that the submission is for, and get the testCode data from it
  const exercise = await prisma.exercise.findUnique({
    where: { id: Number(req.params.exerciseId) }
  });
  const { testCode } = exercise;

  // Generate a UUID
  const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Create a new folder in the runs directory of the project with the UUID
  const dir = `./runs/${uuid}`;
  fs.mkdirSync(dir, { recursive: true });

  // Create a new file in the new folder with the content of the submission
  fs.writeFileSync(`${dir}/submission.js`, content);

  // Makes a copy of the dockerfile in ../dockerfiles/javascript/Dockerfile to the new folder
  fs.copyFileSync('./dockerfiles/javascript/Dockerfile', `${dir}/Dockerfile`);

  // Makes a copy of the package.json file in ../dockerfiles/javascript/package.json to the new folder
  fs.copyFileSync('./dockerfiles/javascript/package.json', `${dir}/package.json`);

  // Makes a copy of the node_modules directory in ../dockerfiles/javascript/node_modules to the new folder
  // and should recursively copy all the contents of the node_modules directory
  copyDirectory('./dockerfiles/javascript/node_modules', `${dir}/node_modules`);

  // Create a __tests__ folder in the new folder, and write the testCode to a file in that folder
  fs.mkdirSync(`${dir}/__tests__`);
  fs.writeFileSync(`${dir}/__tests__/test.js`, testCode);

  // using the dockerode package, build a new image using the contents of the new folder
  const Docker = require('dockerode');
  const docker = new Docker();

  // build the image
  docker.buildImage({
    context: dir,
    src: ['Dockerfile', 'submission.js', '__tests__', 'package.json', 'node_modules']
  }, { t: uuid }, function (err, stream) {

    if (err) {
      console.log(0, err);

      // respond with the error
      return res.json({ error: err });
    }

    docker.modem.followProgress(stream, onFinished, onProgress);

    function onFinished(err, output) {
      console.log(err);
        if (err) {
            return res.json({ error: err });
        }
        // once the build is complete, run the image

        docker.run(uuid, ['npm', 'test'], new concat(function (output) {
          // The output parameter here will contain all the data that has been written to the stream
          result = output.toString();
        }), function (err, data, container) {
            if (err) {
                console.log(2, err);
                return res.json({ error: err });
            }

            const lines = result.split('\n').map(line => line.trim());

            // Regex to replace all the ansi escape codes
            const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

            const succeedingTests = lines.filter(
              line => line.includes('✓')
            ).map(
              l => l.replace(ansiRegex, '').trim().slice(2)
            ).map(l => ({ description: l, passing: true }))

            let failingResults = lines.filter(
              line => line.includes('●') || line.includes("Received:")
            ).map(
              l => l.replace(ansiRegex, '').replace(/●/g, '').replace(/Received:/g, '').trim()
            );

            let failingTests = [];
            for(let i = 0; i < failingResults.length; i += 2) {
              failingTests.push({
                description: failingResults[i],
                passing: false,
                received: failingResults[i+1]
              })
            }

            // remove the container
            container.remove(function (err, data) {
                if (err) {
                    return res.json({ error: err });
                }
                // remove the image
                docker.getImage(uuid).remove(function (err, data) {
                    if (err) {
                        return res.json({ error: err });
                    }
                    // remove the folder
                    fs.rmdirSync(dir, { recursive: true });
                    res.json(succeedingTests.concat(failingTests));
                });
            });
        });
    }

    function onProgress(event) {
      console.log(event);
    }
  });
});


module.exports = router;
