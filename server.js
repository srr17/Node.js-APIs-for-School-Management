// Required modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
require('dotenv').config();

// Initialize the app
const app = express();

// Middleware to parse incoming JSON
app.use(bodyParser.json());

// Database connection setup
const db = mysql.createConnection({
    host: process.env.DB_HOST,    // Read from the .env file
    user: process.env.DB_USER,    // Read from the .env file
    password: process.env.DB_PASS, // Read from the .env file
    database: process.env.DB_NAME  // Read from the .env file
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Database connected successfully');
});

// Add School API (POST method)
app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Input validation
    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // SQL query to insert school data
    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    
    // Execute the query
    db.query(query, [name, address, latitude, longitude], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'School added successfully' });
    });
});

// List Schools API (GET method)
app.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;

    // Input validation
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // SQL query to get schools ordered by proximity
    const query = `
        SELECT *, 
        (6371 * acos(
            cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(latitude))
        )) AS distance 
        FROM schools 
        ORDER BY distance;
    `;

    // Execute the query
    db.query(query, [latitude, longitude, latitude], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
