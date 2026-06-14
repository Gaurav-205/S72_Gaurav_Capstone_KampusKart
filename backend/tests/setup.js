const { MongoMemoryServer } = require('mongodb-memory-server');

// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';

// Increase Jest timeout for environments that may be slow to download binaries
if (typeof jest !== 'undefined' && jest.setTimeout) {
  jest.setTimeout(30000);
}

let mongoServer;
const mongoose = require('mongoose');

// If MONGODB_URI is provided (CI uses a service), prefer it. Otherwise, start an in-memory server.
beforeAll(async () => {
  const dbName = `kampuskart-test-${process.env.JEST_WORKER_ID || 'main'}`;
  const defaultLocalUri = `mongodb://127.0.0.1:27017/${dbName}`;

  if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = defaultLocalUri;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    // Fallback to MongoMemoryServer if local MongoDB is not running
    if (process.env.MONGODB_URI === defaultLocalUri) {
      try {
        mongoServer = await MongoMemoryServer.create();
        process.env.MONGODB_URI = mongoServer.getUri(dbName);
        await mongoose.connect(process.env.MONGODB_URI);
      } catch (innerErr) {
        console.error('Failed to start MongoMemoryServer fallback:', innerErr);
        throw innerErr;
      }
    } else {
      throw err;
    }
  }
});

afterAll(async () => {
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
