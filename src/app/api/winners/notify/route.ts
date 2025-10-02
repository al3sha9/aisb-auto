import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface Winner {
  studentName: string
  position: number
  prize: string
  videoScore: number
  finalScore: number
  videoTitle: string
  email: string
}

const createWinnerEmailHtml = (winner: Winner) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Congratulations - Video Contest Winner</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #374151;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 8px 0 0 0;
          opacity: 0.9;
          font-size: 16px;
        }
        .content {
          padding: 32px 24px;
        }
        .award-badge {
          background-color: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          margin: 24px 0;
        }
        .award-badge h2 {
          margin: 0;
          color: #92400e;
          font-size: 20px;
          font-weight: 600;
        }
        .award-badge p {
          margin: 4px 0 0 0;
          color: #b45309;
          font-size: 14px;
        }
        .score-section {
          background-color: #f3f4f6;
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
        }
        .score-section h3 {
          margin: 0 0 12px 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
        }
        .score-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .score-item:last-child {
          border-bottom: none;
          font-weight: 600;
          color: #1f2937;
        }
        .cta-button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
          margin: 24px 0;
        }
        .footer {
          background-color: #1f2937;
          color: #9ca3af;
          padding: 24px;
          text-align: center;
          font-size: 14px;
        }
        .footer a {
          color: #60a5fa;
          text-decoration: none;
        }
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 24px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Congratulations!</h1>
          <p>You are a winner in our Video Contest</p>
        </div>
        
        <div class="content">
          <p>Dear ${winner.studentName},</p>
          
          <p>We are delighted to inform you that your video submission has been selected as one of the top performers in our contest. Your submission demonstrated exceptional quality and relevance to the contest topics.</p>
          
          <div class="award-badge">
            <h2>${winner.prize}</h2>
            <p>Position #${winner.position} out of all submissions</p>
          </div>
          
          <div class="score-section">
            <h3>Your Performance</h3>
            <div class="score-item">
              <span>Video Analysis Score:</span>
              <span>${winner.videoScore}/100</span>
            </div>
            <div class="score-item">
              <span>Final Score:</span>
              <span><strong>${winner.finalScore}/100</strong></span>
            </div>
          </div>
          
          <p>Your video submission: <strong>${winner.videoTitle}</strong></p>
          
          <div class="divider"></div>
          
          <p>This achievement reflects your dedication and expertise in the subject matter. Our AI-powered evaluation system recognized the quality and relevance of your content.</p>
          
          <p>We will be in touch soon with details about your certificate and any additional recognition.</p>
          
          <p>Once again, congratulations on this outstanding achievement!</p>
          
          <p>Best regards,<br>
          The Contest Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message from our video contest platform.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

const createWinnerEmailText = (winner: Winner) => {
  return `
Congratulations!

Dear ${winner.studentName},

We are delighted to inform you that your video submission has been selected as one of the top performers in our contest.

Award: ${winner.prize}
Position: #${winner.position} out of all submissions

Your Performance:
- Video Analysis Score: ${winner.videoScore}/100
- Final Score: ${winner.finalScore}/100

Video Submission: ${winner.videoTitle}

This achievement reflects your dedication and expertise in the subject matter. Our AI-powered evaluation system recognized the quality and relevance of your content.

We will be in touch soon with details about your certificate and any additional recognition.

Once again, congratulations on this outstanding achievement!

Best regards,
The Contest Team

---
This is an automated message from our video contest platform.
If you have any questions, please contact our support team.
  `
}

export async function POST(request: NextRequest) {
  try {
    const { winners } = await request.json()
    
    if (!winners || !Array.isArray(winners)) {
      return NextResponse.json({ error: 'Invalid winners data' }, { status: 400 })
    }

    const results = []

    for (const winner of winners) {
      try {
        console.log(`Attempting to send email to ${winner.email} from ${process.env.FROM_EMAIL}`)
        
        const emailResult = await resend.emails.send({
          from: process.env.FROM_EMAIL || 'Contest Team <contest@resend.dev>',
          to: [winner.email],
          subject: `Congratulations! You're a Winner - ${winner.prize}`,
          html: createWinnerEmailHtml(winner),
          text: createWinnerEmailText(winner)
        })

        console.log(`Email sent successfully to ${winner.email}:`, emailResult)

        results.push({
          studentName: winner.studentName,
          email: winner.email,
          success: true
        })
      } catch (error) {
        console.error(`Error sending email to ${winner.email}:`, error)
        results.push({
          studentName: winner.studentName,
          email: winner.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return NextResponse.json({
      message: `Sent ${successCount}/${totalCount} winner notifications`,
      results
    })

  } catch (error) {
    console.error('Error in winner notification API:', error)
    return NextResponse.json(
      { error: 'Failed to send winner notifications' },
      { status: 500 }
    )
  }
}