
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { emailTool } from "@/tools/email-tool";

export async function POST() {
  try {
    const { data: submissions, error: submissionsError } = await supabase
      .from("video_submissions")
      .select("*, students(name, email)");

    if (submissionsError) {
      throw submissionsError;
    }

    // This is a placeholder for the actual ranking logic.
    // In a real application, you would parse the evaluation and rank the students based on the score.
    const sortedSubmissions = submissions.sort((a, b) => {
      const scoreA = parseInt(a.evaluation.split("Score: ")[1]);
      const scoreB = parseInt(b.evaluation.split("Score: ")[1]);
      return scoreB - scoreA;
    });

    const top2 = sortedSubmissions.slice(0, 2);

    for (const submission of top2) {
      await emailTool.invoke({
        to: submission.students.email,
        subject: "Congratulations! You have passed the video submission round",
        body: `Congratulations! You have passed the video submission round. We will contact you shortly with the next steps.`,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 });
  }
}
