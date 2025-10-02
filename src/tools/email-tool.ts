
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailTool = tool(
  async (input) => {
    const { to, subject, body } = input as { to: string; subject: string; body: string };
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        to: [to],
        subject: subject,
        html: body,
        text: body.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log(`Email sent successfully to ${to}`, data);
      return 'Email sent successfully';
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  },
  {
    name: 'EmailTool',
    description: 'Sends an email to the specified recipient using Resend.',
    schema: z.object({
      to: z.string(),
      subject: z.string(),
      body: z.string(),
    }),
  }
);
