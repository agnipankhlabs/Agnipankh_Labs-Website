import { z } from "zod";

export const referralCodeSchema = z.object({
  code: z.string().min(6, "Referral code must be at least 6 characters.").max(20),
});

export const createReferralSchema = z.object({
  referrerUserId: z.string().cuid("Invalid referrer user ID."),
  referredUserId: z.string().cuid("Invalid referred user ID.").optional().nullable(),
  code: z.string().min(6).max(20),
  rewardNote: z.string().max(500).optional(),
});

export const updateReferralSchema = z.object({
  rewardGranted: z.boolean().optional(),
  rewardNote: z.string().max(500).optional(),
});

export type ReferralCodeInput = z.infer<typeof referralCodeSchema>;
export type CreateReferralInput = z.infer<typeof createReferralSchema>;
export type UpdateReferralInput = z.infer<typeof updateReferralSchema>;