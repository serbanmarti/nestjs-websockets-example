import { z } from 'zod';

export const JoinProjectSchema = z.object({
  projectId: z.string().min(9),
});
