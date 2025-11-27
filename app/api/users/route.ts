import connectDb from "@/src/lib/connectDb";
import { User } from "@/src/models/User";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    await connectDb();

    try {
        const { searchParams } = new URL(request.url);

        const filters: any = {};

        const gender = searchParams.get('gender');
        const ageMinParam = searchParams.get('ageMin');
        const ageMaxParam = searchParams.get('ageMax');
        const interests = searchParams.get('interests');
        const page = Number(searchParams.get('page'));
        const limit = Number(searchParams.get('limit'));

        // 1. FIX: Use a case-insensitive regex for the gender filter
        if (gender) {
            filters.gender = { $regex: new RegExp(gender, 'i') };
        }

        // 2. Improvement: Safer Age Filter Check
        const ageMin = ageMinParam ? Number(ageMinParam) : undefined;
        const ageMax = ageMaxParam ? Number(ageMaxParam) : undefined;
        
        const ageFilter: any = {};
        if (ageMin !== undefined && !isNaN(ageMin)) ageFilter.$gte = ageMin;
        if (ageMax !== undefined && !isNaN(ageMax)) ageFilter.$lte = ageMax;

        if (Object.keys(ageFilter).length > 0) {
            filters.age = ageFilter;
        }

        // 3. Interests Filter (Logic remains correct)
        if (interests) {
            // Converts "cricket,football" to ["cricket", "football"] and uses $in
            filters.interests = { $in: interests.split(",") };
        }

        const skip = (page - 1) * limit;

        const [users, totalUsers] = await Promise.all([
            User.find(filters)
                .select("username image age gender interests bio cast")
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(filters)
        ]);

        return NextResponse.json({
            success: true,
            users,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({
            success: false,
            message: "Failed"
        });
    }
}