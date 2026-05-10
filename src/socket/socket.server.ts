import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { setSocketServer } from "../services/notification.service";
import { verifyToken } from "../utils/generateToken";

export const configureSocket = (server: HttpServer, allowedOrigin: string) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
      if (!token) return next(new Error("Authentication required"));

      const payload = verifyToken(token);
      socket.data.user = payload;
      socket.join(`user:${payload.id}`);
      return next();
    } catch (error) {
      return next(error as Error);
    }
  });

  io.on("connection", (socket) => {
    socket.emit("socket:ready", { userId: socket.data.user.id });
  });

  setSocketServer(io);
  return io;
};
