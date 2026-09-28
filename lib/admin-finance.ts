import { prisma } from "@/lib/db";
import type { PaymentStatus, RevenueStream, PaymentMode, ExpenseCategory, ApprovalTier } from "@/lib/generated/prisma/client";

export interface AdminPaymentRecord {
  id: string;
  userId: string | null;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  revenueStream: RevenueStream;
  mode: PaymentMode | null;
  gatewayName: string | null;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  refundedAmountPaise: number | null;
  refundedAt: Date | null;
  failureReason: string | null;
  invoice: { id: string; invoiceNumber: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminInvoiceRecord {
  id: string;
  invoiceNumber: string;
  paymentId: string | null;
  billToName: string;
  billToEmail: string | null;
  billToAddress: string | null;
  billToGstin: string | null;
  description: string;
  subtotalPaise: number;
  gstRatePercent: number | null;
  cgstPaise: number | null;
  sgstPaise: number | null;
  igstPaise: number | null;
  totalPaise: number;
  hsnSac: string | null;
  placeOfSupply: string | null;
  issuedAt: Date;
  authorizedBy: string | null;
}

export interface AdminExpenseRecord {
  id: string;
  category: ExpenseCategory;
  amountPaise: number;
  description: string | null;
  departmentId: string | null;
  departmentName: string | null;
  vendorId: string | null;
  vendorName: string | null;
  ownerId: string | null;
  approverId: string | null;
  secondApproverId: string | null;
  approvalTier: ApprovalTier;
  approvedAt: Date | null;
  voucherUrl: string | null;
  createdAt: Date;
}

export interface AdminVendorRecord {
  id: string;
  name: string;
  service: string | null;
  soc2: boolean;
  iso27001: boolean;
  uptimeSla: string | null;
  lastReviewedAt: Date | null;
  expenseCount: number;
  totalExpensePaise: number;
  createdAt: Date;
}

const memoryPayments: AdminPaymentRecord[] = [];
const memoryInvoices: AdminInvoiceRecord[] = [];
const memoryExpenses: AdminExpenseRecord[] = [];
const memoryVendors: AdminVendorRecord[] = [];

/**
 * Get payments with filtering and pagination
 */
export async function getAdminPayments(filters?: {
  status?: string;
  revenueStream?: string;
  mode?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ payments: AdminPaymentRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  let list: AdminPaymentRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {};

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters?.revenueStream && filters.revenueStream !== "ALL") {
      where.revenueStream = filters.revenueStream;
    }

    if (filters?.mode && filters.mode !== "ALL") {
      where.mode = filters.mode;
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { gatewayOrderId: { contains: q, mode: "insensitive" } },
        { gatewayPaymentId: { contains: q, mode: "insensitive" } },
        { user: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [dbPayments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { 
          user: { select: { email: true } },
          invoice: { select: { id: true, invoiceNumber: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.payment.count({ where }),
    ]);

    list = dbPayments.map((p) => ({
      id: p.id,
      userId: p.userId,
      amountPaise: p.amountPaise,
      currency: p.currency,
      status: p.status,
      revenueStream: p.revenueStream,
      mode: p.mode,
      gatewayName: p.gatewayName,
      gatewayOrderId: p.gatewayOrderId,
      gatewayPaymentId: p.gatewayPaymentId,
      refundedAmountPaise: p.refundedAmountPaise,
      refundedAt: p.refundedAt,
      failureReason: p.failureReason,
      invoice: p.invoice ? { id: p.invoice.id, invoiceNumber: p.invoice.invoiceNumber } : null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    total = totalCount;
  } catch {
    const filtered = memoryPayments.filter((p) => {
      if (filters?.status && filters.status !== "ALL" && p.status !== filters.status) return false;
      if (filters?.revenueStream && filters.revenueStream !== "ALL" && p.revenueStream !== filters.revenueStream) return false;
      if (filters?.mode && filters.mode !== "ALL" && p.mode !== filters.mode) return false;
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        return (
          p.gatewayOrderId?.toLowerCase().includes(q) ||
          p.gatewayPaymentId?.toLowerCase().includes(q)
        );
      }
      return true;
    });
    total = filtered.length;
    list = filtered.slice(skip, skip + pageSize);
  }

  return { payments: list, total };
}

/**
 * Get invoices with filtering and pagination
 */
export async function getAdminInvoices(filters?: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ invoices: AdminInvoiceRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  let list: AdminInvoiceRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {};

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { invoiceNumber: { contains: q, mode: "insensitive" } },
        { billToName: { contains: q, mode: "insensitive" } },
        { billToEmail: { contains: q, mode: "insensitive" } },
      ];
    }

    const [dbInvoices, totalCount] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { issuedAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.invoice.count({ where }),
    ]);

    list = dbInvoices.map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      paymentId: i.paymentId,
      billToName: i.billToName,
      billToEmail: i.billToEmail,
      billToAddress: i.billToAddress,
      billToGstin: i.billToGstin,
      description: i.description,
      subtotalPaise: i.subtotalPaise,
      gstRatePercent: i.gstRatePercent ? Number(i.gstRatePercent) : null,
      cgstPaise: i.cgstPaise,
      sgstPaise: i.sgstPaise,
      igstPaise: i.igstPaise,
      totalPaise: i.totalPaise,
      hsnSac: i.hsnSac,
      placeOfSupply: i.placeOfSupply,
      issuedAt: i.issuedAt,
      authorizedBy: i.authorizedBy,
    }));
    total = totalCount;
  } catch {
    const filtered = memoryInvoices.filter((i) => {
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        return (
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.billToName.toLowerCase().includes(q) ||
          i.billToEmail?.toLowerCase().includes(q)
        );
      }
      return true;
    });
    total = filtered.length;
    list = filtered.slice(skip, skip + pageSize);
  }

  return { invoices: list, total };
}

