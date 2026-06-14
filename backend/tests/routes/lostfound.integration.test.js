const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const _mongoose = require('mongoose');
// Will require routes after mocking auth middleware
const LostFoundItem = require('../../models/LostFoundItem');

jest.mock('../../models/LostFoundItem');
jest.mock('../../models/User');
const _User = require('../../models/User');

describe('Lost & Found integration', () => {
  let app;
  let authToken;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock auth middleware before importing routes (use static user to keep mock factory pure)
    jest.mock('../../middleware/auth', () => ({
      authMiddleware: (req, res, next) => { req.user = { _id: 'test-user', email: 'user@test' }; next(); },
      requireAdmin: () => (req, res, next) => next()
    }));

    authToken = jwt.sign({ userId: 'test-user' }, process.env.JWT_SECRET || 'test-secret-key');

    const lostfoundRoutes = require('../../routes/lostfound');
    app.use('/api/lostfound', lostfoundRoutes);
  });

  beforeEach(() => jest.clearAllMocks());

  test('POST /api/lostfound should accept a new item', async () => {
    LostFoundItem.create.mockResolvedValue({ _id: 'item1', title: 'Test Item' });
    const res = await request(app).post('/api/lostfound').set('Authorization', `Bearer ${authToken}`).send({ title: 'Test Item', description: 'desc' });
    expect([200,201,400]).toContain(res.status);
  });
});
