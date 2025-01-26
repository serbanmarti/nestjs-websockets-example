import { ClientToServerEvents, JoinProject, ServerToClientEvents } from './interfaces/events.interface';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinProjectSchema } from './schemas/events.schema';
import { SocketAuthMiddleware } from '../auth/middleware/socket.mw';
import { SocketGuard } from '../auth/guards/socket.guard';
import { UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../pipes/zod.pipe';

// Hardcoded user/project permissions for demonstration purposes
const USER_PROJECT_PERMISSIONS = new Map<string, string[]>([
  ['user_1', ['project_one']],
  ['user_2', ['project_one', 'project_two', 'project_three']],
  ['user_3', ['project_three']],
]);

@WebSocketGateway({ namespace: 'events', cors: { origin: '*' } })
@UseGuards(SocketGuard)
export class EventsGateway implements OnGatewayInit<Server> {
  @WebSocketServer() server = new Server<ClientToServerEvents, ServerToClientEvents>();

  afterInit(server: Server): void {
    server.use(SocketAuthMiddleware);
  }

  @SubscribeMessage('join_project')
  handleJoinProject(
    @MessageBody(new ZodValidationPipe(JoinProjectSchema)) payload: JoinProject,
    @ConnectedSocket() client: Socket,
  ): WsResponse<string> {
    // Get the user ID from the client data
    const userId: string | undefined = client.data.userId;
    if (userId === undefined) {
      throw new WsException('Unauthorized'); // This should never happen
    }

    // Check if the user has permissions to join the project
    if (!USER_PROJECT_PERMISSIONS.get(userId)?.some((id) => id === payload.projectId)) {
      throw new WsException('Project not found');
    }

    // Join the project room
    client.join(payload.projectId);

    return { event: 'join_project', data: `You have joined ${payload.projectId}!` };
  }

  sendGlobalMessages(): void {
    this.server.to('project_one').emit('chat', `Hello, project_one! Time is -- ${new Date().toISOString()} --`);
    this.server.to('project_two').emit('chat', `Hello, project_two! Time is -- ${new Date().toISOString()} --`);
    this.server.to('project_three').emit('chat', `Hello, project_three! Time is -- ${new Date().toISOString()} --`);
  }
}
