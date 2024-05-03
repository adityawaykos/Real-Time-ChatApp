// This code belongs to Aditya Waykos
// Import the PostgreSQL module from the 'pg' package.
const { Pool } = require('pg');

// Configure and create a pool of connections for managing PostgreSQL database interactions.
// This pool facilitates handling multiple PostgreSQL connections in your application.
const postgresPool = new Pool({
    user: 'aditya_waykos',                			   // Username used to authenticate to the PostgreSQL database.
    host: 'localhost',                       // Host address where the PostgreSQL database is running.
    database: 'postgres_db',          // Name of the PostgreSQL database to connect to.
    password: 'Aditya@2001',               // Password for the specified user to authenticate to the database.
    port: 5432,                              // Port number on which the PostgreSQL server is listening, default is 5432.
});

// Export the configured PostgreSQL connection pool.
// This allows other parts of the application to use this pool to execute queries against the PostgreSQL database.
module.exports = { postgresPool };
