import { z } from "zod";
import { commerce, SIZES } from "./config";
import { INDIAN_STATES } from "./india";

const trimmed = (max: number) => z.string().trim().max(max);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ message: "Enter a valid email address." }));

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be at most 72 characters.")
  .regex(/[a-zA-Z]/, "Password must contain a letter.")
  .regex(/[0-9]/, "Password must contain a number.");

export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."));

export const registerSchema = z.object({
  name: trimmed(80).min(2, "Please enter your name."),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(72),
});

export const addressSchema = z.object({
  fullName: trimmed(80).min(2, "Enter the recipient's full name."),
  phone: phoneSchema,
  line1: trimmed(160).min(4, "Enter your house / flat and street."),
  line2: trimmed(160).optional().transform((v) => (v ? v : undefined)),
  city: trimmed(80).min(2, "Enter your city."),
  state: z.enum(INDIAN_STATES, { message: "Select your state." }),
  postalCode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code."),
});

export const cartLineSchema = z.object({
  variantId: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(commerce.maxQtyPerLine),
});

export const checkoutSchema = z.object({
  email: emailSchema,
  address: addressSchema,
  items: z.array(cartLineSchema).min(1, "Your bag is empty.").max(commerce.maxLinesPerOrder),
  couponCode: z
    .string()
    .trim()
    .toUpperCase()
    .max(32)
    .optional()
    .transform((v) => (v ? v : undefined)),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  saveAddress: z.boolean().optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const razorpayVerifySchema = z.object({
  orderId: z.string().min(1).max(64),
  razorpay_order_id: z.string().min(1).max(64),
  razorpay_payment_id: z.string().min(1).max(64),
  razorpay_signature: z.string().min(1).max(256),
});

export const reviewSchema = z.object({
  productId: z.string().min(1).max(64),
  rating: z.coerce.number().int().min(1).max(5),
  title: trimmed(100).optional().transform((v) => (v ? v : undefined)),
  body: trimmed(2000).min(10, "Please write at least 10 characters."),
});

export const contactSchema = z.object({
  name: trimmed(80).min(2, "Please enter your name."),
  email: emailSchema,
  subject: trimmed(120).min(3, "Please add a subject."),
  message: trimmed(4000).min(10, "Please write at least 10 characters."),
});

export const profileSchema = z.object({
  name: trimmed(80).min(2, "Please enter your name."),
  phone: z.union([z.literal(""), phoneSchema]).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password.").max(72),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// ---------- Admin ----------

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only.");

const imageUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v.startsWith("/") || /^https:\/\//.test(v), "Image must be an https URL or a site path.");

export const variantInputSchema = z.object({
  id: z.string().max(64).optional(),
  size: z.enum(SIZES),
  color: trimmed(40).min(1, "Colour is required."),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .min(2)
    .max(64)
    .regex(/^[A-Z0-9-]+$/, "SKU may contain letters, numbers and hyphens."),
  stock: z.number().int().min(0).max(100000),
});

export const productInputSchema = z
  .object({
    name: trimmed(120).min(2, "Name is required."),
    slug: slugSchema,
    description: trimmed(5000).min(10, "Description is too short."),
    details: z.array(trimmed(200).min(1)).max(20),
    price: z.number().int().min(100, "Price must be at least ₹1.").max(10_000_000),
    compareAtPrice: z.number().int().min(0).max(10_000_000).nullable(),
    categoryId: z.string().min(1, "Select a category.").max(64),
    images: z.array(imageUrlSchema).min(1, "Add at least one image.").max(10),
    tags: z.array(trimmed(40).min(1)).max(20),
    isFeatured: z.boolean(),
    isActive: z.boolean(),
    variants: z.array(variantInputSchema).min(1, "Add at least one size/colour variant.").max(60),
  })
  .refine((p) => p.compareAtPrice == null || p.compareAtPrice === 0 || p.compareAtPrice > p.price, {
    message: "Compare-at price must be higher than the selling price.",
    path: ["compareAtPrice"],
  })
  .refine(
    (p) => new Set(p.variants.map((v) => `${v.size}|${v.color.toLowerCase()}`)).size === p.variants.length,
    { message: "Each size + colour combination must be unique.", path: ["variants"] },
  )
  .refine((p) => new Set(p.variants.map((v) => v.sku)).size === p.variants.length, {
    message: "Each variant needs a unique SKU.",
    path: ["variants"],
  });
export type ProductInput = z.infer<typeof productInputSchema>;

export const categoryInputSchema = z.object({
  name: trimmed(60).min(2, "Name is required."),
  slug: slugSchema,
  description: trimmed(300).optional().transform((v) => (v ? v : undefined)),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
});

export const couponInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3)
      .max(32)
      .regex(/^[A-Z0-9]+$/, "Use letters and numbers only."),
    description: trimmed(200).optional().transform((v) => (v ? v : undefined)),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.coerce.number().positive(),
    minSubtotal: z.coerce.number().min(0).default(0),
    maxDiscount: z.coerce.number().positive().optional(),
    maxUses: z.coerce.number().int().positive().optional(),
    expiresAt: z.coerce.date().optional(),
    isActive: z.boolean(),
  })
  .refine((c) => c.type === "FIXED" || (c.value >= 1 && c.value <= 90), {
    message: "Percentage must be between 1 and 90.",
    path: ["value"],
  });

export const orderUpdateSchema = z.object({
  orderId: z.string().min(1).max(64),
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
  courier: trimmed(60).optional(),
  trackingNumber: trimmed(80).optional(),
  adminNote: trimmed(1000).optional(),
});

/** Turns zod issues into a { field: message } map for forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
