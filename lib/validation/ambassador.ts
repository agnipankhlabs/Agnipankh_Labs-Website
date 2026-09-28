import { z } from "zod";

export const createAmbassadorSchema = z.object({
  userId: z.string().cuid("Invalid user ID."),
  collegeId: z.string().cuid("Invalid college ID.").optional().nullable(),
  tier: z.enum(["TIER_1", "TIER_2", "TIER_3", "TIER_4"]).default("TIER_1"),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
  referralCode: z.string().min(3, "Referral code must be at least 3 characters.").max(20),
  isSenior: z.boolean().default(false),
});

export const updateAmbassadorSchema = createAmbassadorSchema.partial();

export const approveAmbassadorSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  tier: z.enum(["TIER_1", "TIER_2", "TIER_3", "TIER_4"]).optional(),
});

export type CreateAmbassadorInput = z.infer<typeof createAmbassadorSchema>;
export type UpdateAmbassadorInput = z.infer<typeof updateAmbassadorSchema>;
export type ApproveAmbassadorInput = z.infer<typeof approveAmbassadorSchema>;