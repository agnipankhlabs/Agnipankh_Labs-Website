import { prisma } from "@/lib/db";
import { subDays, startOfDay, format } from "date-fns";

export interface AnalyticsOverview {
  users: {
    total: number;
    newThisWeek: number;
    newThisMonth: number;
    activeThisWeek: number;
    activeThisMonth: number;
    byRole: Record<string, number>;
  };
  leads: {
    total: number;
    newThisWeek: number;
    newThisMonth: number;
    byKind: Record<string, number>;
    byStatus: Record<string, number>;
    conversionRate: number;
  };
  internships: {
    total: number;
    published: number;
    totalApplications: number;
    applicationsThisWeek: number;
    applicationsThisMonth: number;
    byDomain: Record<string, number>;
    byStage: Record<string, number>;
  };
  courses: {
    total: number;
    published: number;
    totalEnrollments: number;
    enrollmentsThisWeek: number;
    enrollmentsThisMonth: number;
    completionRate: number;
    byLevel: Record<string, number>;
  };
  certificates: {
    total: number;
    issuedThisWeek: number;
    issuedThisMonth: number;
    active: number;
    revoked: number;
    downloads: number;
    byType: Record<string, number>;
  };
  finance: {
    totalRevenue: number;
    revenueThisWeek: number;
    revenueThisMonth: number;
    pendingPayments: number;
    byStream: Record<string, number>;
  };
  engagement: {
    avgSessionDuration: number;
    bounceRate: number;
    pagesPerSession: number;
  };
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface AnalyticsTimeSeries {
  users: TimeSeriesData[];
  leads: TimeSeriesData[];
  applications: TimeSeriesData[];
  enrollments: TimeSeriesData[];
  certificates: TimeSeriesData[];
  revenue: TimeSeriesData[];
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  try {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);

    // Users
    const [totalUsers, newUsersThisWeek, newUsersThisMonth, usersByRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.userRole.groupBy({
        by: ["roleId"],
        _count: { roleId: true },
      }),
    ]);

    // Get role names
    const roles = await prisma.role.findMany({
      where: { id: { in: usersByRole.map((r) => r.roleId) } },
      select: { id: true, key: true },
    });
    const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.key]));
    const byRole: Record<string, number> = {};
    for (const r of usersByRole) {
      byRole[roleMap[r.roleId] ?? r.roleId] = r._count.roleId;
    }

    // Leads
    const [totalLeads, newLeadsThisWeek, newLeadsThisMonth, leadsByKind, leadsByStatus, , convertedLeads] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.lead.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.lead.groupBy({ by: ["kind"], _count: { kind: true } }),
      prisma.lead.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.lead.count({ where: { status: { in: ["QUALIFIED", "CONVERTED"] } } }),
      prisma.lead.count({ where: { status: "CONVERTED" } }),
    ]);

    const leadsByKindObj: Record<string, number> = {};
    for (const l of leadsByKind) leadsByKindObj[l.kind] = l._count.kind;
    const leadsByStatusObj: Record<string, number> = {};
    for (const l of leadsByStatus) leadsByStatusObj[l.status] = l._count.status;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Internships
    const [totalInternships, publishedInternships, totalApplications, appsThisWeek, appsThisMonth, appsByDomain, appsByStage] = await Promise.all([
      prisma.internship.count(),
      prisma.internship.count({ where: { isPublished: true } }),
      prisma.application.count(),
      prisma.application.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.application.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.internship.groupBy({ by: ["domain"], _count: { domain: true } }),
      prisma.application.groupBy({ by: ["stage"], _count: { stage: true } }),
    ]);

    const appsByDomainObj: Record<string, number> = {};
    for (const a of appsByDomain) appsByDomainObj[a.domain] = a._count.domain;
    const appsByStageObj: Record<string, number> = {};
    for (const a of appsByStage) appsByStageObj[a.stage] = a._count.stage;

    // Courses
    const [totalCourses, publishedCourses, totalEnrollments, enrollmentsThisWeek, enrollmentsThisMonth, completedEnrollments, enrollmentsByLevel] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.enrollment.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.enrollment.count({ where: { status: "COMPLETED" } }),
      prisma.course.groupBy({ by: ["level"], _count: { level: true } }),
    ]);

    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
    const enrollmentsByLevelObj: Record<string, number> = {};
    for (const e of enrollmentsByLevel) enrollmentsByLevelObj[e.level ?? "Unknown"] = e._count.level;

    // Certificates
    const [totalCertificates, certsThisWeek, certsThisMonth, activeCerts, revokedCerts, totalDownloads, certsByType] = await Promise.all([
      prisma.certificate.count(),
      prisma.certificate.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.certificate.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.certificate.count({ where: { revokedAt: null } }),
      prisma.certificate.count({ where: { revokedAt: { not: null } } }),
      prisma.certificate.aggregate({ _sum: { downloadCount: true } }),
      prisma.certificate.groupBy({ by: ["type"], _count: { type: true } }),
    ]);

    const certsByTypeObj: Record<string, number> = {};
    for (const c of certsByType) certsByTypeObj[c.type] = c._count.type;

    // Finance
    const [totalRevenue, revenueThisWeek, revenueThisMonth, pendingPayments, paymentsByStream] = await Promise.all([
      prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amountPaise: true } }),
      prisma.payment.aggregate({ where: { status: "PAID", createdAt: { gte: weekAgo } }, _sum: { amountPaise: true } }),
      prisma.payment.aggregate({ where: { status: "PAID", createdAt: { gte: monthAgo } }, _sum: { amountPaise: true } }),
      prisma.payment.aggregate({ where: { status: "PENDING" }, _sum: { amountPaise: true } }),
      prisma.payment.groupBy({ by: ["revenueStream"], _sum: { amountPaise: true } }),
    ]);

    const paymentsByStreamObj: Record<string, number> = {};
    for (const p of paymentsByStream) paymentsByStreamObj[p.revenueStream] = p._sum.amountPaise ?? 0;

    return {
      users: { total: totalUsers, newThisWeek: newUsersThisWeek, newThisMonth: newUsersThisMonth, activeThisWeek: 0, activeThisMonth: 0, byRole },
      leads: { total: totalLeads, newThisWeek: newLeadsThisWeek, newThisMonth: newLeadsThisMonth, byKind: leadsByKindObj, byStatus: leadsByStatusObj, conversionRate },
      internships: { total: totalInternships, published: publishedInternships, totalApplications, applicationsThisWeek: appsThisWeek, applicationsThisMonth: appsThisMonth, byDomain: appsByDomainObj, byStage: appsByStageObj },
      courses: { total: totalCourses, published: publishedCourses, totalEnrollments, enrollmentsThisWeek, enrollmentsThisMonth, completionRate, byLevel: enrollmentsByLevelObj },
      certificates: { total: totalCertificates, issuedThisWeek: certsThisWeek, issuedThisMonth: certsThisMonth, active: activeCerts, revoked: revokedCerts, downloads: totalDownloads._sum.downloadCount ?? 0, byType: certsByTypeObj },
      finance: { totalRevenue: totalRevenue._sum.amountPaise ?? 0, revenueThisWeek: revenueThisWeek._sum.amountPaise ?? 0, revenueThisMonth: revenueThisMonth._sum.amountPaise ?? 0, pendingPayments: pendingPayments._sum.amountPaise ?? 0, byStream: paymentsByStreamObj },
      engagement: { avgSessionDuration: 0, bounceRate: 0, pagesPerSession: 0 },
    };
  } catch (error) {
    console.error("[getAnalyticsOverview] Error:", error);
    return getEmptyOverview();
  }
}

