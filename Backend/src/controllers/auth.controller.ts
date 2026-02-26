import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import z from "zod";
let userService = new UserService();

const isOnboardingComplete = (user: any) => {
    return Boolean(
        user?.username &&
        user?.dateOfBirth &&
        user?.gender &&
        user?.bio &&
        Array.isArray(user?.interests) &&
        user.interests.length > 0 &&
        user?.imageUrl &&
        Array.isArray(user?.profileImages) &&
        user.profileImages.length > 0
    );
};

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body); // validate request body
            if (!parsedData.success) { // validation failed
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            const userData: CreateUserDTO = parsedData.data;
            const newUser = await userService.createUser(userData);
            return res.status(201).json(
                { success: true, message: "User Created", data: newUser }
            );
        } catch (error: Error | any) { // exception handling
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            const loginData: LoginUserDTO = parsedData.data;
            const { token, user } = await userService.loginUser(loginData);
            return res.status(200).json(
                { success: true, message: "Login successful", data: user, token }
            );

        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

     async getProfile(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(400).json(
                    { success: false, message: "User Id Not found" }
                );
            }
            const user = await userService.getUserById(userId);
            return res.status(200).json(
                { success: true, data: user, message: "User profile fetched successfully" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
    
    async updateProfile(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(400).json(
                    { success: false, message: "User Id Not found" }
                );
            }
            const existingUser = await userService.getUserById(userId);
            const requestBody = { ...req.body } as Record<string, unknown>;

            let retainedProfileImages: string[] = existingUser.profileImages ?? [];
            if (typeof requestBody.retainedProfileImages === "string") {
                try {
                    const parsedRetained = JSON.parse(requestBody.retainedProfileImages);
                    if (Array.isArray(parsedRetained)) {
                        retainedProfileImages = parsedRetained.filter((item) => typeof item === "string");
                    }
                } catch {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid retainedProfileImages payload.",
                    });
                }
            }
            delete requestBody.retainedProfileImages;

            if (typeof requestBody.interests === "string") {
                const interests = requestBody.interests
                    .split(",")
                    .map((interest) => interest.trim())
                    .filter(Boolean);
                requestBody.interests = interests;
            }

            const parsedData = UpdateUserDTO.safeParse(requestBody);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                ); // z.prettifyError - better error messages (zod)
            }

            const files = req.files as
                | { [fieldname: string]: Express.Multer.File[] }
                | undefined;

            const profileImageFile = files?.image?.[0];
            if (profileImageFile) {
                parsedData.data.imageUrl = `/uploads/${profileImageFile.filename}`;
            }

            const galleryFiles = files?.profileImages ?? [];
            const uploadedGalleryImages = galleryFiles.map(
                (file) => `/uploads/${file.filename}`
            );
            const mergedProfileImages = [...retainedProfileImages, ...uploadedGalleryImages];
            if (mergedProfileImages.length > 6) {
                return res.status(400).json({
                    success: false,
                    message: "You can keep up to 6 gallery images.",
                });
            }
            parsedData.data.profileImages = mergedProfileImages;

            const mergedUser = {
                ...existingUser,
                ...parsedData.data,
                interests: parsedData.data.interests ?? existingUser.interests,
                profileImages: parsedData.data.profileImages ?? existingUser.profileImages,
                imageUrl: parsedData.data.imageUrl ?? existingUser.imageUrl,
            };

            const onboardingCompleted = isOnboardingComplete(mergedUser);
            if (!onboardingCompleted) {
                return res.status(400).json({
                    success: false,
                    message: "Complete profile setup with username, DOB, gender, interests, bio, profile picture, and at least one gallery image.",
                });
            }

            parsedData.data.onboardingCompleted = true;

            const updatedUser = await userService.updateUser(userId, parsedData.data);
            return res.status(200).json(
                { success: true, data: updatedUser, message: "User profile updated successfully" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
}
