"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { profileSchema } from "@/lib/validation/profile";

export interface ProfileActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateProfile(
  prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be signed in to update your profile.",
      };
    }

    const rawData = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone") || undefined,
      headline: formData.get("headline") || undefined,
      bio: formData.get("bio") || undefined,
      city: formData.get("city") || undefined,
      state: formData.get("state") || undefined,
      college: formData.get("college") || undefined,
      degree: formData.get("degree") || undefined,
      branch: formData.get("branch") || undefined,
      graduationYear: formData.get("graduationYear") || undefined,
      skills: formData.get("skills") || "",
      githubUrl: formData.get("githubUrl") || undefined,
      linkedinUrl: formData.get("linkedinUrl") || undefined,
      portfolioUrl: formData.get("portfolioUrl") || undefined,
    };

    const parsed = profileSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check your inputs and try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const data = parsed.data;

    try {
      // Upsert profile for this user
      await prisma.profile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          fullName: data.fullName,
          phone: data.phone || null,
          headline: data.headline || null,
          bio: data.bio || null,
          city: data.city || null,
          state: data.state || null,
          college: data.college || null,
          degree: data.degree || null,
          branch: data.branch || null,
          graduationYear: data.graduationYear || null,
          skills: data.skills,
          githubUrl: data.githubUrl || null,
          linkedinUrl: data.linkedinUrl || null,
          portfolioUrl: data.portfolioUrl || null,
        },
        update: {
          fullName: data.fullName,
          phone: data.phone || null,
          headline: data.headline || null,
          bio: data.bio || null,
          city: data.city || null,
          state: data.state || null,
          college: data.college || null,
          degree: data.degree || null,
          branch: data.branch || null,
          graduationYear: data.graduationYear || null,
          skills: data.skills,
          githubUrl: data.githubUrl || null,
          linkedinUrl: data.linkedinUrl || null,
          portfolioUrl: data.portfolioUrl || null,
        },
      });

      // Update user display name if changed
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: data.fullName },
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/profile");

      return {
        success: true,
        message: "Profile updated successfully!",
      };
    } catch (dbError) {
      console.error("[profile] Database error:", dbError);
      return {
        success: false,
        message:
          "Unable to connect to the profile database at this time. Please try again shortly.",
      };
    }
  } catch (error) {
    console.error("[profile] Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
