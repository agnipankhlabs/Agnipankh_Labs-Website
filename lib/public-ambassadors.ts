import { prisma } from "@/lib/db";
import type { AmbassadorTier, ApprovalStatus } from "@/lib/generated/prisma/client";

export interface PublicAmbassadorProfile {
  id: string;
  referralCode: string;
  userName: string | null;
  userEmail: string | null;
  collegeName: string | null;
  tier: AmbassadorTier;
  status: ApprovalStatus;
  isSenior: boolean;
  referralCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicAmbassadorSummary {
  referralCode: string;
  name: string;
  college: string;
  course: string;
  year: string;
  tier: AmbassadorTier;
  status: ApprovalStatus;
  isSenior: boolean;
  referralCount: number;
  joinedAt: Date;
  linkedin: string | null;
  github: string | null;
  bio: string | null;
}

const memoryAmbassadors: PublicAmbassadorProfile[] = [];

export async function getPublicAmbassadorByCode(
  referralCode: string
): Promise<PublicAmbassadorProfile | null> {
  try {
    const ambassador = await prisma.campusAmbassador.findUnique({
      where: { referralCode },
      include: {
        user: { select: { name: true, email: true } },
        college: { select: { name: true } },
      },
    });
    if (!ambassador) return null;
    return {
      id: ambassador.id,
      referralCode: ambassador.referralCode,
      userName: ambassador.user?.name ?? null,
      userEmail: ambassador.user?.email ?? null,
      collegeName: ambassador.college?.name ?? null,
      tier: ambassador.tier,
      status: ambassador.status,
      isSenior: ambassador.isSenior,
      referralCount: ambassador.referralCount,
      createdAt: ambassador.createdAt,
      updatedAt: ambassador.updatedAt,
    };
  } catch {
    return memoryAmbassadors.find((a) => a.referralCode === referralCode) ?? null;
  }
}

export async function getPublicAmbassadorById(
  id: string
): Promise<PublicAmbassadorProfile | null> {
  try {
    const ambassador = await prisma.campusAmbassador.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        college: { select: { name: true } },
      },
    });
    if (!ambassador) return null;
    return {
      id: ambassador.id,
      referralCode: ambassador.referralCode,
      userName: ambassador.user?.name ?? null,
      userEmail: ambassador.user?.email ?? null,
      collegeName: ambassador.college?.name ?? null,
      tier: ambassador.tier,
      status: ambassador.status,
      isSenior: ambassador.isSenior,
      referralCount: ambassador.referralCount,
      createdAt: ambassador.createdAt,
      updatedAt: ambassador.updatedAt,
    };
  } catch {
    return memoryAmbassadors.find((a) => a.id === id) ?? null;
  }
}

export function mapToPublicSummary(ambassador: PublicAmbassadorProfile): PublicAmbassadorSummary {
  return {
    referralCode: ambassador.referralCode,
    name: ambassador.userName ?? "Ambassador",
    college: ambassador.collegeName ?? "Not specified",
    course: "Course not specified",
    year: "Year not specified",
    tier: ambassador.tier,
    status: ambassador.status,
    isSenior: ambassador.isSenior,
    referralCount: ambassador.referralCount,
    joinedAt: ambassador.createdAt,
    linkedin: null,
    github: null,
    bio: null,
  };
}

export function recordMemoryAmbassador(record: PublicAmbassadorProfile): void {
  const idx = memoryAmbassadors.findIndex((m) => m.id === record.id);
  if (idx >= 0) {
    memoryAmbassadors[idx] = record;
  } else {
    memoryAmbassadors.unshift(record);
  }
}