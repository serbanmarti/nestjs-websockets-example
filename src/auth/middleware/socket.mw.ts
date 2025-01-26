import { Socket } from 'socket.io';
import { SocketGuard } from '../guards/socket.guard';
import { WsException } from '@nestjs/websockets';

type SocketIoMiddleware = {
  (socket: Socket, next: (err?: any) => void): void;
};

export const SocketAuthMiddleware: SocketIoMiddleware = (socket, next) => {
  if (!SocketGuard.validateToken(socket)) {
    return next(new WsException('Unauthorized'));
  }
  return next();
};
