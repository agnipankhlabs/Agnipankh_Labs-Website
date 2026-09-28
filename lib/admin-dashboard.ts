import { prisma } from "@/lib/db";

export interface AdminDashboardStats {
  // Users
  totalUsers: number;
  activeStudents: number;
  totalStaff: number;
  pendingVerifications: number;

  // Leads
  totalLeads: number;
  newLeadsThisWeek: number;
  leadsByKind: Record<string, number>;

  // Internships
  totalInternships: number;
  activeInternships: number;
  totalApplications: number;
  pendingApplications: number;

  // Courses
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;

  // Certificates
  totalCertificates: number;
  activeCertificates: number;
  revokedCertificates: number;
  totalDownloads: number;

  // Support
  openTickets: number;
  ticketsSlaBreach: number;

  // Finance
  totalRevenuePaise: number;
  pendingPaymentsPaise: number;
}

/**
 * Get comprehensive admin dashboard stats.
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const [
      // Users
      totalUsers,
      activeStudents,
      totalStaff,
      pendingVerifications,

      // Leads
      totalLeads,
      newLeadsThisWeek,
      leadsByKindRaw,

      // Internships
      totalInternships,
      activeInternships,
      totalApplications,
      pendingApplications,

      // Courses
      totalCourses,
      publishedCourses,
      totalEnrollments,
      activeEnrollments,

      // Certificates
      totalCertificates,
      activeCertificates,
      revokedCertificates,
      totalDownloadsAgg,

      // Support
      openTickets,
      ticketsSlaBreach,

      // Finance
      totalRevenueAgg,
      pendingPaymentsAgg,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          roles: { some: { role: { key: "student" } } },
          suspendedAt: null,
        },
      }),
      prisma.user.count({
        where: {
          roles: { some: { role: { isStaff: true } } },
        },
      }),
      prisma.profile.count({ where: { verificationStatus: "PENDING" } }),

      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.lead.groupBy({ by: ["kind"], _count: { kind: true } }),

      prisma.internship.count(),
      prisma.internship.count({ where: { isPublished: true } }),
      prisma.application.count(),
      prisma.application.count({ where: { stage: "APPLICATION_RECEIVED" } }),

      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: "ACTIVE" } }),

      prisma.certificate.count(),
      prisma.certificate.count({ where: { revokedAt: null } }),
      prisma.certificate.count({ where: { revokedAt: { not: null } } }),
      prisma.certificate.aggregate({ _sum: { downloadCount: true } }),

      prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      prisma.supportTicket.count({
        where: {
          status: { in: ["OPEN", "IN_PROGRESS"] },
          slaDueAt: { lt: new Date() },
        },
      }),

      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amountPaise: true },
      }),
      prisma.payment.aggregate({
        where: { status: "PENDING" },
        _sum: { amountPaise: true },
      }),
    ]);

    const leadsByKind: Record<string, number> = {};
    for (const item of leadsByKindRaw) {
      leadsByKind[item.kind] = item._count.kind;
    }

    const totalRevenuePaise = totalRevenueAgg._sum.amountPaise ?? 0;
    const pendingPaymentsPaise = pendingPaymentsAgg._sum.amountPaise ?? 0;
    const totalDownloads = totalDownloadsAgg._sum.downloadCount ?? 0;

    return {
      totalUsers,
      activeStudents,
      totalStaff,
      pendingVerifications,
      totalLeads,
      newLeadsThisWeek,
      leadsByKind,
      totalInternships,
      activeInternships,
      totalApplications,
      pendingApplications,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      activeEnrollments,
      totalCertificates,
      activeCertificates,
      revokedCertificates,
      totalDownloads,
      openTickets,
      ticketsSlaBreach,
      totalRevenuePaise,
      pendingPaymentsPaise,
    };
  } catch (error) {
    console.error("[getAdminDashboardStats] Error:", error);
    return getEmptyStats();
  }
}

function getEmptyStats(): AdminDashboardStats {
  return {
    totalUsers: 0,
    activeStudents: 0,
    totalStaff: 0,
    pendingVerifications: 0,
    totalLeads: 0,
    newLeadsThisWeek: 0,
    leadsByKind: {},
    totalInternships: 0,
    activeInternships: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    totalCertificates: 0,
    activeCertificates: 0,
    revokedCertificates: 0,
    totalDownloads: 0,
    openTickets: 0,
    ticketsSlaBreach: 0,
    totalRevenuePaise: 0,
    pendingPaymentsPaise: 0,
  };
}