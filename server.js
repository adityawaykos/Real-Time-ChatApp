// This code belongs to Aditya Waykos
const express = require('express');
const http = require('http');
const { dbPool } = require('./db');  // Importing the database connection pool for database operations
const bcrypt = require('bcryptjs');  // bcryptjs is used for hashing and comparing passwords securely
const session = require('express-session');  // Used for managing user sessions
const RedisStore = require('connect-redis')(session);  // Session store using Redis for persistence
const redisClient = require('redis');  // Redis client for caching and session storage
const { messageProducer } = require('./kafka');  // Kafka producer for message queueing
const crypto = require('crypto');  // Node's crypto module for cryptographic functionality

const app = express();  // Initializing express application
const httpServer = http.createServer(app);  // Creating an HTTP server that uses the express app

const PORT = process.env.PORT || 3000;  // Server port
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(express.json());  // Middleware to parse JSON bodies

// Function to generate a secret key for cryptographic operations
function generateSecret(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')  // Convert to hexadecimal format
        .slice(0, length);  // Ensure the key length is as specified
}

// Setup Redis client for session management
const redis = redisClient.createClient({
    host: 'localhost',
    port: 6379,  // Default Redis port
});

// Configure session management with Redis store
app.use(session({
    store: new RedisStore({ client: redis }),  // Redis store configuration
    secret: 'verySecretKey', // Secret key for signing the session ID cookie
    resave: false,  // Avoids resaving sessions that are not modified
    saveUninitialized: false,  // Do not save uninitialized sessions
    cookie: {
        secure: false,  // Set to true when using HTTPS
        maxAge: 3600000,  // Session cookie expiry time in milliseconds
    },
}));

// Endpoint to handle user signup
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;  // Extract email and password from request body
        const hashedPassword = await bcrypt.hash(password, 10);  // Hash the password with a salt round of 10
        const insertQuery = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *';
        const { rows } = await dbPool.query(insertQuery, [email, hashedPassword]);  // Insert user into database
        const user = rows[0];
        res.status(201).json({ user });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to handle user login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;  // Extract email and password from request body
        const selectQuery = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await dbPool.query(selectQuery, [email]);  // Query user from the database
        const user = rows[0];
        if (!user) {
            return res.status(404).json({ error: 'User Not Found !!' });  // User not found response
        }
        const isValidPassword = await bcrypt.compare(password, user.password);  // Compare provided password with stored hash
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid Password!!' });  // Incorrect password response
        }
        req.session.userId = user.id;  // Set user's ID in session for persistence across requests
        res.json({ message: 'Login is successful !!' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to retrieve user details by ID
app.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;  // Get user ID from URL parameters
        const selectQuery = 'SELECT * FROM users WHERE id = $1';
        const { rows } = await dbPool.query(selectQuery, [userId]);  // Query user details by ID
        const user = rows[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });  // User not found response
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to update user details
app.put('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;  // Get user ID from URL parameters
        const { email, password } = req.body;  // Extract new email and password from request body
        const hashedPassword = await bcrypt.hash(password, 10);  // Hash the new password
        const updateQuery = 'UPDATE users SET email = $1, password = $2 WHERE id = $3 RETURNING *';
        const { rows } = await dbPool.query(updateQuery, [email, hashedPassword, userId]);  // Update user details in the database
        const user = rows[0];
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to delete a user by ID
app.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;  // Get user ID from URL parameters
        const deleteQuery = 'DELETE FROM users WHERE id = $1';
        await dbPool.query(deleteQuery, [userId]);  // Delete the user from the database
        res.json({ message: 'User deleted successfully!!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint for sending messages through Kafka and storing encrypted version in Redis
app.post('/messages', (req, res) => {
    try {
        const { senderId, receiverId, messageContent } = req.body;  // Extract message details from request body
        const secretKey = 'encryptionKey';  // This should be securely managed
        const encryptedMessage = crypto.createCipher('aes-256-cbc', secretKey).update(messageContent, 'utf8', 'hex');  // Encrypt the message
        redis.set(`message:${senderId}:${receiverId}`, encryptedMessage);  // Store the encrypted message in Redis

        const payloads = [
            { topic: 'messages', messages: JSON.stringify({ senderId, receiverId, encryptedMessage }) }  // Prepare message for Kafka
        ];
        messageProducer.send(payloads, (error, data) => {  // Send message to Kafka topic
            if (error) {
                console.error('Error producing message to Kafka:', error);
                res.status(500).json({ error: 'An Error Occurre while sending the message' });
            } else {
                console.log('Message sent to Kafka:', data);
                res.status(201).json({ message: 'Message sent Successfully!!' });
            }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'An Error Occurred while sending the message!!' });
    }
});
