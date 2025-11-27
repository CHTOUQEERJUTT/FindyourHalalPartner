// app/api/verificationCodeValidation/route.ts
import connectDb from "@/src/lib/connectDb";
import { User } from "@/src/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectDb();
    const { username, verificationCode } = await request.json();

    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 400 });
    }

    if (user.isVerified) {
      return NextResponse.json({ success: false, message: "User already verified" }, { status: 400 });
    }

    if (
      !user.verificationCode ||
      !user.verificationCodeExpiry ||
      user.verificationCode !== verificationCode ||
      user.verificationCodeExpiry < new Date()
    ) {
      return NextResponse.json({ success: false, message: "Verification code invalid or expired" }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "User verified successfully" }, { status: 200 });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
