import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateCertificatePdfBuffer, type CertificatePdfProps } from "@/lib/certificates/pdf";
import { certificateVerifyUrl } from "@/lib/certificates";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;
    const session = await auth();
    const userId = session?.user?.id;
    const roles = (session?.user as unknown as { roles?: string[] })?.roles ?? [];

    if (!userId) {
      return new NextResponse("Authentication required", { status: 401 });
    }

    const isAdmin = roles.includes("admin") || roles.includes("super_admin") || roles.includes("trainer");

    const cert = await prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!cert) {
      return new NextResponse("Certificate not found", { status: 404 });
    }

    // Authorization: recipient or admin
    const isRecipient = cert.userId === userId;
    if (!isRecipient && !isAdmin) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const verifyUrl = cert.qrCodeUrl ?? certificateVerifyUrl(certificateId);

    const pdfProps: CertificatePdfProps = {
      certificateId: cert.certificateId,
      recipientName: cert.verifiedFullLegalName,
      programName: cert.programName,
      trackName: cert.trackName,
      type: cert.type,
      issueDate: cert.issueDate,
      cohortStartDate: cert.cohortStartDate,
      cohortEndDate: cert.cohortEndDate,
      signatureAuthority: cert.signatureAuthority ?? "Director — Agnipankh Labs",
      signatureRef: cert.signatureRef,
      verifyUrl,
      sha256Hash: cert.sha256Hash,
    };

    const pdfBuffer = await generateCertificatePdfBuffer(pdfProps);

    // Record the download
    await prisma.certificateDownload.create({
      data: {
        certificateId: cert.id,
        ipAddress: request.headers.get("x-forwarded-for") ?? null,
      },
    });

    // Increment download count
    await prisma.certificate.update({
      where: { id: cert.id },
      data: { downloadCount: { increment: 1 } },
    });

    const filename = `Agnipankh-Labs-Certificate-${certificateId}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[GET /api/certificates/[certificateId]/download] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}