const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const USERS_PATH = path.join(__dirname, 'src', 'data', 'users.json');

// Delete user by ID
app.delete('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  fs.readFile(USERS_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read users.json' });
    let users = [];
    try {
      users = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid users.json format' });
    }
    const newUsers = users.filter(user => user.id !== userId);
    fs.writeFile(USERS_PATH, JSON.stringify(newUsers, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to write users.json' });
      res.json({ success: true, users: newUsers });
    });
  });
});

// (Optional) Get all users
app.get('/api/users', (req, res) => {
  fs.readFile(USERS_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read users.json' });
    let users = [];
    try {
      users = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid users.json format' });
    }
    res.json(users);
  });
});

app.listen(PORT, () => {
  console.log(`User management API running on http://localhost:${PORT}`);
});
