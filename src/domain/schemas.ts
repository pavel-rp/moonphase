import { z } from 'zod';

/** Reusable schema for validating cryptocurrency symbol strings. */
export const symbolSchema = z.string().trim().min(1).max(20);
