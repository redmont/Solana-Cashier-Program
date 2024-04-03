"use client";

import { Socket, io } from "socket.io-client";
import { Message, MessageConstructor } from "ui-gateway-messages";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3333";

export const socket: Socket = io(URL!);

export function sendMessage<
  T extends Message<TReturnType>,
  TReturnType extends { success: boolean },
>(
  socket: Socket,
  MessageType: MessageConstructor<T>,
  ...args: ConstructorParameters<MessageConstructor<T>>
): Promise<any> {
  return new Promise((resolve, reject) => {
    const messageInstance = new MessageType(...args);

    socket.emit(
      MessageType.messageType,
      messageInstance,
      (response: TReturnType) => {
        if (
          response &&
          typeof response === "object" &&
          "success" in response &&
          response.success
        ) {
          resolve(response);
        } else {
          reject(
            new Error("Failed to send message or negative response received")
          );
        }
      }
    );
  });
}
