const { z } = require("zod");

const moneyCentsSchema = z.number().int().nonnegative();

const menuItemCreateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).default(""),
  priceCents: moneyCentsSchema,
  category: z.string().min(1).max(40).default("other"),
  imageUrl: z.string().url().nullable().optional(),
  available: z.boolean().optional().default(true)
});

const menuItemUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).optional(),
  priceCents: moneyCentsSchema.optional(),
  category: z.string().min(1).max(40).optional(),
  imageUrl: z.string().url().nullable().optional(),
  available: z.boolean().optional()
});

const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().positive().max(100)
});

const orderCreateSchema = z.object({
  customer: z
    .object({
      name: z.string().min(1).max(120).optional(),
      phone: z.string().min(1).max(40).optional(),
      address: z.string().min(1).max(500).optional()
    })
    .optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(orderItemSchema).min(1)
});

const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled"
]);

const orderStatusPatchSchema = z.object({
  status: orderStatusSchema
});

module.exports = {
  menuItemCreateSchema,
  menuItemUpdateSchema,
  orderCreateSchema,
  orderStatusSchema,
  orderStatusPatchSchema
};
