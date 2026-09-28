import { auth } from "@/auth";
import { enrollInCourseAction } from "@/app/actions/enrollment";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ success: false, message: "Course ID is required." }, { status: 400 });
    }

    const result = await enrollInCourseAction(courseId);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("[POST /api/enrollment] Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}