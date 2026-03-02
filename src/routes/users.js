const express = require('express');
const router = express.Router();

// In-memory store — replace with a real DB in production
const users = [
  { id: 1, name: 'Alice', role: 'admin' },
  { id: 2, name: 'Bob', role: 'viewer' },
];

/**
 * GET /api/users
 */
router.get('/', (req, res) => {
  // Never expose sensitive fields (passwords, tokens, etc.)
  const safeUsers = users.map(({ id, name, role }) => ({ id, name, role }));
  res.json({ data: safeUsers });
});

/**
 * GET /api/users/:id
 */
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password, ...safeUser } = user; // eslint-disable-line no-unused-vars
  res.json({ data: safeUser });
});

/**
 * POST /api/users
 */
router.post('/', (req, res) => {
  const { name, role } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
  }

  const allowedRoles = ['admin', 'viewer', 'editor'];
  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${allowedRoles.join(', ')}` });
  }

  const newUser = {
    id: users.length + 1,
    name: name.trim(),
    role: role || 'viewer',
  };

  users.push(newUser);
  res.status(201).json({ data: newUser });
});

module.exports = router;
