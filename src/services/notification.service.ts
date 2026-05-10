import { Server } from "socket.io";
import { prisma } from "../config/db";

let ioInstance: Server | undefined;

export const setSocketServer = (io: Server) => {
  ioInstance = io;
};

export const notificationService = {
  create: async (data: { userId: string; title: string; message: string }) => {
    const notification = await prisma.notification.create({ data });
    ioInstance?.to(`user:${data.userId}`).emit("notification:new", notification);
    return notification;
  },

  list: (userId: string) =>
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),

  markRead: (userId: string, id: string) =>
    prisma.notification.update({
      where: { id },
      data: { read: true },
    }),
};
