import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

// Hardcoded user tokens for demonstration purposes
const VALID_USER_TOKENS = new Map<string, { id: string }>([
  ['valid-token-1', { id: 'user_1' }],
  ['valid-token-2', { id: 'user_2' }],
  ['valid-token-3', { id: 'user_3' }],
]);

export class SocketGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return false;
    }

    const socket = context.switchToWs().getClient<Socket>();
    if (!SocketGuard.validateToken(socket)) {
      throw new WsException('Unauthorized');
    }

    return true;
  }

  static validateToken(socket: Socket): boolean {
    const headerToken = socket.handshake.headers.authorization;
    const authToken = socket.handshake.auth.token;

    const user = VALID_USER_TOKENS.get(headerToken || '') || VALID_USER_TOKENS.get(authToken);

    if (user !== undefined) {
      socket.data.userId = user.id;
      return true;
    }

    return false;
  }
}
