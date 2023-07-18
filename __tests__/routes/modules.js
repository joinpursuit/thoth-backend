const request = require('supertest');
const express = require('express');
const moduleRoutes = require('../../routes/modules');
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const app = require("../../app");

describe('Module Router', () => {
  let testModule;

  beforeEach(async () => {
    testModule = await prisma.module.create({
      data: { name: 'Test Module' },
    });
  });

  afterEach(async () => {
    const moduleExists = await prisma.module.findUnique({
      where: { id: testModule.id },
    });

    if (moduleExists) {
      await prisma.module.delete({
        where: { id: testModule.id },
      });
    }
});

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET / - should return all modules', async () => {
    const res = await request(app).get('/api/modules');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /:id - should return a single module', async () => {
    const res = await request(app).get(`/api/modules/${testModule.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual(testModule.name);
  });

  it('POST / - should create a new module', async () => {
    const res = await request(app).post('/api/modules').send({ name: 'New Test Module' });
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual('New Test Module');
  });

  it('PUT /:id - should update an existing module', async () => {
    const res = await request(app).put(`/api/modules/${testModule.id}`).send({ name: 'Updated Test Module' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual('Updated Test Module');
  });

  it('DELETE /:id - should delete an existing module', async () => {
    const res = await request(app).delete(`/api/modules/${testModule.id}`);
    expect(res.statusCode).toEqual(200);
  });
});
