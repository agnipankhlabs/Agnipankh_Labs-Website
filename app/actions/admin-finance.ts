"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  createInvoiceSchema,
  updatePaymentStatusSchema,
  refundPaymentSchema,
  createExpenseSchema,
  updateExpenseApprovalSchema,
  createVendorSchema,
} from "@/lib/validation/finance";

export interface FinanceActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  id?: string;
}

function assertAdmin(
  roles: string[] | undefined
): { ok: true } | { ok: false; error: FinanceActionResult } {
  const isAdmin =
    roles?.includes("admin") ||
    roles?.includes("super_admin") ||
    roles?.includes("finance") ||
    roles?.includes("trainer");

  if (!isAdmin) {
    return { ok: false, error: { success: false, message: "Unauthorised." } };
  }
  return { ok: true };
}

/**
 * Create a new invoice
 */
export async function createInvoiceAction(
  prevState: FinanceActionResult | null,
  formData: FormData
): Promise<FinanceActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    invoiceNumber: formData.get("invoiceNumber"),
    billToName: formData.get("billToName"),
    billToEmail: formData.get("billToEmail"),
    billToAddress: formData.get("billToAddress"),
    billToGstin: formData.get("billToGstin"),
    description: formData.get("description"),
    subtotalPaise: formData.get("subtotalPaise"),
    gstRatePercent: formData.get("gstRatePercent"),
    hsnSac: formData.get("hsnSac"),
    placeOfSupply: formData.get("placeOfSupply"),
    paymentId: formData.get("paymentId"),
  };

  const parsed = createInvoiceSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, message: "Please fix the validation errors.", fieldErrors };
  }

  const data = parsed.data;

  // Calculate GST amounts
  const subtotal = parsed.data.subtotalPaise;
  const gstRate = parsed.data.gstRatePercent ?? 18; // Default 18% GST
  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;
  const total = subtotal + gstAmount;

  try {
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: parsed.data.invoiceNumber,
        billToName: parsed.data.billToName,
        billToEmail: parsed.data.billToEmail || null,
        billToAddress: parsed.data.billToAddress || null,
        billToGstin: parsed.data.billToGstin || null,
        description: parsed.data.description,
        subtotalPaise: parsed.data.subtotalPaise,
        gstRatePercent: parsed.data.gstRatePercent ? parsed.data.gstRatePercent : null,
        cgstPaise: cgst,
        sgstPaise: sgst,
        igstPaise: 0,
        totalPaise: total,
        hsnSac: parsed.data.hsnSac || null,
        placeOfSupply: parsed.data.placeOfSupply || null,
        paymentId: parsed.data.paymentId || null,
        authorizedBy: session?.user?.id ?? null,
      },
    });

    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/invoices");

    return { success: true, message: `Invoice ${invoice.invoiceNumber} created.`, id: invoice.id };
  } catch (error) {
    console.error("[createInvoiceAction] Error:", error);
    return { success: false, message: "Failed to create invoice." };
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatusAction(
  paymentId: string,
  status: string
): Promise<FinanceActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = updatePaymentStatusSchema.safeParse({ paymentId, status });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      return { success: false, message: "Payment not found." };
    }

    // If marking as PAID, ensure we have gateway info
    if (parsed.data.status === "PAID" && !payment.gatewayPaymentId) {
      return { success: false, message: "Gateway payment ID required for PAID status." };
    }

    const updateData: Record<string, unknown> = { status: parsed.data.status };

    if (parsed.data.status === "PAID") {
      // Mark as paid
    } else if (parsed.data.status === "REFUNDED" || parsed.data.status === "PARTIALLY_REFUNDED") {
      // Refund details would be handled by refund action
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
    });
  } catch (error) {
    console.error("[updatePaymentStatusAction] Error:", error);
    return { success: false, message: "Failed to update payment status." };
  }

  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/payments");

  return { success: true, message: `Payment status updated to ${status}.` };
}

/**
 * Process a refund
 */
export async function refundPaymentAction(
  paymentId: string,
  amountPaise: number,
  reason: string
): Promise<FinanceActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = refundPaymentSchema.safeParse({ paymentId, amountPaise, reason });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      return { success: false, message: "Payment not found." };
    }

    if (payment.status !== "PAID") {
      return { success: false, message: "Only PAID payments can be refunded." };
    }

    const totalRefunded = (payment.refundedAmountPaise ?? 0) + parsed.data.amountPaise;
    if (totalRefunded > payment.amountPaise) {
      return { success: false, message: "Refund amount exceeds payment amount." };
    }

    const newStatus = totalRefunded >= payment.amountPaise ? "REFUNDED" : "PARTIALLY_REFUNDED";

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: newStatus,
        refundedAmountPaise: totalRefunded,
        refundedAt: new Date(),
        failureReason: reason,
      },
    });
  } catch (error) {
    console.error("[refundPaymentAction] Error:", error);
    return { success: false, message: "Failed to process refund." };
  }

  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/payments");

  return { success: true, message: `Refund of ₹${(amountPaise / 100).toLocaleString("en-IN")} processed.` };
}

