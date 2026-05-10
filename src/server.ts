import { createServer } from "http";
import { app, allowedOrigin } from "./app";
import { connectRedis } from "./config/redis";
import { configureSocket } from "./socket/socket.server";

const port = Number(process.env.PORT || 5000);
const server = createServer(app);

configureSocket(server, allowedOrigin);

const start = async () => {
  void connectRedis();

  server.listen(port, () => {
    console.log(`SyncUp backend listening on http://localhost:${port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
