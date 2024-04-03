export const config = {
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: process.env.REDIS_PORT || "4515",
  websocketPort: parseInt(process.env.WS_PORT, 10) || 8080,
};
