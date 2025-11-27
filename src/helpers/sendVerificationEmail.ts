import { resend } from "../lib/resend";
import MagicCodeEmail from "@/emails/verificationEmail";
import { renderAsync } from "@react-email/render";
import { apiResponse } from "../types/apiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationCode: string
): Promise<apiResponse> {
  try {
    console.log("📩 Debug email input:", { email, username, verificationCode });

    const cleanEmail = email?.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Invalid email format provided");
    }

    const emailHtml = await renderAsync(
      MagicCodeEmail({ username, verificationCode })
    );

    const response = await resend.emails.send({
      from: "noreply@touqeerdev.tech",
      to: [`${username} <${cleanEmail}>`],
      subject: "Mystery Message Verification Code",
      html: emailHtml,
    });

    console.log("✅ Email sent successfully:", response);

    return {
      success: true,
      message: "Verification email sent successfully.",
      status: 200,
    };
  } catch (emailError) {
    console.error("❌ Error sending verification email:", emailError);
    return {
      success: false,
      message: "Failed to send verification email.",
      status: 500,
    };
  }
}
