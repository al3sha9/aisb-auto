
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { emailTool } from "@/tools/email-tool";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quizId } = body;

    // Fetch quiz details
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("name, time_per_question")
      .eq("id", quizId)
      .single();

    if (quizError) {
      throw new Error(`Quiz not found: ${quizError.message}`);
    }

    // Fetch all students
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, name, email");

    if (studentsError) {
      throw studentsError;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    let emailsSent = 0;
    let emailsFailed = 0;

    for (const student of students) {
      try {
        // Generate unique quiz link for each student
        const quizLink = `${baseUrl}/student/quiz/${quizId}?student=${student.id}`;
        
        // Create personalized email content
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center;">🎯 Quiz Invitation</h2>
            
            <p>Hello <strong>${student.name}</strong>,</p>
            
            <p>Great news! Your form has been selected, and you have been invited to take the quiz: <strong>"${quiz.name}"</strong></p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">⏰ Important Quiz Information:</h3>
              <ul style="color: #6c757d;">
                <li>You have <strong>${quiz.time_per_question} seconds</strong> to answer each question</li>
                <li>The quiz will automatically move to the next question when time runs out</li>
                <li>Make sure you have a stable internet connection</li>
                <li>Answer as quickly and accurately as possible</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${quizLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                🚀 Start Quiz Now
              </a>
            </div>
            
            <p style="color: #6c757d; font-size: 14px; text-align: center;">
              Good luck! 🍀
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            <p style="color: #868e96; font-size: 12px; text-align: center;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `;

        await emailTool.invoke({
          to: student.email,
          subject: `🎯 Quiz Invitation - ${quiz.name} (${quiz.time_per_question}s per question)`,
          body: emailBody,
        });

        emailsSent++;
      } catch (error) {
        console.error(`Failed to send email to ${student.email}:`, error);
        emailsFailed++;
      }
    }

    return NextResponse.json({ 
      success: true,
      emails_sent: emailsSent,
      emails_failed: emailsFailed,
      total_students: students.length
    }, { status: 200 });

  } catch (error) {
    console.error('Send invitations error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}
