const { z } = require("zod");

const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

const userCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320)
});

const userUpdateSchema = userCreateSchema.partial().refine((v) => Object.keys(v).length > 0, {
  message: "At least one field must be provided"
});

const restaurantCreateSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().max(500).optional()
});

const restaurantUpdateSchema = restaurantCreateSchema.partial().refine((v) => Object.keys(v).length > 0, {
  message: "At least one field must be provided"
});

const menuItemCreateSchema = z.object({
  restaurant_id: z.coerce.number().int().positive(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  price_cents: z.coerce.number().int().nonnegative(),
  available: z.coerce.boolean().optional()
});

const menuItemUpdateSchema = z
  .object({
    restaurant_id: z.coerce.number().int().positive().optional(),
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    price_cents: z.coerce.number().int().nonnegative().optional(),
    available: z.coerce.boolean().optional()
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field must be provided" });

const orderCreateSchema = z.object({
  user_id: z.coerce.number().int().positive(),
  restaurant_id: z.coerce.number().int().positive(),
  items: z
    .array(
      z.object({
        menu_item_id: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive()
      })
    )
    .min(1)
});

const orderUpdateSchema = z
  .object({
    status: z.enum(["created", "paid", "preparing", "delivering", "completed", "cancelled"]).optional()
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field must be provided" });

module.exports = {
  idParamSchema,
  userCreateSchema,
  userUpdateSchema,
  restaurantCreateSchema,
  restaurantUpdateSchema,
  menuItemCreateSchema,
  menuItemUpdateSchema,
  orderCreateSchema,
  orderUpdateSchema
};
