import z from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDto = UserSchema.pick( // reuse schema
    {
        username: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
    }
).extend( // add new attribute to schema
    {
        confirmPassword: z.string().min(6),
    }
).refine( // custom validation
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);


export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const UpdateUserDto = CreateUserDto.partial(); // all optional fields
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

// can use UserSchema or make a new schema
export const LoginUserDto = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
});
export type LoginUserDto = z.infer<typeof LoginUserDto>;