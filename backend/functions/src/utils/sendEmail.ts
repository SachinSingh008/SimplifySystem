import * as nodemailer from "nodemailer";
import * as functions from "firebase-functions";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Creates a Nodemailer transporter using Gmail SMTP with an App Password.
 * Configure via Firebase Functions environment config or environment variables.
 */
function createTransporter() {
  const gmailUser =
    process.env.GMAIL_USER ?? functions.config().gmail?.user ?? "";
  const gmailPass =
    process.env.GMAIL_APP_PASSWORD ?? functions.config().gmail?.password ?? "";

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });
}

/**
 * Sends an email using Gmail SMTP.
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const transporter = createTransporter();

  const gmailUser =
    process.env.GMAIL_USER ?? functions.config().gmail?.user ?? "";

  await transporter.sendMail({
    from: `"SimplifySystems" <${gmailUser}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  functions.logger.info(`Email sent to ${options.to}: ${options.subject}`);
}
