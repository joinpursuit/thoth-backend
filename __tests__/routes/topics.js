const request = require('supertest');
const express = require('express');
const topicRoutes = require('../../routes/topics');

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/topics', topicRoutes);

let testTopic;
let testModule;

beforeEach(async () => {
  testModule = await prisma.module.create({
    data: { name: 'Test Module' }
  });
  testTopic = await prisma.topic.create({
    data: { name: 'Test Topic', moduleId: testModule.id }
  });
});

afterEach(async () => {
  await prisma.module.delete({
    where: { id: testModule.id },
  });
});

describe('GET /topics', () => {
  it('responds with a json containing all topics', async () => {
    const res = await request(app).get('/topics');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('length');
  });
});

describe('GET /topics/:id', () => {
  it('responds with a json containing a single topic', async () => {
    const res = await request(app).get(`/topics/${testTopic.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', testTopic.id);
  });
});

describe('POST /topics', () => {
  it('responds with the json of the created topic', async () => {
    const res = await request(app).post('/topics').send({
      name: 'New Topic',
      moduleId: testModule.id,
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'New Topic');
  });
});

describe('PUT /topics/:id', () => {
  it('responds with the json of the updated topic', async () => {
    const res = await request(app).put(`/topics/${testTopic.id}`).send({
      name: 'Updated Topic',
      moduleId: testModule.id
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Updated Topic');
  });
});

describe('DELETE /topics/:id', () => {
  it('responds with a message confirming the deletion', async () => {
    const res = await request(app).delete(`/topics/${testTopic.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual(`Topic with ID ${testTopic.id} has been deleted.`);
  });
});

describe('GET /topics/:id/exercises', () => {
  let testModule;
  let testTopic;
  let testExercise1;
  let testExercise2;

  beforeEach(async () => {
    testModule = await prisma.module.create({ data: { name: "Test Module" } });
    testTopic = await prisma.topic.create({
      data: { name: 'Test Topic', module: { connect: { id: testModule.id } } },
    });

    testExercise1 = await prisma.exercise.create({
      data: {
        name: 'Test Exercise 1',
        content: 'Exercise Content 1',
        level: 'Developing',
        topic: { connect: { id: testTopic.id } },
      },
    });

    testExercise2 = await prisma.exercise.create({
      data: {
        name: 'Test Exercise 2',
        content: 'Exercise Content 2',
        level: 'Developing',
        topic: { connect: { id: testTopic.id } },
      },
    });
  });

  afterEach(async () => {
    await prisma.exercise.deleteMany();
    await prisma.topic.deleteMany();
  });

  it('should return all exercises for a given topic', async () => {
    const res = await request(app).get(`/topics/${testTopic.id}/exercises`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: testExercise1.id, name: 'Test Exercise 1' }),
        expect.objectContaining({ id: testExercise2.id, name: 'Test Exercise 2' }),
      ])
    );
  });

  it('should return 404 when topic does not exist', async () => {
    const res = await request(app).get(`/topics/99999/exercises`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({ error: `Topic with ID 99999 not found` });
  });
});

describe('POST /topics/:id/exercises', () => {
  let testTopic;
  let testModule;

  beforeEach(async () => {
    testModule = await prisma.module.create({ data: { name: "Test Module" } })
    testTopic = await prisma.topic.create({
      data: { name: 'Test Topic', module: { connect: { id: testModule.id } } },
    });
  });

  afterEach(async () => {
    await prisma.exercise.deleteMany();
    await prisma.module.delete({ where: { id: testModule.id } });
  });

  it('should create a new exercise for a given topic', async () => {
    const res = await request(app)
      .post(`/topics/${testTopic.id}/exercises`)
      .send({
        name: 'Test Exercise',
        content: 'Test Content',
        level: 'Developing',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual('Test Exercise');
    expect(res.body.content).toEqual('Test Content');
    expect(res.body.level).toEqual('Developing');
  });

  it('should return 400 when data is missing', async () => {
    const res = await request(app).post(`/topics/${testTopic.id}/exercises`);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: 'Could not create exercise' });
  });
});






