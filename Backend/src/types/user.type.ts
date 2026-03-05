
import z from "zod";

export const UserSchema = z.object({
    username: z.string().min(1),
    email: z.email(),
    password: z.string().min(6),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    interests: z.array(z.string()).optional(),
    bio: z.string().max(500).optional(),
    role: z.enum(["user", "admin"]).default("user"),
    imageUrl: z.string().optional(),
    profileImages: z.array(z.string()).optional(),
    onboardingCompleted: z.boolean().default(false),
    likedUsers: z.array(z.string()).optional(),
    dislikedUsers: z.array(z.string()).optional(),
    matchedUsers: z.array(z.string()).optional(),
    resetPasswordToken: z.string().optional(),
    resetPasswordExpires: z.date().optional(),
});

export type UserType = z.infer<typeof UserSchema>;
