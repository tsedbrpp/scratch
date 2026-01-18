"use server";

import nodemailer from "nodemailer";
import { redis } from "@/lib/redis";
import { headers } from "next/headers";

interface ContactState {
    success?: boolean;
    error?: string;
}

export async function sendContactEmail(prevState: ContactState, formData: FormData): Promise<ContactState> {
    const rawFormData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        subject: formData.get("subject") as string,
        message: formData.get("message") as string,
        // Honeypot field - should be empty for humans
        website: formData.get("website") as string,
    };

    // 1. Honeypot Check (Anti-Bot)
    // If the hidden 'website' field is filled, it's likely a bot. 
    // Return fake success to confuse them.
    if (rawFormData.website) {
        console.warn("Honeypot triggered by submission", { name: rawFormData.name, website: rawFormData.website });
        return { success: true };
    }

    // Basic Validation
    if (!rawFormData.name || !rawFormData.email || !rawFormData.message) {
        return { success: false, error: "Please fill in all required fields." };
    }

    // 2. Rate Limiting (Redis)
    try {
        const headerStore = await headers();
        const ip = headerStore.get("x-forwarded-for") || "unknown";
        const rateLimitKey = `contact_rate_limit:${ip}`;

        // Allow 3 emails per hour per IP
        const currentCount = await redis.incr(rateLimitKey);

        if (currentCount === 1) {
            await redis.expire(rateLimitKey, 3600); // 1 hour TTL
        }

        if (currentCount > 3) {
            console.warn(`Rate limit exceeded for IP: ${ip}`);
            return {
                success: false,
                error: "You have sent too many messages recently. Please try again in an hour."
            };
        }
    } catch (redisError) {
        console.error("Rate limiting error (proceeding anyway):", redisError);
        // Fail open if Redis is down, don't block users
    }

    // SMTP Configuration
    // In production, these should be env variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const adminEmail = process.env.CONTACT_EMAIL || "admin@instanttea.com";

    if (!smtpHost || !smtpUser || !smtpPass) {
        console.error("Missing SMTP Configuration", { smtpHost, smtpUser });
        // Return simulated success in Dev/Demo mode if not configured, or error
        if (process.env.NODE_ENV === "development") {
            console.log("DEV MODE: Email would have been sent:", rawFormData);
            return { success: true };
        }
        return { success: false, error: "Email service not configured on server." };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        await transporter.sendMail({
            from: `"${rawFormData.name}" <${process.env.SMTP_FROM || smtpUser}>`, // Sender address
            to: adminEmail, // List of receivers
            replyTo: rawFormData.email,
            subject: `[InstantTea Contact] ${rawFormData.subject || "New Message"}`, // Subject line
            text: `
Name: ${rawFormData.name}
Email: ${rawFormData.email}
Subject: ${rawFormData.subject}
IP: ${await (await headers()).get("x-forwarded-for") || "unknown"}

Message:
${rawFormData.message}
            `, // plain text body
            html: `
<div style="font-family: sans-serif; padding: 20px; color: #334155;">
  <h2>New Contact Form Submission</h2>
  <p><strong>Name:</strong> ${rawFormData.name}</p>
  <p><strong>Email:</strong> <a href="mailto:${rawFormData.email}">${rawFormData.email}</a></p>
  <p><strong>Subject:</strong> ${rawFormData.subject}</p>
  <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p style="white-space: pre-wrap; margin: 0;">${rawFormData.message}</p>
  </div>
</div>
            `, // html body
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: "Failed to send email. Please try again later." };
    }
}