/**
 * Create a new expense
 */
export async function createExpenseAction(
  prevState: FinanceActionResult | null,
  formData: FormData
): Promise<FinanceActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    category: formData.get("category"),
    amountPaise: formData.get("amountPaise"),
    description: formData.get("description"),
    departmentId: formData.get("departmentId"),
    vendorId: formData.get("vendorId"),
    approvalTier: formData.get("approvalTier"),
    ownerId: formData.get("ownerId"),
    approverId: formData.get("approverId"),
    secondApproverId: formData.get("secondApproverId"),
    voucherUrl: formData.get("voucherUrl"),
  };

  const parsed = createExpenseSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, message: "Please fix the validation errors.", fieldErrors };
  }

  const data = parsed.data;

  try {
    const expense = await prisma.expense.create({
      data: {
        category: parsed.data.category,
        amountPaise: parsed.data.amountPaise,
        description: parsed.data.description || null,
        departmentId: parsed.data.departmentId || null,
        vendorId: parsed.data.vendorId || null,
        ownerId: parsed.data.ownerId ?? session?.user?.id ?? null,
        approvalTier: parsed.data.approvalTier,
        approverId: parsed.data.approverId || null,
        secondApproverId: parsed.data.secondApproverId || null,
        voucherUrl: parsed.data.voucherUrl || null,
      },
    });

    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/expenses");

    return { success: true, message: "Expense created successfully.", id: expense.id };
  } catch (error) {
    console.error("[createExpenseAction] Error:", error);
    return { success: false, message: "Failed to create expense." };
  }
}

/**
 * Approve or reject an expense
 */
export async function updateExpenseApprovalAction(
  expenseId: string,
  action: "APPROVE" | "REJECT",
  approverId: string,
  secondApproverId?: string
): Promise<FinanceActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const parsed = updateExpenseApprovalSchema.safeParse({
    expenseId,
    action,
    approverId,
    secondApproverId,
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  try {
    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense) {
      return { success: false, message: "Expense not found." };
    }

    if (expense.approvedAt) {
      return { success: false, message: "Expense already processed." };
    }

    const updateData: Record<string, unknown> = {};

    if (action === "APPROVE") {
      // Check if second approval needed
      if (expense.approvalTier === "FOUNDER_JOINT" && !expense.secondApproverId) {
        // First approval
        updateData.approverId = approverId;
        updateData.approvedAt = new Date();
      } else {
        // Final approval
        updateData.approverId = approverId;
        updateData.secondApproverId = secondApproverId ?? null;
        updateData.approvedAt = new Date();
      }
    } else {
      // REJECT
      updateData.approverId = approverId;
      updateData.approvedAt = new Date(); // Mark as processed (rejected)
    }

    await prisma.expense.update({
      where: { id: expenseId },
      data: updateData,
    });
  } catch (error) {
    console.error("[updateExpenseApprovalAction] Error:", error);
    return { success: false, message: "Failed to update expense approval." };
  }

  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/expenses");

  return { success: true, message: `Expense ${action.toLowerCase()}d.` };
}

/**
 * Create a new vendor
 */
export async function createVendorAction(
  prevState: FinanceActionResult | null,
  formData: FormData
): Promise<FinanceActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  const rawData = {
    name: formData.get("name"),
    service: formData.get("service"),
    soc2: formData.get("soc2") === "on",
    iso27001: formData.get("iso27001") === "on",
    uptimeSla: formData.get("uptimeSla"),
  };

  const parsed = createVendorSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, message: "Please fix the validation errors.", fieldErrors };
  }

  try {
    const vendor = await prisma.vendor.create({
      data: parsed.data,
    });

    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/vendors");

    return { success: true, message: "Vendor created successfully.", id: vendor.id };
  } catch (error) {
    console.error("[createVendorAction] Error:", error);
    return { success: false, message: "Failed to create vendor." };
  }
}

/**
 * Update payment status (for admin)
 */
export async function updatePaymentAction(
  paymentId: string,
  data: {
    status?: string;
    mode?: string;
    gatewayName?: string;
    gatewayOrderId?: string;
    gatewayPaymentId?: string;
  }
): Promise<FinanceActionResult> {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles;
  const check = assertAdmin(roles);
  if (!check.ok) return check.error;

  try {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: data.status as "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED" | "PARTIALLY_REFUNDED",
        mode: data.mode as "UPI" | "NET_BANKING" | "CARD" | "WALLET" | "OTHER",
        gatewayName: data.gatewayName,
        gatewayOrderId: data.gatewayOrderId,
        gatewayPaymentId: data.gatewayPaymentId,
      },
    });
  } catch (error) {
    console.error("[updatePaymentAction] Error:", error);
    return { success: false, message: "Failed to update payment." };
  }

  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/payments");

  return { success: true, message: "Payment updated." };
}