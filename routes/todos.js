// routes/todos.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
  getTodo
} = require('../controllers/todoController');

router.use(auth); // All todo routes require authentication

router.post('/', createTodo);
router.get('/', getTodos);
router.get('/:id', getTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

module.exports = router;