const request = require('supertest');
const app = require('../../app'); // Assuming you're testing against your Express app
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let testChatMessage;
let testUser;
let testExercise;
let testModule;
let testTopic;

beforeAll(async () => {
  testUser = await prisma.user.create({
    data: { 
      email: 'test@example.com', 
      password: 'testpassword', 
      level: 'Developing' 
    }
  });

  testModule = await prisma.module.create({
    data: {
      name: "Test Module"
    }
  });

  testTopic = await prisma.topic.create({
    data: {
      name: "Test Topic",
      module: { connect: { id: testModule.id } }
    }
  })

  testExercise = await prisma.exercise.create({
    data: { 
      name: 'Test Exercise',
      content: 'Test Content',
      level: 'Developing',
      topic: { connect: { id: testTopic.id } }
    }
  });
});

beforeEach(async () => {
  testChatMessage = await prisma.chatMessage.create({
    data: { 
      content: 'Test Message', 
      user: { connect: { id: testUser.id } }, 
      exercise: { connect: { id: testExercise.id } } 
    }
  });
});

afterEach(async () => {
  await prisma.chatMessage.deleteMany();
});

afterAll(async () => {
  await prisma.exercise.deleteMany();
  await prisma.user.deleteMany();
  await prisma.module.deleteMany();
  await prisma.$disconnect();
});

// Tests go here

// Test GET all chat messages
test('GET /api/chatMessages', async () => {
  const res = await request(app)
    .get('/api/chatMessages')
    .expect(200);
  expect(res.body.length).toBeGreaterThan(0);
});

// Test GET a specific chat message
test('GET /api/chatMessages/:id', async () => {
  const res = await request(app)
    .get(`/api/chatMessages/${testChatMessage.id}`)
    .expect(200);
  expect(res.body.content).toEqual('Test Message');
});

// Test POST a new chat message
test('POST /api/chatMessages', async () => {
  const res = await request(app)
    .post('/api/chatMessages')
    .send({
      content: 'New Message',
      userId: testUser.id,
      exerciseId: testExercise.id
    })
    .expect(200);
  expect(res.body.content).toEqual('New Message');
});

// Test PUT (update) a chat message
test('PUT /api/chatMessages/:id', async () => {
  const res = await request(app)
    .put(`/api/chatMessages/${testChatMessage.id}`)
    .send({
      content: 'Updated Message',
      userId: testUser.id,
      exerciseId: testExercise.id
    })
    .expect(200);
  expect(res.body.content).toEqual('Updated Message');
});

// Test DELETE a chat message
test('DELETE /api/chatMessages/:id', async () => {
  const res = await request(app)
    .delete(`/api/chatMessages/${testChatMessage.id}`)
    .expect(200);
  expect(res.body.id).toEqual(testChatMessage.id);
});
