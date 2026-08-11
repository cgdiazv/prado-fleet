import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, category, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.log("[Support Ticket Received - Mock Sending (No RESEND_API_KEY configured)]:", {
        to: "support@pradofleet.com",
        from: `${name} <${email}>`,
        category,
        subject,
        message,
      });

      return NextResponse.json({
        success: true,
        mock: true,
        message: "Support ticket logged successfully! (Configure RESEND_API_KEY in .env.local to dispatch live emails).",
      });
    }

    const resend = new Resend(apiKey);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #d97706; margin-bottom: 4px;">New Prado Fleet Support Ticket</h2>
        <p style="font-size: 12px; color: #64748b; margin-top: 0;">Submitted via Prado Fleet Help & Support Portal</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        
        <p><strong>Submitter:</strong> ${name} (&lt;${email}&gt;)</p>
        <p><strong>Category:</strong> <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">${category || "General Inquiry"}</span></p>
        <p><strong>Subject:</strong> ${subject}</p>
        
        <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-top: 16px; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #0f172a;">Ticket Message:</h4>
          <p style="margin: 0; whitespace: pre-wrap; font-size: 14px; line-height: 1.5; color: #334155;">${message}</p>
        </div>
        
        <footer style="margin-top: 24px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px;">
          Sent automatically to support@pradofleet.com via Prado Fleet Engine.
        </footer>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "Prado Fleet Support <notifications@pradocommerce.com>",
      to: ["support@pradofleet.com"],
      replyTo: email,
      subject: `[Prado Fleet Ticket] ${subject}`,
      html: emailHtml,
    });

    if (error) {
      console.error("[Resend Email Error]:", error);
      return NextResponse.json(
        { error: error.message || "Failed to send email via Resend" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[POST /api/support/ticket error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit support ticket." },
      { status: 500 }
    );
  }
}
