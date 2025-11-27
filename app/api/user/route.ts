import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/src/lib/connectDb";
import { User } from "@/src/models/User";

export async function GET(req: NextRequest) {
    
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    try {
        await connectDb();

        // 1. Create a Case-Insensitive Regular Expression for the query
        // 'i' flag makes the search case-insensitive.
        const userQuery = {
            username: new RegExp(`^${username}$`, 'i') 
        };

        // 2. Search the database for the user using the case-insensitive query
        const user = await User.findOne(userQuery).lean();

        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "User not found" 
            }, { status: 404 });
        }

        // Return the user data
        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("API Error fetching user:", error);
        return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
    }
}