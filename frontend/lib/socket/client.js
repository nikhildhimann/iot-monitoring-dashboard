"use client";

import { io } from "socket.io-client";
import { SOCKET_URL } from "@/lib/config";

let socketInstance = null;

export function connectSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
}

export function getSocket() {
  return socketInstance;
}

export function disconnectSocket() {
  if (!socketInstance) {
    return;
  }

  socketInstance.disconnect();
}
