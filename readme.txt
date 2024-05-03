Node.js Application README
Project Overview

This Node.js application serves as a backend service for user management and message handling. It uses PostgreSQL for data storage, Kafka for message queuing, and Redis for session management and caching.

Features
User Authentication: Sign up, log in, and manage user sessions.
Message Handling: Send and receive messages using Kafka, with message content encrypted and stored in Redis.
API Endpoints: Perform operations like user signup, login, fetching user details, updating user details, and deleting users.
Prerequisites
Node.js
PostgreSQL
Kafka
Redis


Setup Instructions

1. Clone the Repository
git clone [repository-url]
cd [repository-directory]

2. Install Dependencies
npm install

3. Configure Environment Variables
Create a .env file in the project root and specify the following variables:
DB_USER=aditya_waykos
DB_HOST=localhost
DB_DATABASE=postgres_db
DB_PASSWORD=Aditya@2001
DB_PORT=5432
KAFKA_HOST=localhost:9092
REDIS_HOST=localhost
REDIS_PORT=6379
SESSION_SECRET=verySecretKey

4. Start Required Services
Ensure that PostgreSQL, Kafka, and Redis services are running.

5. Initialize the Database
Set up your PostgreSQL database with the necessary tables and permissions.

API Endpoints

User Management
POST /signup - Register a new user.
POST /login - Authenticate a user and start a session.
GET /users/:id - Retrieve user details by user ID.
PUT /users/:id - Update user details.
DELETE /users/:id - Delete a user.
Message Handling
POST /messages - Send a message, encrypt it, and store it in Redis. Also, send it to Kafka.
Running the Application

To start the server, run:
npm start


Testing
This project uses Jest and Supertest for API testing.

Run Tests
To execute tests, run:

npm test


Additional Information
Security Considerations: Ensure that your environment variables are securely managed and not exposed.
Performance Considerations: Monitor the Kafka and Redis performance for scalability.