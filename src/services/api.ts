// frontend/src/services/api.ts
import axios from "axios";
import { io } from "socket.io-client";

export const api = axios.create({
  baseURL: "http://localhost:5000",
});

export function createSocket() {
  const socket = io("http://localhost:5000", { transports: ["websocket"] });
  return socket;
}
