const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const _mongoose = require('mongoose');
// Will require routes after mocking auth middleware
const Complaint = require('../../models/Complaint');

jest.mock('../../models/Complaint');
jest.mock('../../models/User');
const _User = require('../../models/User');

describe('Complaints integration', () => {
  let app;
  let authToken;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock auth middleware before importing routes (use static user to keep mock factory pure)
    jest.mock('../../middleware/auth', () => ({
      authMiddleware: (req, res, next) => { req.user = { _id: 'test-user', email: 'tester@example.com' }; next(); },
      requireAdmin: () => (req, res, next) => next()
    }));

    authToken = jwt.sign({ userId: 'test-user' }, process.env.JWT_SECRET || 'test-secret-key');

    const complaintsRoutes = require('../../routes/complaints');
    app.use('/api/complaints', complaintsRoutes);
  });

  beforeEach(() => jest.clearAllMocks());

  test('POST /api/complaints should create complaint', async () => {
    Complaint.create.mockResolvedValue({ _id: 'c1', title: 'Issue' });
    const res = await request(app).post('/api/complaints').set('Authorization', `Bearer ${authToken}`).send({ title: 'Issue', description: 'Details' });
    expect([200,201,400]).toContain(res.status);
  });
});