function getEmptyOverview(): AnalyticsOverview {
  return {
    users: { total: 0, newThisWeek: 0, newThisMonth: 0, activeThisWeek: 0, activeThisMonth: 0, byRole: {} },
    leads: { total: 0, newThisWeek: 0, newThisMonth: 0, byKind: {}, byStatus: {}, conversionRate: 0 },
    internships: { total: 0, published: 0, totalApplications: 0, applicationsThisWeek: 0, applicationsThisMonth: 0, byDomain: {}, byStage: {} },
    courses: { total: 0, published: 0, totalEnrollments: 0, enrollmentsThisWeek: 0, enrollmentsThisMonth: 0, completionRate: 0, byLevel: {} },
    certificates: { total: 0, issuedThisWeek: 0, issuedThisMonth: 0, active: 0, revoked: 0, downloads: 0, byType: {} },
    finance: { totalRevenue: 0, revenueThisWeek: 0, revenueThisMonth: 0, pendingPayments: 0, byStream: {} },
    engagement: { avgSessionDuration: 0, bounceRate: 0, pagesPerSession: 0 },
  };
}

export async function getAnalyticsTimeSeries(days: number = 30): Promise<AnalyticsTimeSeries> {
  try {
    const now = new Date();
    const startDate = subDays(now, days);

    // Generate date range
    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = subDays(now, days - 1 - i);
      dates.push(format(d, "yyyy-MM-dd"));
    }

    // Users time series
    const usersByDay = await prisma.user.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: startOfDay(startDate) } },
      _count: { createdAt: true },
    });

    const usersMap = new Map<string, number>();
    for (const u of usersByDay) {
      const day = format(u.createdAt, "yyyy-MM-dd");
      usersMap.set(day, u._count.createdAt);
    }

    const users: TimeSeriesData[] = dates.map((d) => ({ date: d, value: usersMap.get(d) ?? 0, label: format(new Date(d), "MMM d") }));

    // Leads time series
    const leadsByDay = await prisma.lead.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: startOfDay(startDate) } },
      _count: { createdAt: true },
    });

    const leadsMap = new Map<string, number>();
    for (const l of leadsByDay) {
      const day = format(l.createdAt, "yyyy-MM-dd");
      leadsMap.set(day, l._count.createdAt);
    }

    const leads: TimeSeriesData[] = dates.map((d) => ({ date: d, value: leadsMap.get(d) ?? 0, label: format(new Date(d), "MMM d") }));

    // Applications time series
    const appsByDay = await prisma.application.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: startOfDay(startDate) } },
      _count: { createdAt: true },
    });

    const appsMap = new Map<string, number>();
    for (const a of appsByDay) {
      const day = format(a.createdAt, "yyyy-MM-dd");
      appsMap.set(day, a._count.createdAt);
    }

    const applications: TimeSeriesData[] = dates.map((d) => ({ date: d, value: appsMap.get(d) ?? 0, label: format(new Date(d), "MMM d") }));

    // Enrollments time series
    const enrollmentsByDay = await prisma.enrollment.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: startOfDay(startDate) } },
      _count: { createdAt: true },
    });

    const enrollmentsMap = new Map<string, number>();
    for (const e of enrollmentsByDay) {
      const day = format(e.createdAt, "yyyy-MM-dd");
      enrollmentsMap.set(day, e._count.createdAt);
    }

    const enrollments: TimeSeriesData[] = dates.map((d) => ({ date: d, value: enrollmentsMap.get(d) ?? 0, label: format(new Date(d), "MMM d") }));

    // Certificates time series
    const certsByDay = await prisma.certificate.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: startOfDay(startDate) } },
      _count: { createdAt: true },
    });

    const certsMap = new Map<string, number>();
    for (const c of certsByDay) {
      const day = format(c.createdAt, "yyyy-MM-dd");
      certsMap.set(day, c._count.createdAt);
    }

    const certificates: TimeSeriesData[] = dates.map((d) => ({ date: d, value: certsMap.get(d) ?? 0, label: format(new Date(d), "MMM d") }));

    // Revenue time series
    const revenueByDay = await prisma.payment.groupBy({
      by: ["createdAt"],
      where: { status: "PAID", createdAt: { gte: startOfDay(startDate) } },
      _sum: { amountPaise: true },
    });

    const revenueMap = new Map<string, number>();
    for (const r of revenueByDay) {
      const day = format(r.createdAt, "yyyy-MM-dd");
      revenueMap.set(day, (r._sum.amountPaise ?? 0) / 100);
    }

    const revenue: TimeSeriesData[] = dates.map((d) => ({ date: d, value: revenueMap.get(d) ?? 0, label: format(new Date(d), "MMM d") }));

    return { users, leads, applications, enrollments, certificates, revenue };
  } catch (error) {
    console.error("[getAnalyticsTimeSeries] Error:", error);
    return getEmptyTimeSeries(days);
  }
}

