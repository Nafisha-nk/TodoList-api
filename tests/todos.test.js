// tests/todos.test.js
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Todo = require('../models/Todo');

describe('Todos API', () => {
  let token;

  beforeEach(async () => {
    await User.deleteMany({});
    await Todo.deleteMany({});

    // Register and login a user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    token = loginRes.body.token;
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Todo',
          description: 'Test Description'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toEqual('Test Todo');
    });

    it('should not create todo without authentication', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({
          title: 'Test Todo',
          description: 'Test Description'
        });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/todos', () => {
    beforeEach(async () => {
      // Create some test todos
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Todo 1' });

      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Todo 2' });
    });

    it('should get all todos for authenticated user', async () => {
      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('total');
    });
  });
});