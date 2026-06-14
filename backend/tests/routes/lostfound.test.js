const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const LostFoundItem = require('../../models/LostFoundItem');
const User = require('../../models/User');

// Create test app
const app = express();
app.use(express.json());

// Mock auth middleware
const mockAuth = (req, res, next) => {
  if (req.mockUser) {
    req.user = req.mockUser;
  }
  next();
};

// Apply mock auth before routes
app.use((req, res, next) => {
  mockAuth(req, res, next);
});

app.use('/api/lostfound', require('../../routes/lostfound'));

describe('Lost & Found CRUD Operations', () => {
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      googleId: 'test-google-id'
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await LostFoundItem.deleteMany({});
  });

  describe('READ - GET /api/lostfound', () => {
    test('should get all items with pagination', async () => {
      await LostFoundItem.create([
        {
          user: testUser._id,
          type: 'lost',
          title: 'Item 1',
          description: 'Desc 1',
          date: '2024-01-01',
          contact: 'test@example.com'
        },
        {
          user: testUser._id,
          type: 'found',
          title: 'Item 2',
          description: 'Desc 2',
          date: '2024-01-02',
          contact: 'test@example.com'
        }
      ]);

      const response = await request(app)
        .get('/api/lostfound')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body).toHaveProperty('totalItems');
      expect(response.body).toHaveProperty('totalPages');
    });

    test('should filter by type', async () => {
      await LostFoundItem.create([
        {
          user: testUser._id,
          type: 'lost',
          title: 'Lost Item',
          description: 'Desc',
          date: '2024-01-01',
          contact: 'test@example.com'
        },
        {
          user: testUser._id,
          type: 'found',
          title: 'Found Item',
          description: 'Desc',
          date: '2024-01-02',
          contact: 'test@example.com'
        }
      ]);

      const response = await request(app)
        .get('/api/lostfound?type=lost')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].type).toBe('lost');
    });

    test('should combine category alias with keyword search', async () => {
      await LostFoundItem.create([
        {
          user: testUser._id,
          type: 'lost',
          title: 'Lost keys',
          description: 'Black keychain',
          location: 'Library',
          date: '2024-01-01',
          contact: 'test@example.com'
        },
        {
          user: testUser._id,
          type: 'found',
          title: 'Found keys',
          description: 'Silver keychain',
          location: 'Library',
          date: '2024-01-02',
          contact: 'test@example.com'
        },
        {
          user: testUser._id,
          type: 'lost',
          title: 'Lost notebook',
          description: 'Blue notebook',
          location: 'Cafeteria',
          date: '2024-01-03',
          contact: 'test@example.com'
        }
      ]);

      const response = await request(app)
        .get('/api/lostfound?category=lost&search=keys')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].title).toBe('Lost keys');
      expect(response.body.items[0].type).toBe('lost');
    });
  });

  describe('READ ONE - GET /api/lostfound/:id', () => {
    test('should get single item by ID', async () => {
      const item = await LostFoundItem.create({
        user: testUser._id,
        type: 'lost',
        title: 'Test Item',
        description: 'Test Description',
        date: '2024-01-01',
        contact: 'test@example.com'
      });

      const response = await request(app)
        .get(`/api/lostfound/${item._id}`)
        .expect(200);

      expect(response.body.title).toBe('Test Item');
      expect(response.body.user).toHaveProperty('name');
    });
  });
});
