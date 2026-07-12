import { z } from 'zod'

export const taskQuerySchema = z.object({
  task_type: z.enum(['mit', 'braindump']).optional(),
  status: z.enum(['pending', 'completed']).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  type: z.enum(['mit', 'braindump']),
})

export const updateTaskSchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
  isMIT: z.boolean().optional(),
})

export const deleteTaskSchema = z.object({
  id: z.union([z.number(), z.string()]),
})