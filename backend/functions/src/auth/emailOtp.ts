import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { storeOtp, getOtpRecord, deleteOtpRecord } from "../utils/otpStore";
import { sendEmail } from "../utils/sendEmail";
import { validateEmail } from "../utils/validators";
import * as bcrypt from "bcryptjs";

if (!admin.apps.length) {
  admin.initializeApp();
}

// ── sendOtp ───────────────────────────────────────────────────────────────────

export const sendOtp = functions.region("asia-south1").https.onCall(async (data, context) => {
  const { email } = data as { email: string };

  if (!email || !validateEmail(email)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A valid email address is required."
    );
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[DEVELOPMENT] Generated OTP for ${email}: ${otp}`);

  // Hash the OTP before storing
  const saltRounds = 10;
  const hashedOtp = await bcrypt.hash(otp, saltRounds);

  // Store hashed OTP in Firestore with 10-minute expiry
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await storeOtp(email, hashedOtp, expiresAt);

  // Send OTP email
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; background: #f0fdf4; margin: 0; padding: 0; }
          .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(22,163,74,0.08); }
          .header { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 32px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
          .body { padding: 40px 32px; }
          .otp-box { background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #16a34a; font-family: monospace; }
          .note { color: #6b7280; font-size: 13px; line-height: 1.6; margin-top: 24px; }
          .footer { background: #f9fafb; padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SimplifySystems</h1>
            <p>Your login verification code</p>
          </div>
          <div class="body">
            <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hello!</p>
            <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
              Use the following One-Time Password to sign in to your SimplifySystems account.
            </p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p class="note">
              ⏱ This OTP expires in <strong>10 minutes</strong>.<br/>
              If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} SimplifySystems · GST Invoice Management
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "Your SimplifySystems Login OTP",
    html: htmlBody,
  });

  return { success: true, message: "OTP sent successfully." };
});

// ── verifyOtp ─────────────────────────────────────────────────────────────────

export const verifyOtp = functions.region("asia-south1").https.onCall(async (data, context) => {
  const { email, otp } = data as { email: string; otp: string };

  if (!email || !validateEmail(email)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A valid email address is required."
    );
  }

  if (!otp || otp.length !== 6) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A 6-digit OTP is required."
    );
  }

  // Fetch stored OTP record
  const record = await getOtpRecord(email);

  if (!record) {
    throw new functions.https.HttpsError(
      "not-found",
      "Service error. Please try again."
    );
  }

  // Check expiry
  if (new Date() > record.expiresAt) {
    await deleteOtpRecord(email);
    throw new functions.https.HttpsError(
      "deadline-exceeded",
      "OTP has expired. Please request a new one."
    );
  }

  // Verify OTP hash
  const isValid = await bcrypt.compare(otp, record.hashedOtp);

  if (!isValid) {
    throw new functions.https.HttpsError("unauthenticated", "Invalid OTP.");
  }

  // Delete OTP record after successful verification
  await deleteOtpRecord(email);

  // Get or create the user in Firebase Auth
  let uid: string;
  try {
    const existingUser = await admin.auth().getUserByEmail(email);
    uid = existingUser.uid;
  } catch {
    // User doesn't exist — create a new one
    const newUser = await admin.auth().createUser({
      email,
      emailVerified: true,
    });
    uid = newUser.uid;
  }

  // Create a custom token for the client to sign in with
  const customToken = await admin.auth().createCustomToken(uid);

  return { success: true, customToken };
});
