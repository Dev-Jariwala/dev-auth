import { client } from '../../config/redis.js';

class RedisService {
    /**
     * Set a key-value pair with optional expiration
     * @param {string} key 
     * @param {string} value 
     * @param {number} expireSeconds 
     */
    async set(key, value, expireSeconds = null) {
        try {
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            await client.set(key, value);
            if (expireSeconds) {
                await client.expire(key, expireSeconds);
            }
            return true;
        } catch (error) {
            console.error('Redis SET Error:', error);
            throw error;
        }
    }

    /**
     * Get value by key
     * @param {string} key 
     * @returns {Promise<any>}
     */
    async get(key) {
        try {
            const value = await client.get(key);
            if (!value) return null;

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            console.error('Redis GET Error:', error);
            throw error;
        }
    }

    /**
     * Delete a key
     * @param {string} key 
     */
    async delete(key) {
        try {
            return await client.del(key);
        } catch (error) {
            console.error('Redis DELETE Error:', error);
            throw error;
        }
    }

    /**
     * Check if key exists
     * @param {string} key 
     */
    async exists(key) {
        try {
            return await client.exists(key);
        } catch (error) {
            console.error('Redis EXISTS Error:', error);
            throw error;
        }
    }

    /**
     * Set hash field
     * @param {string} key 
     * @param {string} field 
     * @param {any} value 
     */
    async hSet(key, field, value) {
        try {
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            return await client.hSet(key, field, value);
        } catch (error) {
            console.error('Redis HSET Error:', error);
            throw error;
        }
    }

    /**
     * Get hash field
     * @param {string} key 
     * @param {string} field 
     */
    async hGet(key, field) {
        try {
            const value = await client.hGet(key, field);
            if (!value) return null;

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            console.error('Redis HGET Error:', error);
            throw error;
        }
    }

    /**
     * Get all hash fields
     * @param {string} key 
     */
    async hGetAll(key) {
        try {
            const data = await client.hGetAll(key);
            if (!data || Object.keys(data).length === 0) return null;

            // Try to parse JSON values
            Object.keys(data).forEach(field => {
                try {
                    data[field] = JSON.parse(data[field]);
                } catch {
                    // Keep original value if not JSON
                }
            });

            return data;
        } catch (error) {
            console.error('Redis HGETALL Error:', error);
            throw error;
        }
    }

    /**
     * Delete hash field
     * @param {string} key 
     * @param {string} field 
     */
    async hDel(key, field) {
        try {
            return await client.hDel(key, field);
        } catch (error) {
            console.error('Redis HDEL Error:', error);
            throw error;
        }
    }

    /**
     * Clear all data
     */
    async clearAll() {
        try {
            return await client.flushDb();
        } catch (error) {
            console.error('Redis FLUSHDB Error:', error);
            throw error;
        }
    }
}

export default new RedisService(); 