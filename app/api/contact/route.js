import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { securityHeaders } from "@/lib/security";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400, headers: securityHeaders }
      );
    }

    // Get contact email dynamically from admin settings (prioritize SMTP email)
    const settings = await Settings.findOne();
    const targetEmail = settings?.smtpUser || settings?.contactEmail || "info@sabirshah.pk";

    // Standard SMTP credentials from environment or dynamic settings
    const smtpHost = settings?.smtpHost || process.env.SMTP_HOST;
    const smtpPort = settings?.smtpPort || process.env.SMTP_PORT || 587;
    const smtpUser = settings?.smtpUser || process.env.SMTP_USER;
    const smtpPass = settings?.smtpPass || process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: Number(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"${name} via Contact Form" <${smtpUser}>`,
        replyTo: email,
        to: targetEmail,
        subject: subject ? `${name} via Contact Form - ${subject}` : `${name} via Contact Form`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || "N/A"}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br/>")}</p>
        `,
      });

    } else {
      return NextResponse.json(
        { error: "SMTP Server is not configured. Please fill in your Gmail/SMTP credentials in the Admin Settings panel under Settings > Security/Contact to receive real emails." },
        { status: 400, headers: securityHeaders }
      );
    }

    return NextResponse.json({ success: true, message: "Message sent successfully!" }, { headers: securityHeaders });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500, headers: securityHeaders }
    );
  }
}
