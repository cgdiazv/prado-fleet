import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generateVerificationToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { driverId } = await request.json();

    if (!driverId) {
      return NextResponse.json({ error: "Driver ID is required." }, { status: 400 });
    }

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found." }, { status: 404 });
    }

    const inviteToken = generateVerificationToken();
    const inviteExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.driver.update({
      where: { id: driverId },
      data: {
        inviteToken,
        inviteExpires,
      },
    });

    const apiKey = process.env.RESEND_API_KEY;
    const origin = process.env.NEXT_PUBLIC_APP_URL || "https://pradofleet.com";
    const inviteUrl = `${origin}/accept-invite?token=${inviteToken}`;

    if (!apiKey) {
      console.log(`[Resend Invite Mock] Invite link for driver ${driver.name} (${driver.email}): ${inviteUrl}`);
      return NextResponse.json({
        success: true,
        mock: true,
        inviteUrl,
        message: `Invitation link generated: ${inviteUrl}`,
      });
    }

    const resend = new Resend(apiKey);
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #d97706; margin-top: 0;">Welcome to Prado Fleet, ${driver.name}!</h2>
        <p style="font-size: 14px; color: #475569;">
          You have been registered as a Commercial Driver in the Prado Fleet Asset Intelligence Platform.
        </p>
        
        <p style="font-size: 14px; color: #475569;">
          Please click the button below to set your secure password and activate your Mobile Driver Shift Portal:
        </p>
        
        <div style="margin: 24px 0;">
          <a href="${inviteUrl}" style="background-color: #fbbf24; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
            Activate Account & Set Password
          </a>
        </div>

        <p style="font-size: 12px; color: #94a3b8;">
          This link will expire in 24 hours. If you did not request this email, please contact your Fleet Administrator.
        </p>
      </div>
    `;

    await resend.emails.send({
      from: "Prado Fleet <notifications@pradocommerce.com>",
      to: [driver.email],
      subject: "Welcome to Prado Fleet — Set Up Your Driver Password",
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: `Invitation email sent to ${driver.email}!`,
    });
  } catch (error: any) {
    console.error("[Resend Invite Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send invitation email." },
      { status: 500 }
    );
  }
}
