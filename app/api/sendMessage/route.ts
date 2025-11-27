import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import connectDb from "@/src/lib/connectDb";
import { NextResponse } from "next/server";
import { User } from "@/src/models/User";

export async function POST(request: Request) {
  await connectDb();
  const session = await getServerSession(authOptions);

  const { content } = await request.json();
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("recipient"); // ✅ correct spelling

  // 🔒 Authentication check
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Please log in first." },
      { status: 401 }
    );
  }

  // ⚠️ Validation
  if (!username || !content) {
    return NextResponse.json(
      { success: false, message: "Missing username or content." },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { username },
      {
        $push: {
          messages: {
            $each: [
              {
                sender: session.user._id,
                content,
                createdAt: new Date(),
              },
            ],
            $position: 0,
          },
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Recipient not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully.",
      updatedUser,
    });
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add message." },
      { status: 500 }
    );
  }
}
