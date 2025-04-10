import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

const client = new SmtpClient();

serve(async (req) => {
  try {
    const { to, event, name, registrationNo, startDate, endDate, location } = await req.json();

    // Connect to Gmail SMTP
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: "genxclubsec@gmail.com",
      password: Deno.env.get('SMTP_PASSWORD')!
    });

    // Send confirmation email
    await client.send({
      from: "genxclubsec@gmail.com",
      to,
      subject: `Registration Confirmation - ${event}`,
      content: `
        Dear ${name},

        Thank you for registering for ${event}!

        Registration Details:
        - Name: ${name}
        - Registration Number: ${registrationNo}
        - Event: ${event}
        - Date: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}
        - Location: ${location}

        Please keep this email as your confirmation ticket.

        Best regards,
        GENx Club Team
      `,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error sending confirmation:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});