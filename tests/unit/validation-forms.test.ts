import { describe, it, expect } from "vitest";
import {
  contactSchema,
  newsletterSchema,
  partnershipSchema,
  toFieldErrors,
} from "@/lib/validation/forms";

describe("Public Forms Validation Schemas", () => {
  describe("contactSchema", () => {
    const validContact = {
      name: "Arjun Verma",
      email: "arjun@example.com",
      phone: "9876543210",
      message: "I would like to know more about the Next.js training cohort.",
      consent: true,
      website: "",
    };

    it("accepts valid contact submissions", () => {
      const result = contactSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });

    it("rejects names shorter than 2 characters", () => {
      const result = contactSchema.safeParse({ ...validContact, name: "A" });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = toFieldErrors(result.error);
        expect(errors.name).toBeDefined();
      }
    });

    it("rejects invalid emails and normalizes valid emails to lowercase", () => {
      const invalid = contactSchema.safeParse({
        ...validContact,
        email: "not-an-email",
      });
      expect(invalid.success).toBe(false);

      const upper = contactSchema.safeParse({
        ...validContact,
        email: "ARJUN@EXAMPLE.COM",
      });
      expect(upper.success).toBe(true);
      if (upper.success) {
        expect(upper.data.email).toBe("arjun@example.com");
      }
    });

    it("requires DPDP consent", () => {
      const withoutConsent = contactSchema.safeParse({
        ...validContact,
        consent: false,
      });
      expect(withoutConsent.success).toBe(false);
      if (!withoutConsent.success) {
        const errors = toFieldErrors(withoutConsent.error);
        expect(errors.consent).toContain(
          "Please agree to the Privacy Policy to continue.",
        );
      }
    });

    it("catches bots via honeypot field", () => {
      const botSubmission = contactSchema.safeParse({
        ...validContact,
        website: "https://spam-bot.site",
      });
      expect(botSubmission.success).toBe(false);
      if (!botSubmission.success) {
        const errors = toFieldErrors(botSubmission.error);
        expect(errors.website).toBeDefined();
      }
    });
  });

  describe("newsletterSchema", () => {
    it("accepts valid email and rejects invalid email", () => {
      expect(
        newsletterSchema.safeParse({ email: "subscriber@agnipankh.com" }).success,
      ).toBe(true);
      expect(
        newsletterSchema.safeParse({ email: "invalid-email" }).success,
      ).toBe(false);
    });

    it("rejects honeypot submission", () => {
      expect(
        newsletterSchema.safeParse({
          email: "valid@agnipankh.com",
          website: "bot-payload",
        }).success,
      ).toBe(false);
    });
  });

  describe("partnershipSchema", () => {
    const validPartnership = {
      name: "Dr. Raman",
      email: "raman@institute.edu",
      partnerType: "COLLEGE",
      organizationName: "National Institute of Technology",
      message: "We would like to partner for student placement cohorts.",
      consent: true,
      website: "",
    };

    it("accepts valid partnership inquiry", () => {
      expect(partnershipSchema.safeParse(validPartnership).success).toBe(true);
    });

    it("validates partnerType enum", () => {
      const invalidType = partnershipSchema.safeParse({
        ...validPartnership,
        partnerType: "INDIVIDUAL",
      });
      expect(invalidType.success).toBe(false);
    });
  });
});
