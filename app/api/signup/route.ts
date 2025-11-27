import connectDb from "@/src/lib/connectDb";
import { User } from "@/src/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/src/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  try {
    await connectDb();

    const { username, email, password } = await request.json();

    // ✅ Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // ✅ Check if verified user already exists by username
    const existingVerifiedUserByUsername = await User.findOne({
      username,
      isVerified: true,
    });
    if (existingVerifiedUserByUsername) {
      return NextResponse.json(
        { success: false, message: "User already exists and verified!" },
        { status: 400 }
      );
    }

    // ✅ Check if user exists by email
    const existingUserByEmail = await User.findOne({ email });

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          { success: false, message: "User already exists with this email" },
          { status: 400 }
        );
      } else {
        // Update unverified user
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verificationCode = verificationCode;
        existingUserByEmail.verificationCodeExpiry = new Date(Date.now() + 3600000); // 1 hour
        await existingUserByEmail.save();

        await sendVerificationEmail(email, username, verificationCode);

        return NextResponse.json(
          {
            success: true,
            message: "User updated. Please verify your account.",
          },
          { status: 200 }
        );
      }
    }

    // ✅ Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiry: new Date(Date.now() + 3600000),
      isVerified: false,
      isAcceptingMessages: true,
      messages: [],
      image:String,
    });

    await newUser.save();

    await sendVerificationEmail( email,username, verificationCode);

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. Please verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { success: false, message: "Error registering user" },
      { status: 500 }
    );
  }
}
