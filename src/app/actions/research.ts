"use server";

import nodemailer from "nodemailer";
import { StudyState } from "@/lib/study-config";
import { redis } from "@/lib/redis";

interface EmailState {
    success?: boolean;
    error?: string;
}

export async function sendStudyResultsEmail(studyState: StudyState): Promise<EmailState> {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const adminEmail = process.env.CONTACT_EMAIL || "tod.sedbrook@gmail.com";

    // Validate study state
    if (!studyState.evaluatorCode || !studyState.responses) {
        return { success: false, error: "Invalid study data." };
    }

    const jsonData = JSON.stringify(studyState, null, 2);
    const fileName = `research-session-${studyState.evaluatorCode}-${Date.now()}.json`;

    if (!smtpHost || !smtpUser || !smtpPass) {
        console.warn("SMTP NOT CONFIGURED. Simulating email sending in development mode.");
        console.warn("Target Email:", adminEmail);
        console.warn("File Name:", fileName);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (process.env.NODE_ENV === "development") {
            return { success: true };
        }
        return { success: false, error: "Email service not configured on server." };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        await transporter.sendMail({
            from: `"InstantTea Research" <${process.env.SMTP_FROM || smtpUser}>`,
            to: adminEmail,
            subject: `[STUDY SUBMISSION] Evaluator: ${studyState.evaluatorCode}`,
            text: `
Results submission for Evaluator: ${studyState.evaluatorCode}
Timestamp: ${new Date().toISOString()}
Cases Completed: ${Object.keys(studyState.responses).length}

Please find the attached JSON session file.
            `,
            attachments: [
                {
                    filename: fileName,
                    content: jsonData,
                    contentType: 'application/json'
                }
            ]
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending study results email:", error);
        return { success: false, error: "Failed to send email. Please check your connection or try again later." };
    }
}

export async function saveStudyBackup(studyState: StudyState) {
    if (!studyState.evaluatorCode) return { success: false, error: "No evaluator code" };

    try {
        const key = `research:backup:${studyState.evaluatorCode}`;
        // Save with 30 day expiry
        await redis.set(key, JSON.stringify(studyState), 'EX', 60 * 60 * 24 * 30);
        console.warn(`[Backup] Saved study state for ${studyState.evaluatorCode}`);
        return { success: true };
    } catch (error) {
        console.error("[Backup] Failed to save to Redis:", error);
        return { success: false, error: "Redis save failed" };
    }
}

export async function getStudyBackup(evaluatorCode: string): Promise<StudyState | null> {
    if (!evaluatorCode) return null;

    try {
        const key = `research:backup:${evaluatorCode}`;
        const data = await redis.get(key);
        if (data) {
            return JSON.parse(data) as StudyState;
        }
    } catch (error) {
        console.error("[Backup] Failed to retrieve from Redis:", error);
    }
    return null;
}

export async function deleteStudyData(evaluatorCode: string) {
    if (!evaluatorCode) return { success: false, error: "No evaluator code" };

    try {
        const key = `research:backup:${evaluatorCode}`;
        await redis.del(key);
        console.warn(`[Delete] Removed study data for ${evaluatorCode}`);
        return { success: true };
    } catch (error) {
        console.error("[Delete] Failed to remove from Redis:", error);
        return { success: false, error: "Redis delete failed" };
    }
}
