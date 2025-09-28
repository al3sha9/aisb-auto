
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { emailTool } from "@/tools/email-tool";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quizId } = body;

    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("email");

    if (studentsError) {
      throw studentsError;
    }

    const quizLink = `${process.env.NEXT_PUBLIC_BASE_URL}/student/quiz/${quizId}`;

    for (const student of students) {
      await emailTool.invoke({
        to: student.email,
        subject: "You have been invited to a quiz",
        body: `Please click on the following link to start the quiz: ${quizLink}`,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
