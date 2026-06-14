const request = require('supertest');
const express = require('express');
const Chat = require('../../models/Chat');
const User = require('../../models/User');

const TEST_USER_ID = '64b000000000000000000002';

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: (opts, cb) => {
        const { PassThrough } = require('stream');
        const stream = new PassThrough();
        // call callback after stream finishes
        stream.on('finish', () =>
          cb(null, {
            secure_url: 'https://res.cloudinary.com/test/image.jpg',
            public_id: 'test-id',
          })
        );
        return stream;
      },
      destroy: jest.fn(),
    },
    config: jest.fn(),
  },
}));

// routes will be required after mocking auth middleware in beforeAll

jest.mock('../../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { _id: '64b000000000000000000002', email: 'test@test.com' };
    next();
  },
  requireAdmin: () => (req, res, next) => next(),
}));

describe('Chat integration routes', () => {
  let app;

  beforeAll(async () => {
    app = express();
    app.use(express.json());

    await User.deleteMany({ email: 'test@test.com' });
    await User.create({
      _id: TEST_USER_ID,
      email: 'test@test.com',
      name: 'Test User',
      password: 'Pass1234!',
    });

    const chatRoutes = require('../../routes/chat');
    app.use('/api/chat', chatRoutes);
  });

  beforeEach(async () => {
    await Chat.deleteMany({});
  });

  test('POST /api/chat/messages should create a chat message', async () => {
    const res = await request(app)
      .post('/api/chat/messages')
      .set('Content-Type', 'application/json')
      .send({ message: 'Hello from integration test' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Hello from integration test');
    const senderId = res.body.sender && (res.body.sender._id || res.body.sender);
    expect(senderId).toBe(TEST_USER_ID);
    const saved = await Chat.findOne({ message: 'Hello from integration test' }).lean();
    expect(saved).toBeTruthy();
    expect(saved.message).toBe('Hello from integration test');
    expect(saved.sender.toString()).toBe(TEST_USER_ID);
  });
});
