import { z } from "zod";

export const paymentStatusEnum = z.enum([
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
]);

export const paymentModeEnum = z.enum([
  "UPI",
  "NET_BANKING",
  "CARD",
  "WALLET",
  "OTHER",
]);

export const revenueStreamEnum = z.enum([
  "INTERNSHIP_PROGRAMS",
  "TRAINING_PROGRAMS",
  "CERTIFICATION_SERVICES",
  "ACADEMIC_PARTNERSHIPS",
  "CORPORATE_SPONSORSHIPS",
  "EVENTS_AND_WORKSHOPS",
]);

export const expenseCategoryEnum = z.enum([
  "TECHNOLOGY",
  "MARKETING_AND_GROWTH",
  "OPERATIONS",
  "HUMAN_RESOURCES",
]);

export const approvalTierEnum = z.enum([
  "TEAM_LEAD",
  "FOUNDER",
  "FOUNDER_JOINT",
]);

export const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required."),
  billToName: z.string().min(2, "Bill-to name is required.").max(120),
  billToEmail: z.string().email("Valid email required.").optional().or(z.literal("")),
  billToAddress: z.string().max(500).optional().or(z.literal("")),
  billToGstin: z.string().max(20).optional().or(z.literal("")),
  description: z.string().min(10, "Description is required.").max(2000),
  subtotalPaise: z.coerce.number().int().positive("Subtotal must be positive."),
  gstRatePercent: z.coerce.number().min(0).max(28).optional(),
  hsnSac: z.string().max(20).optional().or(z.literal("")),
  placeOfSupply: z.string().max(100).optional().or(z.literal("")),
  paymentId: z.string().optional(),
});

export const updatePaymentStatusSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required."),
  status: z.enum(["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"]),
});

export const refundPaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required."),
  amountPaise: z.coerce.number().int().positive("Refund amount must be positive."),
  reason: z.string().min(5, "Reason is required.").max(500),
});

export const createExpenseSchema = z.object({
  category: z.enum(["TECHNOLOGY", "MARKETING_AND_GROWTH", "OPERATIONS", "HUMAN_RESOURCES"]),
  amountPaise: z.coerce.number().int().positive("Amount must be positive."),
  description: z.string().min(5, "Description is required.").max(1000).optional().or(z.literal("")),
  departmentId: z.string().optional(),
  vendorId: z.string().optional(),
  approvalTier: z.enum(["TEAM_LEAD", "FOUNDER", "FOUNDER_JOINT"]).default("TEAM_LEAD"),
  ownerId: z.string().optional(),
  approverId: z.string().optional(),
  secondApproverId: z.string().optional(),
  voucherUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
});

export const updateExpenseApprovalSchema = z.object({
  expenseId: z.string().min(1, "Expense ID is required."),
  action: z.enum(["APPROVE", "REJECT"]),
  approverId: z.string().min(1, "Approver ID is required."),
  secondApproverId: z.string().optional(),
});

export const createVendorSchema = z.object({
  name: z.string().min(2, "Vendor name is required.").max(120),
  service: z.string().max(200).optional().or(z.literal("")),
  soc2: z.boolean().default(false),
  iso27001: z.boolean().default(false),
  uptimeSla: z.string().max(100).optional().or(z.literal("")),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseApprovalInput = z.infer<typeof updateExpenseApprovalSchema>;
export type CreateVendorInput = z.infer<typeof createVendorSchema>;