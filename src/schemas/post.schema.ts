import { z } from 'zod';

export const postSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  title: z.string().min(1),
  body: z.string().min(1),
});

export const commentSchema = z.object({
  id: z.number().int().positive(),
  post_id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().email(),
  body: z.string().min(1),
});

export type Post = z.infer<typeof postSchema>;
export type Comment = z.infer<typeof commentSchema>;

export type PostInput = { title: string; body: string };
export type CommentInput = { name: string; email: string; body: string };
