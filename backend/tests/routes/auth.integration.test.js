const request = require('supertest');
const express = require('express');
const userRepository = require('../../repositories/userRepository');

jest.mock('../../repositories/userRepository', () => ({
  findByEmail: jest.fn(),
  create: jest.fn()
}));

describe('Auth integration routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    const authRoutes = require('../../routes/auth');
    app.use('/api/auth', authRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/auth/signup should create user (flow stubbed)', async () => {
    const payload = { email: 'inttest@example.com', password: 'Pass1234!', name: 'Int Test' };
    const mockUser = {
      _id: '64b000000000000000000004',
      email: payload.email.toLowerCase(),
      name: payload.name
    };
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(mockUser);

    const res = await request(app).post('/api/auth/signup').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({
      email: payload.email.toLowerCase(),
      name: payload.name
    });
  });
});
