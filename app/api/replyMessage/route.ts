import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import connectDb from "@/src/lib/connectDb";
import { NextResponse } from "next/server";
import { User } from "@/src/models/User";

export async function POST(request: Request) {
  await connectDb();
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("recipient");

  const { messageId, content } = await request.json();

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!username || !messageId || !content) {
    return NextResponse.json(
      { success: false, message: "Missing fields" },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await User.updateOne(
      { username, "messages._id": messageId },
      {
        $push: {
          "messages.$.replies": {
            sender: session.user._id,
            content,
            createdAt: new Date(),
          },
        },
      }
    );

    if (updatedUser.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reply added successfully",
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add reply" },
      { status: 500 }
    );
  }
}
