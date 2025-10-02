
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { emailTool } from "@/tools/email-tool";

export async function POST() {
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
          student_id: student_id,
          score: 0,
          student: answer.students,
        };
      }
      if (is_correct) {
        acc[student_id].score++;
      }
      return acc;
    }, {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortedStudents = Object.values(scores).sort((a: any, b: any) => b.score - a.score);

    const top5 = sortedStudents.slice(0, 5);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    for (const student of top5) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentData = student as any; // Type assertion for now
      // Create unique video submission link for each student
      const videoSubmissionLink = `${baseUrl}/student/submit-video?student=${studentData.student_id}`;
      
      // Create personalized email content
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #28a745; text-align: center;">🎉 Congratulations!</h2>
          
          <p>Hello <strong>${studentData.student.name}</strong>,</p>
          
          <p>Fantastic news! You are one of the <strong>top 5 students</strong> and have been selected to move to the next phase of our program!</p>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">📹 Next Step: Video Submission</h3>
            <p style="color: #155724; margin-bottom: 0;">
              Please submit a video on the topic: <strong>"AI and its impact on society"</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${videoSubmissionLink}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              🎬 Submit Your Video
            </a>
          </div>
          
          <p style="color: #6c757d; font-size: 14px;">
            <strong>Instructions:</strong><br>
            • Share your YouTube video link<br>
            • Keep it engaging and informative<br>
            • Make sure the video is publicly accessible
          </p>
          
          <p style="color: #6c757d; font-size: 14px; text-align: center;">
            Congratulations again on your excellent performance! 🌟
          </p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          <p style="color: #868e96; font-size: 12px; text-align: center;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `;

      await emailTool.invoke({
        to: studentData.student.email,
        subject: "🎉 Congratulations! You're in the Top 5 - Video Submission Required",
        body: emailBody,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 });
  }
}
