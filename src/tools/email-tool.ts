
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const emailTool = tool(
  async ({ to, subject, body }) => {
    console.log(`Sending email to ${to} with subject "${subject}" and body "${body}"`);
    // In a real application, you would use a service like SendGrid or Nodemailer to send the email.
    return 'Email sent successfully';
  },
  {
    name: 'EmailTool',
    description: 'Sends an email to the specified recipient.',
    schema: z.object({
      to: z.string(),
      subject: z.string(),
      body: z.string(),
    }),
  }
);
