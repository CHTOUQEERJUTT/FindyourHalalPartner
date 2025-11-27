// src/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

// --- INTERFACE DEFINITION ---
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // optional because OAuth users may not have password
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: {
    sender: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    isRead: boolean;
  }[];
  socialLinks: string[];
  interests: string[];
  image?: string;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  
  // --- ADDED FIELDS from JSON SAMPLES ---
  age?: number;
  bio?: string;
  cast?: string;
  gender?: 'Male' | 'Female' | 'Other'; 
  
  // --- TIMESTAMPS ---
  createdAt: Date;
  updatedAt: Date;
}

// --- MESSAGE SUB-SCHEMA ---
const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  },
  { _id: false }
);

// --- USER SCHEMA DEFINITION ---
const UserSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    isAcceptingMessages: { type: Boolean, default: true },
    messages: { type: [messageSchema], default: [] },
    socialLinks: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    image: { type: String, default: "" },
    verificationCode: { type: String },
    verificationCodeExpiry: { type: Date },
    
    // --- ADDED FIELDS to Schema ---
    age: { type: Number },
    bio: { type: String },
    cast: { type: String },
    gender: { type: String }, 
    
  },
  { timestamps: true } // Handles createdAt and updatedAt
);

// Prevent model overwrite error in Next.js hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export { User };