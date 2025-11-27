import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import connectDb from "@/src/lib/connectDb";
import { User, IUser } from "@/src/models/User";
import { uploadOnCloudinary } from "@/src/lib/cloudinary";

// -----------------------------
// GET - Fetch current user
// -----------------------------
export async function GET() {
  await connectDb();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  // ✅ POPULATE SENDER USERNAME FROM messages.sender
  const user = await User.findById(session.user._id)
    .select("-password")
    .populate("messages.sender", "username");

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, user });
}

// -----------------------------
// PATCH - Update profile
// -----------------------------
export async function PATCH(req: NextRequest) {
  await connectDb();

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const user = await User.findById(session.user._id) as IUser;
  if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

  try {
    const formData = await req.formData();

    const username = (formData.get("username") as string) || user.username;
    const bio = (formData.get("bio") as string) || user.bio;
    const gender = (formData.get("gender") as "Male" | "Female" | "Other") || user.gender;

    const cast = (formData.get("cast") as string) || user.cast;
    const age = Number(formData.get("age") || user.age);
    const socialLinksRaw = (formData.get("socialLinks") as string) || "";
    const interestsRaw = (formData.get("interests") as string) || "";
    const imageFile = formData.get("image") as File | null;

    let imageUrl = user.image || "";

    // Upload image if new file selected
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:${imageFile.type};base64,${base64}`;
      imageUrl = await uploadOnCloudinary(dataUrl);
    }

    // Convert comma-separated strings to arrays
    const socialLinks: string[] = socialLinksRaw.split(",").map(link => link.trim()).filter(Boolean);
    const interests: string[] = interestsRaw.split(",").map(item => item.trim()).filter(Boolean);

    // Update user fields
    user.username = username;
    user.bio = bio;
    user.gender = gender;
    user.cast = cast;
    user.age = age;
    user.socialLinks = socialLinks;
    user.interests = interests;
    user.image = imageUrl;

    await user.save();

    return NextResponse.json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
