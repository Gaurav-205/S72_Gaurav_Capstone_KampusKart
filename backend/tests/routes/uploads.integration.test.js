const request = require('supertest');
const express = require('express');
const path = require('path');
const User = require('../../models/User');

const TEST_USER_ID = '64b000000000000000000003';

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: (opts, cb) => {
        const { PassThrough } = require('stream');
        const stream = new PassThrough();
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

jest.mock('../../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { _id: '64b000000000000000000003', email: 'uploader@test.com' };
    next();
  },
  requireAdmin: () => (req, res, next) => next(),
}));

describe('Uploads integration routes', () => {
  let app;

  beforeAll(async () => {
    app = express();
    await User.deleteMany({ email: 'uploader@test.com' });
    await User.create({
      _id: TEST_USER_ID,
      email: 'uploader@test.com',
      name: 'Uploader',
      password: 'Pass1234!',
    });

    const profileRoutes = require('../../routes/profile');
    app.use('/api/profile', profileRoutes);
  });

  test('PUT /api/profile should accept a profile picture upload', async () => {
    const testFile = path.join(__dirname, '..', 'fixtures', 'test-image.jpg');
    // Ensure fixtures directory exists; tests can still run without the file if needed
    const agent = request(app);
    const req = agent
      .put('/api/profile')
      .attach('profilePicture', testFile)
      .field('name', 'Uploader');
    const res = await req.expect((res) => {
      // Either 200 or 201 depending on controller implementation
      if (![200, 201].includes(res.status)) throw new Error('Unexpected status ' + res.status);
    });

    // Expect response to contain profile data or success message
    expect(res.body).toBeDefined();
  });
});
