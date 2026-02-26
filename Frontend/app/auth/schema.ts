import z from "zod";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const updateUserSchema = z.object({
    firstName: z.string().min(2, { message: "Minimum 2 characters" }).optional().or(z.literal("")),
    lastName: z.string().min(2, { message: "Minimum 2 characters" }).optional().or(z.literal("")),
    email: z.string().optional().or(z.literal("")),
    username: z.string().min(3, { message: "Minimum 3 characters" }),
    dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
    gender: z.enum(["male", "female", "other"]),
    interests: z.string().min(1, { message: "Add at least one interest" }),
    bio: z.string().min(10, { message: "Bio should be at least 10 characters" }).max(500),
    image: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
            message: "Max file size is 5MB",
        })
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: "Only .jpg, .jpeg, .png and .webp formats are supported",
        }),
    profileImages: z.array(
        z.instanceof(File)
            .refine((file) => file.size <= MAX_FILE_SIZE, {
                message: "Each image must be 5MB or less",
            })
            .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
                message: "Only .jpg, .jpeg, .png and .webp formats are supported",
            })
    ).max(6, { message: "You can upload up to 6 images" }).optional(),
})
export type UpdateUserData = z.infer<typeof updateUserSchema>;
