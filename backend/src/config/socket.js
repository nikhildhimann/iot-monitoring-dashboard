import { Server } from "socket.io";

import { DEVICE_ROOM_PREFIX, SOCKET_EVENTS } from "../constants/app.constants.js";
import { env } from "./env.js";

let ioInstance;

const isAllowedOrigin = (origin) => {
  return !origin || env.CLIENT_URLS.includes(origin);
};

export const initSocket = (server) => {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Origin not allowed by Socket.IO"));
      },
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  ioInstance.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    socket.on(SOCKET_EVENTS.SUBSCRIBE_DEVICE, (deviceId) => {
      if (deviceId) {
        socket.join(`${DEVICE_ROOM_PREFIX}${deviceId}`);
      }
    });

    socket.on(SOCKET_EVENTS.UNSUBSCRIBE_DEVICE, (deviceId) => {
      if (deviceId) {
        socket.leave(`${DEVICE_ROOM_PREFIX}${deviceId}`);
      }
    });
  });

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO has not been initialized");
  }

  return ioInstance;
};

export const emitSocketEvent = (event, payload, room) => {
  if (!ioInstance) {
    return;
  }

  if (room) {
    ioInstance.to(room).emit(event, payload);
    return;
  }

  ioInstance.emit(event, payload);
};

export const emitDeviceSocketEvent = (event, deviceId, payload) => {
  emitSocketEvent(event, payload);

  if (deviceId) {
    emitSocketEvent(event, payload, `${DEVICE_ROOM_PREFIX}${deviceId}`);
  }
};
