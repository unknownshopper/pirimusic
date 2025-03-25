const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(cors({
    origin: 'http://localhost:3001',  // Remove this line
    credentials: true
}));

app.use(express.json());
app.use(express.static(__dirname));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Mock user database (replace with real database in production)
const users = {
    'admin': 'password123'
};

// Login endpoint
app.post('/api/login', (req, res) => {
    console.log('Received login request:', req.body);
    const { username, password } = req.body;
    
    console.log('Attempting login with:', { username, password });
    console.log('Available users:', users);
    
    if (users[username] && users[username] === password) {
        console.log('Login successful');
        req.session.authenticated = true;
        req.session.user = username;
        res.json({ success: true });
    } else {
        console.log('Login failed - Invalid credentials');
        res.json({ success: false });
    }
});

// Check authentication status
app.get('/api/check-auth', (req, res) => {
    res.json({ authenticated: req.session.authenticated === true });
});

// Protect file listing endpoints
app.get('/:folder', async (req, res) => {
    if (!req.session.authenticated) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const folderPath = path.join(__dirname, req.params.folder);
        const files = await fs.readdir(folderPath);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Error reading directory' });
    }
});

const PORT = 3001;  // Changed from 3000 to 3001
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});