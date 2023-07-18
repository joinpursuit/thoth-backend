const request = require('supertest');
const app = require('../../app'); // Your express app
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let testExercise;
let testTopic;
let testModule;

beforeEach(async () => {

  testModule = await prisma.module.create({
    data: { name: "Test Module" }
  });

  testTopic = await prisma.topic.create({
    data: { name: "Test Topic", moduleId: testModule.id }
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


afterEach(async () => {
  await prisma.module.delete({
    where: { id: testModule.id }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Exercise Routes', () => {
  it('should get all exercises', async () => {
    const res = await request(app).get('/api/exercises/');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
  });

  it('should get a single exercise', async () => {
    const res = await request(app).get(`/api/exercises/${testExercise.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual('Test Exercise');
  });

  it('should create a new exercise', async () => {
    const res = await request(app)
      .post('/api/exercises')
      .send({ 
        name: 'New Exercise', 
        content: 'New Content', 
        level: 'Developing', 
        topicId: testTopic.id
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual('New Exercise');
  });
  

  it('should update an exercise', async () => {
    const res = await request(app)
      .put(`/api/exercises/${testExercise.id}`)
      .send({ 
        name: 'Updated Exercise', 
        content: 'Updated Content', 
        level: 'Proficient', 
        topicId: testTopic.id
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual('Updated Exercise');
  });
  

  it('should delete an exercise', async () => {
    const res = await request(app).delete(`/api/exercises/${testExercise.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: `Exercise ${testExercise.id} has been deleted` });
  });
});
