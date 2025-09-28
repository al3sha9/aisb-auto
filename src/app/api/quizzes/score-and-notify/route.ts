
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { emailTool } from "@/tools/email-tool";

export async function POST(req: NextRequest) {
  try {
    const { data: answers, error: answersError } = await supabase
      .from("answers")
      .select("*, students(name, email)");

    if (answersError) {
      throw answersError;
    }

    const scores = answers.reduce((acc, answer) => {
      const { student_id, is_correct } = answer;
      if (!acc[student_id]) {
        acc[student_id] = {
          score: 0,
          student: answer.students,
        };
      }
      if (is_correct) {
        acc[student_id].score++;
      }
      return acc;
    }, {});

    const sortedStudents = Object.values(scores).sort((a: any, b: any) => b.score - a.score);

    const top5 = sortedStudents.slice(0, 5);

    const videoSubmissionLink = `${process.env.NEXT_PUBLIC_BASE_URL}/student/submit-video`;

    for (const student of top5) {
      await emailTool.invoke({
        to: student.student.email,
        subject: "Congratulations! You are in the top 5",
        body: `Congratulations! You are one of the top 5 students. Please submit a video on the topic of "AI and its impact on society" by clicking on the following link: ${videoSubmissionLink}`,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
