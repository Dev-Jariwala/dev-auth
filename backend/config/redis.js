import Redis from 'redis';
import { RedisStore } from 'connect-redis';

// Initialize Redis client
const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379' // Use environment variable or default URL
});

let retryAttempts = 0; // Track the number of retry attempts
const MAX_RETRIES = 3; // Maximum number of retries

// Function to handle Redis connection errors
const handleRedisError = (err) => {
    console.error('Redis connection error:', err);

    retryAttempts++;
    if (retryAttempts >= MAX_RETRIES) {
        console.error('Max retry attempts reached. Stopping reconnection attempts.');
        redisClient.quit(); // Close the Redis client
        process.exit(1); // Exit the process (optional, depending on your use case)
    } else {
        console.log(`Retrying connection... (Attempt ${retryAttempts}/${MAX_RETRIES})`);
    }
};

// Attach error handler to the Redis client
redisClient.on('error', handleRedisError);

// Connect to Redis
redisClient.connect()
    .then(() => {
        console.log('Connected to Redis successfully!');
        retryAttempts = 0; // Reset retry attempts on successful connection
    })
    .catch((err) => {
        handleRedisError(err);
    });

// Initialize Redis store
const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'session_id:', // Optional: prefix for Redis keys
    ttl: 60 * 60
});

export { redisClient, redisStore };