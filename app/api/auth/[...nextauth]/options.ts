import connectDb from "@/src/lib/connectDb";
import { User } from "@/src/models/User";
import bcrypt from "bcryptjs";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";


export const authOptions:NextAuthOptions = {
    providers: [
  CredentialsProvider({
    
    name: 'Credentials',
    
    credentials: {
      identifier: { label: "Username/Email", type: "text", placeholder: "jsmith" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials, req):Promise<any> {
      await connectDb()
      try {
        const user = await User.findOne({$or:[{username:credentials?.identifier},{email:credentials?.identifier}]})
        if (!user) {
            return Response.json({
                success:false,
                message:"Invalid credentials"
            },{status:400})
        }
        if (!user.isVerified) {
            return Response.json({success:false,message:"Verify the user first"},{status:400})
        }
        if (!credentials?.password || !user.password) {
            throw new Error("Password is missing.");
        }
        const isPasswordCorrect= await bcrypt.compare(credentials?.password,user.password)
        if (isPasswordCorrect) {
                return user
        }else{
            throw new Error("Invalid credentials provided!")
        }
      } catch (error:any) {
        throw new Error(error)
      }
      
    }
  }),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),

  // 👉 Add GitHub Provider (optional)
  GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  })
],
callbacks:{
    async signIn({ user, account }) {
    // If the user logged in via OAuth (not credentials)
    if (account?.provider !== "credentials") {
      await connectDb();
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
      const newUser = await User.create({
        email: user.email,
        username: user.name?.replace(/\s+/g, "").toLowerCase(),
        isVerified: true,
        password: null,
      });

        // attach _id to user object (so jwt callback receives it)
        user._id = String((newUser as any)._id);

        user.username = newUser.username;
        user.isVerified = true;
} else {
        user._id = String((existingUser as any)._id);

        user.username = existingUser.username;
        user.isVerified = existingUser.isVerified;
}

    }
    return true;
  },
    async jwt({ token, user }) {
    if (user) {
        token._id = user._id?.toString()
        token.username = user?.username
        token.isVerified = user?.isVerified
    }
    return token
    },
    async session({ session, token }) {
    if (token) {
        session.user._id = token._id
        session.user.username = token.username
        session.user.isVerified = token.isVerified
    }
    const user = await User.findById(token._id);
    if (user) {
      session.user.username = user.username;
      session.user.image = user.image;
    }
    return session
    }


},
session:{
    strategy:"jwt"
},
secret:process.env.NEXTAUTH_SECRET,
pages:{
    signIn:'/signin'
}


}

export default NextAuth(authOptions)