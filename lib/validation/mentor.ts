import { z } from "zod";

export const mentorApprovalSchema = z.object({
  mentorId: z.string().min(1, "Mentor ID is required."),
  action: z.enum(["APPROVE", "REJECT"]),
  approvedById: z.string().min(1, "Approver ID is required."),
  rejectionReason: z.string().max(500).optional(),
});

export const mentorEvaluationSchema = z.object({
  mentorId: z.string().min(1, "Mentor ID is required."),
  engagement: z.coerce.number().int().min(1).max(5, "Engagement must be 1-5."),
  communication: z.coerce.number().int().min(1).max(5, "Communication must be 1-5."),
  reviewDetail: z.coerce.number().int().min(1).max(5, "Review detail must be 1-5."),
  learnerImpact: z.coerce.number().int().min(1).max(5, "Learner impact must be 1-5."),
  reviewPeriod: z.string().min(1, "Review period is required."),
  administrativeAction: z.string().max(500).optional(),
});

export const mentorFilterSchema = z.object({
  approvalStatus: z.enum(["ALL", "PENDING", "APPROVED", "REJECTED"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type MentorApprovalInput = z.infer<typeof mentorApprovalSchema>;
export type MentorEvaluationInput = z.infer<typeof mentorEvaluationSchema>;
export type MentorFilterInput = z.infer<typeof mentorFilterSchema>;