import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const DEFAULT_FROM_EMAIL = "Prado Fleet <notifications@pradocommerce.com>";

export type SendWelcomeEmailOptions = {
  to: string;
  name: string;
};

export type SendVerificationEmailOptions = {
  to: string;
  name: string;
  token: string;
};

export async function sendVerificationEmail({ to, name, token }: SendVerificationEmailOptions) {
  if (!resend) {
    console.warn(
      "[Resend] RESEND_API_KEY is not set in environment variables. Skipping verification email dispatch."
    );
    return { success: false, reason: "MISSING_API_KEY" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pradofleet.com";
  const verificationUrl = `${appUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  const firstName = name.split(" ")[0] || name;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Prado Fleet Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f7f3; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 32px 28px 32px; text-align: left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #facc15; padding: 8px 12px; border-radius: 8px; font-weight: bold; color: #020617; font-size: 16px;">
                      Prado Fleet
                    </div>
                    <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
                      Email Verification Required
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                Confirm your email address, ${firstName}
              </h1>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Thank you for registering with <strong>Prado Fleet</strong>. Please click the button below to confirm your email address and finish setting up your account.
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #facc15;">
                    <a href="${verificationUrl}" target="_blank" style="font-size: 15px; font-weight: 700; color: #020617; text-decoration: none; padding: 14px 32px; border-radius: 10px; border: 1px solid #eab308; display: inline-block; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);">
                      Confirm Email Address &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; color: #0284c7; word-break: break-all;">
                <a href="${verificationUrl}" style="color: #0284c7; text-decoration: underline;">${verificationUrl}</a>
              </p>

              <div style="padding: 12px 16px; background-color: #f8fafc; border-left: 4px solid #facc15; border-radius: 4px; font-size: 12px; color: #475569;">
                <strong>Note:</strong> This verification link will expire in 24 hours. If you didn't create an account with Prado Fleet, you can safely ignore this message.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #475569;">
                Prado Fleet — Fleet Operations & Telematics
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} Prado Systems. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject: `Confirm your Prado Fleet email address`,
      html: htmlContent,
    });

    console.log(`[Resend] Verification email dispatched to ${to}. Email ID:`, data.data?.id);
    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error("[Resend] Failed to send verification email:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail({ to, name }: SendWelcomeEmailOptions) {
  if (!resend) {
    console.warn(
      "[Resend] RESEND_API_KEY is not set in environment variables. Skipping welcome email dispatch."
    );
    return { success: false, reason: "MISSING_API_KEY" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pradofleet.com";
  const firstName = name.split(" ")[0] || name;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Prado Fleet</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f7f3; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 32px 28px 32px; text-align: left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #facc15; padding: 8px 12px; border-radius: 8px; font-weight: bold; color: #020617; font-size: 16px;">
                      Prado Fleet
                    </div>
                    <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
                      Asset Intelligence Platform
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                Welcome aboard, ${firstName}!
              </h1>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Thank you for verifying your email with <strong>Prado Fleet</strong>. Your operations workspace is now active and ready to help you manage vehicles, mobile DVIR inspections, telematics, and maintenance from a single control center.
              </p>

              <!-- Highlights Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0; background-color: #fffdf5; border: 1px solid #fef08a; border-radius: 12px; padding: 20px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #854d0e; text-transform: uppercase; letter-spacing: 0.5px;">
                      Quick Start Guide
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #451a03; font-size: 14px; line-height: 1.7;">
                      <li style="margin-bottom: 6px;"><strong>Operations Control Center:</strong> Monitor active trucks & asset status in real time.</li>
                      <li style="margin-bottom: 6px;"><strong>Mobile DVIR Checklist:</strong> Run DOT-compliant pre-trip & post-trip inspections.</li>
                      <li><strong>Predictive Maintenance:</strong> Turn fault codes directly into service work orders.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 24px 0;">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #facc15;">
                    <a href="${appUrl}/dashboard" target="_blank" style="font-size: 15px; font-weight: 700; color: #020617; text-decoration: none; padding: 14px 28px; border-radius: 10px; border: 1px solid #eab308; display: inline-block; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);">
                      Access Operations Control Center &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                If you have any questions or need help setting up your fleet, simply reply to this email or contact our support team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #475569;">
                Prado Fleet — Fleet Operations & Telematics
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} Prado Systems. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject: `Welcome to Prado Fleet, ${firstName}!`,
      html: htmlContent,
    });

    console.log(`[Resend] Welcome email dispatched successfully to ${to}. Email ID:`, data.data?.id);
    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error("[Resend] Failed to send welcome email:", error);
    return { success: false, error };
  }
}

export type SendDvirAlertOptions = {
  to: string;
  driverName: string;
  vehicleName: string;
  defects: string[];
  notes?: string;
};

export async function sendDvirDefectAlertEmail({
  to,
  driverName,
  vehicleName,
  defects,
  notes,
}: SendDvirAlertOptions) {
  if (!resend) {
    console.warn(
      "[Resend] RESEND_API_KEY is not set in environment variables. Skipping DVIR defect alert email dispatch."
    );
    return { success: false, reason: "MISSING_API_KEY" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pradofleet.com";
  const defectItems = defects.map((d) => `<li style="margin-bottom: 6px; color: #991b1b; font-weight: bold;">❌ ${d}</li>`).join("");

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DVIR Defect Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f7f3; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #fee2e2; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(225, 29, 72, 0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #991b1b; padding: 24px 32px; text-align: left;">
              <div style="display: inline-block; background-color: #fef2f2; padding: 6px 12px; border-radius: 8px; font-weight: bold; color: #991b1b; font-size: 14px;">
                🚨 Urgent DVIR Safety Defect Flagged
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
                Defects Reported for ${vehicleName}
              </h1>

              <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155;">
                Driver <strong>${driverName}</strong> completed a DVIR inspection and reported safety defects requiring technician review before vehicle operation.
              </p>

              <!-- Defects List Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #991b1b; text-transform: uppercase;">
                      Flagged Defects
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                      ${defectItems}
                    </ul>
                    ${notes ? `<p style="margin: 12px 0 0 0; font-size: 13px; color: #7f1d1d; border-t: 1px border #fca5a5; pt: 8px;"><strong>Driver Notes:</strong> ${notes}</p>` : ""}
                  </td>
                </tr>
              </table>

              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #0f172a;">
                    <a href="${appUrl}/dashboard/maintenance" target="_blank" style="font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; display: inline-block;">
                      View Maintenance Work Orders &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Prado Fleet Operations Alerting • &copy; ${new Date().getFullYear()} Prado Systems.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject: `🚨 ALERT: DVIR Defects Flagged on ${vehicleName} by ${driverName}`,
      html: htmlContent,
    });

    console.log(`[Resend] DVIR Defect Alert dispatched to ${to}. Email ID:`, data.data?.id);
    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error("[Resend] Failed to send DVIR defect alert email:", error);
    return { success: false, error };
  }
}

export type PartsRequisitionItem = {
  partName: string;
  partNumber: string;
  supplier: string;
  supplierUrl?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
};

export type SendPartsRequisitionEmailOptions = {
  to: string;
  managerName: string;
  vehicleName: string;
  workOrderTitle: string;
  parts: PartsRequisitionItem[];
  grandTotal: number;
};

export async function sendPartsRequisitionEmail({
  to,
  managerName,
  vehicleName,
  workOrderTitle,
  parts,
  grandTotal,
}: SendPartsRequisitionEmailOptions) {
  if (!resend) {
    console.warn("[Resend] RESEND_API_KEY not set. Skipping parts requisition email.");
    return { success: false, reason: "MISSING_API_KEY" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pradofleet.com";
  const firstName = managerName.split(" ")[0] || managerName;
  const orderedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const rowsHtml = parts
    .map(
      (p, i) => `
      <tr style="background-color: ${i % 2 === 0 ? "#ffffff" : "#f8fafc"};">
        <td style="padding: 10px 12px; font-size: 13px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${p.partName}</td>
        <td style="padding: 10px 12px; font-size: 12px; color: #64748b; font-family: monospace; border-bottom: 1px solid #e2e8f0;">${p.partNumber}</td>
        <td style="padding: 10px 12px; font-size: 12px; color: #334155; border-bottom: 1px solid #e2e8f0;">
          ${p.supplierUrl
            ? `<a href="${p.supplierUrl}" style="color: #0284c7; text-decoration: underline;">${p.supplier}</a>`
            : p.supplier}
        </td>
        <td style="padding: 10px 12px; font-size: 13px; color: #334155; text-align: center; border-bottom: 1px solid #e2e8f0;">${p.quantity}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #334155; text-align: right; font-family: monospace; border-bottom: 1px solid #e2e8f0;">$${p.unitCost.toFixed(2)}</td>
        <td style="padding: 10px 12px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right; font-family: monospace; border-bottom: 1px solid #e2e8f0;">$${p.totalCost.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parts Requisition Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f7f3; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 32px;">
              <div style="display: inline-block; background-color: #facc15; padding: 7px 12px; border-radius: 8px; font-weight: bold; color: #020617; font-size: 15px;">Prado Fleet</div>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Parts Requisition Confirmed</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #0f172a;">Parts Order Submitted, ${firstName}</h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #334155; line-height: 1.6;">
                Your parts requisition for <strong>${vehicleName}</strong> has been confirmed and attached to the work order below.
              </p>

              <!-- Work Order Summary -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #fffdf5; border: 1px solid #fef08a; border-radius: 12px; padding: 16px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">Work Order</p>
                    <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #0f172a;">${workOrderTitle}</p>
                    <p style="margin: 0; font-size: 12px; color: #64748b;">Vehicle: <strong>${vehicleName}</strong> &nbsp;·&nbsp; Ordered: ${orderedDate}</p>
                  </td>
                </tr>
              </table>

              <!-- Parts Table -->
              <h3 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Itemized Parts List (${parts.length} ${parts.length === 1 ? "item" : "items"})</h3>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f1f5f9;">
                    <th style="padding: 9px 12px; font-size: 10px; font-weight: 700; color: #64748b; text-align: left; text-transform: uppercase; letter-spacing: 0.5px;">Part Description</th>
                    <th style="padding: 9px 12px; font-size: 10px; font-weight: 700; color: #64748b; text-align: left; text-transform: uppercase; letter-spacing: 0.5px;">SKU</th>
                    <th style="padding: 9px 12px; font-size: 10px; font-weight: 700; color: #64748b; text-align: left; text-transform: uppercase; letter-spacing: 0.5px;">Supplier</th>
                    <th style="padding: 9px 12px; font-size: 10px; font-weight: 700; color: #64748b; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                    <th style="padding: 9px 12px; font-size: 10px; font-weight: 700; color: #64748b; text-align: right; text-transform: uppercase; letter-spacing: 0.5px;">Unit $</th>
                    <th style="padding: 9px 12px; font-size: 10px; font-weight: 700; color: #64748b; text-align: right; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>

              <!-- Grand Total -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 12px; background-color: #fefce8; border: 1px solid #fde047; border-radius: 10px; padding: 14px 16px;">
                <tr>
                  <td style="font-size: 14px; font-weight: 700; color: #78350f;">Total Parts Expense</td>
                  <td style="font-size: 20px; font-weight: 900; color: #0f172a; text-align: right; font-family: monospace;">$${grandTotal.toFixed(2)}</td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 8px 0;">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #facc15;">
                    <a href="${appUrl}/maintenance" target="_blank" style="font-size: 14px; font-weight: 700; color: #020617; text-decoration: none; padding: 13px 28px; border-radius: 10px; display: inline-block;">
                      View Work Orders &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #475569;">Prado Fleet — Fleet Operations &amp; Telematics</p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Prado Systems. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject: `🛒 Parts Ordered: ${parts.length} items ($${grandTotal.toFixed(2)}) — ${vehicleName}`,
      html: htmlContent,
    });
    console.log(`[Resend] Parts requisition email sent to ${to}. ID:`, data.data?.id);
    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error("[Resend] Failed to send parts requisition email:", error);
    return { success: false, error };
  }
}