/**
 * Get expenses with filtering and pagination
 */
export async function getAdminExpenses(filters?: {
  category?: string;
  approvalTier?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ expenses: AdminExpenseRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  let list: AdminExpenseRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {};

    if (filters?.category && filters.category !== "ALL") {
      where.category = filters.category;
    }

    if (filters?.approvalTier && filters.approvalTier !== "ALL") {
      where.approvalTier = filters.approvalTier;
    }

    if (filters?.status === "PENDING") {
      where.approvedAt = null;
    } else if (filters?.status === "APPROVED") {
      where.approvedAt = { not: null };
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { description: { contains: q, mode: "insensitive" } },
        { vendor: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [dbExpenses, totalCount] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          department: { select: { name: true } },
          vendor: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.expense.count({ where }),
    ]);

    list = dbExpenses.map((e) => ({
      id: e.id,
      category: e.category,
      amountPaise: e.amountPaise,
      description: e.description,
      departmentId: e.departmentId,
      departmentName: e.department?.name ?? null,
      vendorId: e.vendorId,
      vendorName: e.vendor?.name ?? null,
      ownerId: e.ownerId,
      approverId: e.approverId,
      secondApproverId: e.secondApproverId,
      approvalTier: e.approvalTier,
      approvedAt: e.approvedAt,
      voucherUrl: e.voucherUrl,
      createdAt: e.createdAt,
    }));
    total = totalCount;
  } catch {
    const filtered = memoryExpenses.filter((e) => {
      if (filters?.category && filters.category !== "ALL" && e.category !== filters.category) return false;
      if (filters?.approvalTier && filters.approvalTier !== "ALL" && e.approvalTier !== filters.approvalTier) return false;
      if (filters?.status === "PENDING" && e.approvedAt) return false;
      if (filters?.status === "APPROVED" && !e.approvedAt) return false;
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        return (
          e.description?.toLowerCase().includes(q) ||
          e.vendorName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
    total = filtered.length;
    list = filtered.slice(skip, skip + pageSize);
  }

  return { expenses: list, total };
}

/**
 * Get vendors with expense aggregation
 */
export async function getAdminVendors(filters?: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ vendors: AdminVendorRecord[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  let list: AdminVendorRecord[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = {};

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { service: { contains: q, mode: "insensitive" } },
      ];
    }

    const [dbVendors, totalCount] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          _count: { select: { expenses: true } },
          expenses: { select: { amountPaise: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.vendor.count({ where }),
    ]);

    list = dbVendors.map((v) => ({
      id: v.id,
      name: v.name,
      service: v.service,
      soc2: v.soc2,
      iso27001: v.iso27001,
      uptimeSla: v.uptimeSla,
      lastReviewedAt: v.lastReviewedAt,
      expenseCount: v._count.expenses,
      totalExpensePaise: v.expenses.reduce((sum, e) => sum + e.amountPaise, 0),
      createdAt: v.createdAt,
    }));
    total = totalCount;
  } catch {
    const filtered = memoryVendors.filter((v) => {
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        return v.name.toLowerCase().includes(q) || v.service?.toLowerCase().includes(q);
      }
      return true;
    });
    total = filtered.length;
    list = filtered.slice(skip, skip + pageSize);
  }

  return { vendors: list, total };
}

/**
 * KPI stats for admin finance desk
 */
export async function getAdminFinanceStats(): Promise<{
  totalRevenuePaise: number;
  pendingPaymentsPaise: number;
  refundedPaise: number;
  totalInvoices: number;
  totalExpensesPaise: number;
  pendingExpensesPaise: number;
  approvedExpensesPaise: number;
  vendorCount: number;
}> {
  try {
    const [
      totalRevenueAgg,
      pendingPaymentsAgg,
      refundedAgg,
      totalInvoices,
      totalExpensesAgg,
      pendingExpensesAgg,
      approvedExpensesAgg,
      vendorCount,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amountPaise: true },
      }),
      prisma.payment.aggregate({
        where: { status: "PENDING" },
        _sum: { amountPaise: true },
      }),
      prisma.payment.aggregate({
        where: { status: { in: ["REFUNDED", "PARTIALLY_REFUNDED"] } },
        _sum: { amountPaise: true },
      }),
      prisma.invoice.count(),
      prisma.expense.aggregate({ _sum: { amountPaise: true } }),
      prisma.expense.aggregate({
        where: { approvedAt: null },
        _sum: { amountPaise: true },
      }),
      prisma.expense.aggregate({
        where: { approvedAt: { not: null } },
        _sum: { amountPaise: true },
      }),
      prisma.vendor.count(),
    ]);

    return {
      totalRevenuePaise: totalRevenueAgg._sum.amountPaise ?? 0,
      pendingPaymentsPaise: pendingPaymentsAgg._sum.amountPaise ?? 0,
      refundedPaise: refundedAgg._sum.amountPaise ?? 0,
      totalInvoices,
      totalExpensesPaise: totalExpensesAgg._sum.amountPaise ?? 0,
      pendingExpensesPaise: pendingExpensesAgg._sum.amountPaise ?? 0,
      approvedExpensesPaise: approvedExpensesAgg._sum.amountPaise ?? 0,
      vendorCount,
    };
  } catch {
    return {
      totalRevenuePaise: 0,
      pendingPaymentsPaise: 0,
      refundedPaise: 0,
      totalInvoices: 0,
      totalExpensesPaise: 0,
      pendingExpensesPaise: 0,
      approvedExpensesPaise: 0,
      vendorCount: 0,
    };
  }
}

