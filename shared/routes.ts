
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

const babyCostLineSchema = z.object({
  category: z.string(),
  label: z.string(),
  monthlyEstimate: z.number(),
  note: z.string().optional(),
});

export const babyCostResponseSchema = z.object({
  lines: z.array(babyCostLineSchema),
  totalMonthly: z.number(),
  totalForLeave: z.number(),
  leaveMonths: z.number(),
  /** "google-cse" when at least one line used a live-fetched price; "static-fallback" otherwise. */
  source: z.enum(["google-cse", "static-fallback"]),
  /** ISO date string of the most recent Google CSE fetch, or null for static-fallback. */
  pricedAt: z.string().nullable(),
});

export type BabyCostLine = z.infer<typeof babyCostLineSchema>;
export type BabyCostResponse = z.infer<typeof babyCostResponseSchema>;

export const babyCostsQuerySchema = z.object({
  jurisdiction: z.string(),
  leaveWeeks: z.coerce.number().int().positive(),
});

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
  babyCosts: {
    get: {
      method: 'GET' as const,
      path: '/api/baby-costs',
      responses: {
        200: babyCostResponseSchema,
        400: errorSchemas.validation,
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
