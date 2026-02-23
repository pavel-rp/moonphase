import { z } from 'zod';

/** Reusable schema for validating cryptocurrency symbol strings. */
export const symbolSchema = z.string().min(1).max(20);
