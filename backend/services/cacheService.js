const NodeCache = require('node-cache');

// Create a cache with 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

const cacheService = {
  // Get data from cache
  get: (key) => {
    return cache.get(key);
  },
  
  // Set data in cache
  set: (key, data) => {
    return cache.set(key, data);
  },
  
  // Delete data from cache
  del: (key) => {
    return cache.del(key);
  },
  
  // Clear all cache
  flush: () => {
    return cache.flushAll();
  }
};

module.exports = cacheService; 