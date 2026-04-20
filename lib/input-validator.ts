import { z } from 'zod'

export const taskQuerySchema = z.object({
  task_type: z.enum(['mit', 'braindump']).optional(),
  status: z.enum(['pending', 'completed']).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})