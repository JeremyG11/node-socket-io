import { Socket } from "socket.io";

export declare module "socket.io" {
  interface Socket {
    username?: string;
  }
}
