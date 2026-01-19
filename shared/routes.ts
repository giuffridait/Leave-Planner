
import { z } from 'zod';
import { insertPlanSchema, plans } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  plans: {
    create: {
      method: 'POST' as const,
      path: '/api/plans',
      input: insertPlanSchema,
      responses: {
        201: z.custom<typeof plans.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/plans/:id',
      responses: {
        200: z.custom<typeof plans.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  narration: {
    create: {
      method: "POST" as const,
      path: "/api/narration",
      input: z.object({
        jurisdiction: z.string(),
        userInputs: z.object({
          salary: z.number(),
          leaveWeeks: z.number(),
        }),
        calculationSummary: z.object({
          totalGap: z.number(),
          paidWeeks: z.number(),
          unpaidWeeks: z.number(),
        }),
        structuredExplanation: z.unknown(),
      }),
      responses: {
        200: z.object({
          friendlySummary: z.string(),
          whatDroveTheGap: z.array(z.string()),
          thingsToDoubleCheck: z.array(z.string()),
        }),
        400: errorSchemas.validation,
        502: errorSchemas.internal.extend({
          error: z.string().optional(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type CreatePlanInput = z.infer<typeof api.plans.create.input>;
export type PlanResponse = z.infer<typeof api.plans.create.responses[201]>;
