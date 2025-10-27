// controllers/todoController.js
const Todo = require('../models/Todo');
const { todoValidation } = require('../middleware/validation');

exports.createTodo = async (req, res) => {
  try {
    // Validate request data
    const { error } = todoValidation(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const todo = new Todo({
      ...req.body,
      user: req.user.id
    });

    await todo.save();

    res.status(201).json({
      id: todo._id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      dueDate: todo.dueDate,
      priority: todo.priority
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ message: 'Server error while creating todo' });
  }
};

exports.getTodos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { user: req.user.id };
    
    // Add optional filters
    if (req.query.completed) {
      filter.completed = req.query.completed === 'true';
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    // Build sort object
    let sort = {};
    if (req.query.sortBy) {
      const sortFields = req.query.sortBy.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sort[field.substring(1)] = -1;
        } else {
          sort[field] = 1;
        }
      });
    } else {
      sort = { createdAt: -1 }; // Default sort by creation date descending
    }

    const todos = await Todo.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-user');

    const total = await Todo.countDocuments(filter);

    res.json({
      data: todos,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ message: 'Server error while fetching todos' });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    // Validate request data
    const { error } = todoValidation(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Update todo
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        todo[key] = req.body[key];
      }
    });

    await todo.save();

    res.json({
      id: todo._id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      dueDate: todo.dueDate,
      priority: todo.priority
    });
  } catch (error) {
    console.error('Update todo error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.status(500).json({ message: 'Server error while updating todo' });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete todo error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.status(500).json({ message: 'Server error while deleting todo' });
  }
};

exports.getTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id }).select('-user');

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Get todo error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.status(500).json({ message: 'Server error while fetching todo' });
  }
};