function getEmptyTimeSeries(days: number): AnalyticsTimeSeries {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = subDays(now, days - 1 - i);
    dates.push(format(d, "yyyy-MM-dd"));
  }
  const empty = dates.map((d) => ({ date: d, value: 0, label: format(new Date(d), "MMM d") }));
  return { users: empty, leads: empty, applications: empty, enrollments: empty, certificates: empty, revenue: empty };
}

export async function getTopPerformers(limit: number = 10): Promise<{
  topReferrers: Array<{ userId: string; name: string | null; email: string | null; referralCount: number }>;
  topMentors: Array<{ mentorId: string; name: string | null; avgScore: number; evaluationCount: number }>;
  topCourses: Array<{ courseId: string; title: string; enrollmentCount: number; completionRate: number }>;
}> {
  try {
    const [topReferrers, topMentors] = await Promise.all([
      prisma.campusAmbassador.findMany({
        where: { referralCount: { gt: 0 } },
        orderBy: { referralCount: "desc" },
        take: limit,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.mentorEvaluation.groupBy({
        by: ["mentorId"],
        _avg: { score: true },
        _count: { mentorId: true },
        orderBy: { _avg: { score: "desc" } },
        take: limit,
      }),
    ]);

    const mentorIds = topMentors.map((m) => m.mentorId);
    const mentors = await prisma.mentor.findMany({
      where: { id: { in: mentorIds } },
      include: { user: { select: { name: true, email: true } } },
    });
    const mentorMap = Object.fromEntries(mentors.map((m) => [m.id, m]));

    const topMentorsWithNames = topMentors.map((m) => ({
      mentorId: m.mentorId,
      name: mentorMap[m.mentorId]?.user?.name ?? null,
      avgScore: Math.round(m._avg.score ?? 0),
      evaluationCount: m._count.mentorId,
    }));

    const topCoursesData = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        _count: { select: { enrollments: true } },
        enrollments: { where: { status: "COMPLETED" }, select: { id: true } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: limit,
    });

    const topCourses = topCoursesData.map((c) => ({
      courseId: c.id,
      title: c.title,
      enrollmentCount: c._count.enrollments,
      completionRate: c._count.enrollments > 0 ? (c.enrollments.length / c._count.enrollments) * 100 : 0,
    }));

    return {
      topReferrers: topReferrers.map((r) => ({
        userId: r.userId,
        name: r.user?.name ?? null,
        email: r.user?.email ?? null,
        referralCount: r.referralCount,
      })),
      topMentors: topMentorsWithNames,
      topCourses,
    };
  } catch (error) {
    console.error("[getTopPerformers] Error:", error);
    return { topReferrers: [], topMentors: [], topCourses: [] };
  }
}