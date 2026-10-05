import { getPublishedCourses } from "@/lib/supabase/courses";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const courses = await getPublishedCourses();

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Failed to fetch courses:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch courses",
      },
      {
        status: 500,
      },
    );
  }
}