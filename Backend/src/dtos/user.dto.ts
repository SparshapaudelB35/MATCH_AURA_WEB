import z from "zod";
import { UserSchema } from "../types/user.type";
// re-use UserSchema from types
export const CreateUserDTO = UserSchema.pick(
    {
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        interests: true,
        bio: true,
        email: true,
        username: true,
        password: true,
        imageUrl: true,
        profileImages: true,
        onboardingCompleted: true,
    }
).extend( // add new attribute to zod
    {
        confirmPassword: z.string().min(6)
    }
).refine( // extra validation for confirmPassword
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
)
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.email(),
    password: z.string().min(6)
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema.partial(); // all attributes optional
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;

export const ForgotPasswordDTO = z.object({
    email: z.email(),
});
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordDTO>;

export const ResetPasswordDTO = z.object({
    token: z.string().min(1),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;
