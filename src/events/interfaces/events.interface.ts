import { JoinProjectSchema } from '../schemas/events.schema';
import { z } from 'zod';

export type JoinProject = z.infer<typeof JoinProjectSchema>;

export interface ServerToClientEvents {
  chat: (e: string) => void;
}

export interface ClientToServerEvents {
  join_project: (e: JoinProject) => void;
}
