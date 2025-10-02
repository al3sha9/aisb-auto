
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
        
        // Create personalized email content with professional design
        const emailBody = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Quiz Invitation</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                  AI Skill Bridge
                </h1>
                <p style="color: #e6e9ff; margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">
                  Assessment Platform
                </p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                  Quiz Invitation
                </h2>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                  Hello <strong style="color: #2d3748;">${student.name}</strong>,
                </p>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  You have been selected to participate in our assessment quiz: <strong style="color: #2d3748;">"${quiz.name}"</strong>. 
                  Please review the instructions below and begin when ready.
                </p>
                
                <!-- Instructions Card -->
                <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0;">
                  <h3 style="color: #2d3748; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                    Assessment Guidelines
                  </h3>
                  <ul style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Each question has a 10-second time limit</li>
                    <li style="margin-bottom: 8px;">Questions advance automatically when time expires</li>
                    <li style="margin-bottom: 8px;">Ensure stable internet connection before starting</li>
                    <li style="margin-bottom: 8px;">Answer accuracy and speed are both evaluated</li>
                    <li style="margin-bottom: 0;">Once started, the assessment cannot be paused</li>
                  </ul>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${quizLink}" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: #ffffff; 
                            text-decoration: none; 
                            padding: 16px 32px; 
                            border-radius: 8px; 
                            font-weight: 600; 
                            font-size: 16px; 
                            display: inline-block; 
                            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                            transition: transform 0.2s ease;">
                    Begin Assessment
                  </a>
                </div>
                
                <div style="background-color: #edf2f7; border-radius: 8px; padding: 16px; margin-top: 24px;">
                  <p style="color: #4a5568; font-size: 14px; margin: 0; text-align: center;">
                    <strong>Important:</strong> This quiz link is personalized for you. Do not share it with others.
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 24px 30px; border-top: 1px solid #e2e8f0;">
                <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center; line-height: 1.5;">
                  This is an automated message from AI Skill Bridge Assessment Platform.<br>
                  Please do not reply to this email.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        await emailTool.invoke({
          to: student.email,
          subject: `Assessment Invitation - ${quiz.name}`,
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
