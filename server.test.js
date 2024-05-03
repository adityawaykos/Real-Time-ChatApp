// This code belongs to Aditya Waykos
const request = require('supertest'); // Import supertest for making HTTP assertions
const app = require('./server');  // Import the Express app for testing

// Test suite for the Signup endpoint
describe('POST /signup', () => {
    it('should create a new user', async () => {
        // Define the user details to be sent in the request
        const newUser = { email: 'test@example.com', password: 'password123' };
        // Make POST request to the signup endpoint and send newUser data
        const response = await request(app)
            .post('/signup')
            .send(newUser);
        // Assert that the HTTP response status is 201 (Created)
        expect(response.status).toBe(201);
        // Assert that the response body contains a user object
        expect(response.body).toHaveProperty('user');
    });
});

// Test suite for the Login endpoint
describe('POST /login', () => {
    it('should log in an existing user with correct credentials', async () => {
        // Define correct user credentials
        const userCredentials = { email: 'test@example.com', password: 'password123' };
        // Make POST request to login with correct credentials
        const response = await request(app)
            .post('/login')
            .send(userCredentials);
        // Assert successful login
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login successful');
    });

    it('should return 404 for a non-existing user', async () => {
        // Define credentials for a non-existing user
        const nonExistentUser = { email: 'nonexistent@example.com', password: 'password123' };
        // Attempt to log in as a non-existing user
        const response = await request(app)
            .post('/login')
            .send(nonExistentUser);
        // Assert that the user is not found
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should return 401 for incorrect password', async () => {
        // Provide a wrong password for an existing user
        const wrongPassword = { email: 'test@example.com', password: 'incorrectpassword' };
        // Attempt to log in with the incorrect password
        const response = await request(app)
            .post('/login')
            .send(wrongPassword);
        // Assert that the password is incorrect
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid password');
    });
});

// Test suite for retrieving user details
describe('GET /users/:id', () => {
    it('should return user information for a valid user ID', async () => {
        // Define a valid user ID to retrieve details
        const validUserId = 1;
        // Make GET request to retrieve user details
        const response = await request(app)
            .get(`/users/${validUserId}`);
        // Assert that the user details are returned successfully
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.id).toBe(validUserId);
    });

    it('should return 404 for an invalid user ID', async () => {
        // Define an invalid user ID that does not exist in the database
        const invalidUserId = 9999;
        // Attempt to retrieve details for the non-existent user ID
        const response = await request(app)
            .get(`/users/${invalidUserId}`);
        // Assert that the user is not found
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'User not found');
    });
});

// Test suite for updating user details
describe('PUT /users/:id', () => {
    it('should update user details for a valid user ID', async () => {
        // Define a valid user ID and new details for the update
        const userIdToUpdate = 1;
        const updatedInfo = { email: 'updated@example.com', password: 'updatedpassword123' };
        // Make PUT request to update the user's details
        const response = await request(app)
            .put(`/users/${userIdToUpdate}`)
            .send(updatedInfo);
        // Assert that the user's details are updated successfully
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe(updatedInfo.email);
    });
});

// Test suite for deleting a user
describe('DELETE /users/:id', () => {
    it('should delete user account for a valid user ID', async () => {
        // Define a valid user ID for deletion
        const userIdToDelete = 1;
        // Make DELETE request to remove the user
        const response = await request(app)
            .delete(`/users/${userIdToDelete}`);
        // Assert that the user is deleted successfully
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'User deleted successfully');
    });

    it('should return 404 for an invalid user ID', async () => {
        // Define an invalid user ID that does not exist
        const invalidUserIdToDelete = 9999;
        // Attempt to delete a non-existent user
        const response = await request(app)
            .delete(`/users/${invalidUserIdToDelete}`);
        // Assert that the user is not found
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'User not found');
    });
});

// Test suite for the message sending functionality
describe('POST /messages', () => {
    it('should send a message to Kafka and cache it in Redis', async () => {
        // Define the details of the message to be sent
        const messageDetails = {
            senderId: 1, 
            receiverId: 2, 
            messageContent: 'Test message content'
        };
        // Make POST request to send the message
        const response = await request(app)
            .post('/messages')
            .send(messageDetails);
        // Assert that the message is sent successfully
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Message sent successfully');
    });

    it('should return 400 if senderId or receiverId is missing', async () => {
        // Define a message with missing sender or receiver ID
        const incompleteMessage = { messageContent: 'Test message content' };
        // Attempt to send the incomplete message
        const response = await request(app)
            .post('/messages')
            .send(incompleteMessage);
        // Assert that the request is invalid due to missing sender or receiver ID
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'senderId or receiverId is missing');
    });

    it('should return 400 if messageContent is empty', async () => {
        // Define a message with empty content
        const emptyContent = { senderId: 1, receiverId: 2, messageContent: '' };
        // Attempt to send a message with empty content
        const response = await request(app)
            .post('/messages')
            .send(emptyContent);
        // Assert that the request is invalid due to empty message content
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'messageContent cannot be empty');
    });

    it('should return 404 if senderId or receiverId does not exist', async () => {
        // Define sender and receiver IDs that do not exist
        const nonExistentUsers = { senderId: 999, receiverId: 888, messageContent: 'Test message content' };
        // Attempt to send a message where sender or receiver does not exist
        const response = await request(app)
            .post('/messages')
            .send(nonExistentUsers);
        // Assert that the sender or receiver is not found
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Sender or receiver not found');
    });
});