/**
 * Revenue breakdown by stream
 */
export async function getRevenueByStream(): Promise<Record<string, number>> {
  try {
    const result = await prisma.payment.groupBy({
      by: ["revenueStream"],
      where: { status: "PAID" },
      _sum: { amountPaise: true },
    });

    const breakdown: Record<string, number> = {};
    for (const item of result) {
      breakdown[item.revenueStream] = item._sum.amountPaise ?? 0;
    }
    return breakdown;
  } catch {
    return {};
  }
}

/**
 * Expense breakdown by category
 */
export async function getExpensesByCategory(): Promise<Record<string, number>> {
  try {
    const result = await prisma.expense.groupBy({
      by: ["category"],
      where: { approvedAt: { not: null } },
      _sum: { amountPaise: true },
    });

    const breakdown: Record<string, number> = {};
    for (const item of result) {
      breakdown[item.category] = item._sum.amountPaise ?? 0;
    }
    return breakdown;
  } catch {
    return {};
  }
}

// Memory store helpers
export function recordMemoryPayment(record: AdminPaymentRecord): void {
  const idx = memoryPayments.findIndex((m) => m.id === record.id);
  if (idx >= 0) memoryPayments[idx] = record; else memoryPayments.unshift(record);
}

export function recordMemoryInvoice(record: AdminInvoiceRecord): void {
  const idx = memoryInvoices.findIndex((m) => m.id === record.id);
  if (idx >= 0) memoryInvoices[idx] = record; else memoryInvoices.unshift(record);
}

export function recordMemoryExpense(record: AdminExpenseRecord): void {
  const idx = memoryExpenses.findIndex((m) => m.id === record.id);
  if (idx >= 0) memoryExpenses[idx] = record; else memoryExpenses.unshift(record);
}

export function recordMemoryVendor(record: AdminVendorRecord): void {
  const idx = memoryVendors.findIndex((m) => m.id === record.id);
  if (idx >= 0) memoryVendors[idx] = record; else memoryVendors.unshift(record);
}