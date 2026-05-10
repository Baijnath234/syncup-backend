import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    connectTimeout: 1000,
    reconnectStrategy: false,
  },
});

redisClient.on("error", (error) => {
  console.warn("Redis unavailable:", error.message);
});

export const connectRedis = async () => {
  if (redisClient.isOpen) return redisClient;

  try {
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Redis connection timed out")), 1000);
      }),
    ]);
  } catch (error) {
    try {
      redisClient.destroy();
    } catch {
      // Redis is optional; startup should continue when it is not available.
    }
    console.warn("Continuing without Redis cache.");
  }

  return redisClient;
};
