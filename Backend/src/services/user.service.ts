import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import  bcryptjs from "bcryptjs"
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { CLIENT_URL, JWT_SECRET } from "../config";
import { MessageModel } from "../models/message.model";
import crypto from "crypto";
import { EmailService } from "./email.service";

let userRepository = new UserRepository();
const emailService = new EmailService();
const HARDCODED_ADMIN_EMAIL = "admin@matchaura.com";
const HARDCODED_ADMIN_PASSWORD = "Admin@123";
const HARDCODED_ADMIN_USERNAME = "superadmin";

const generateAuthToken = (user: any) => {
    const payload = {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
};

export class UserService {
    async createUser(data: CreateUserDTO){
        // business logic before creating user
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        const usernameCheck = await userRepository.getUserByUsername(data.username);
        if(usernameCheck){
            throw new HttpError(403, "Username already in use");
        }
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
        data.password = hashedPassword;

        // create user
        const newUser = await userRepository.createUser(data);
        return newUser;
    }

    async loginUser(data: LoginUserDTO){
        if (
            data.email.toLowerCase() === HARDCODED_ADMIN_EMAIL.toLowerCase() &&
            data.password === HARDCODED_ADMIN_PASSWORD
        ) {
            let adminUser = await userRepository.getUserByEmail(HARDCODED_ADMIN_EMAIL);
            if (!adminUser) {
                const hashedPassword = await bcryptjs.hash(HARDCODED_ADMIN_PASSWORD, 10);
                adminUser = await userRepository.createUser({
                    email: HARDCODED_ADMIN_EMAIL,
                    password: hashedPassword,
                    username: HARDCODED_ADMIN_USERNAME,
                    role: "admin",
                    onboardingCompleted: true,
                });
            } else if (adminUser.role !== "admin") {
                adminUser = await userRepository.updateUser(String(adminUser._id), { role: "admin" }) ?? adminUser;
            }
            const token = generateAuthToken(adminUser);
            return { token, user: adminUser };
        }

        const user =  await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        // compare password
        const validPassword = await bcryptjs.compare(data.password, user.password);
        // plaintext, hashed
        if(!validPassword){
            throw new HttpError(401, "Invalid credentials");
        }
        const token = generateAuthToken(user);
        return { token, user }
    }
 async getUserById(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async getDiscoverUsers(userId: string, targetGender?: string) {
        return await userRepository.getDiscoverUsers(userId, targetGender);
    }

    async recordSwipe(userId: string, targetUserId: string, action: "like" | "dislike") {
        if (userId === targetUserId) {
            throw new HttpError(400, "You cannot swipe your own profile");
        }
        const targetUser = await userRepository.getUserById(targetUserId);
        if (!targetUser) {
            throw new HttpError(404, "Target user not found");
        }
        await userRepository.recordSwipe(userId, targetUserId, action);

        const user = await userRepository.getUserById(userId);
        const freshTarget = await userRepository.getUserById(targetUserId);
        if (!user || !freshTarget) return;

        const userMatches = new Set(user.matchedUsers || []);
        const targetMatches = new Set(freshTarget.matchedUsers || []);

        if (action === "like") {
            const isMutualLike = (freshTarget.likedUsers || []).includes(userId);
            if (isMutualLike) {
                userMatches.add(targetUserId);
                targetMatches.add(userId);
                await userRepository.updateUser(userId, { matchedUsers: Array.from(userMatches) });
                await userRepository.updateUser(targetUserId, { matchedUsers: Array.from(targetMatches) });
            }
        } else {
            // Dislike acts as unmatch if they were previously matched
            userMatches.delete(targetUserId);
            targetMatches.delete(userId);
            await userRepository.updateUser(userId, { matchedUsers: Array.from(userMatches) });
            await userRepository.updateUser(targetUserId, { matchedUsers: Array.from(targetMatches) });
        }
    }

    async getMatches(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) throw new HttpError(404, "User not found");
        const matchIds = (user.matchedUsers || []).filter(Boolean);
        return await userRepository.getUsersByIds(matchIds);
    }

    async getMessages(userId: string, otherUserId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) throw new HttpError(404, "User not found");
        const canChat = (user.matchedUsers || []).includes(otherUserId);
        if (!canChat) {
            throw new HttpError(403, "You can only message matched users");
        }

        const messages = await MessageModel.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId },
            ],
        }).sort({ createdAt: 1 });

        return messages;
    }

    async sendMessage(userId: string, otherUserId: string, content: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) throw new HttpError(404, "User not found");
        const canChat = (user.matchedUsers || []).includes(otherUserId);
        if (!canChat) {
            throw new HttpError(403, "You can only message matched users");
        }

        const receiver = await userRepository.getUserById(otherUserId);
        if (!receiver) {
            throw new HttpError(404, "Receiver not found");
        }

        const message = await MessageModel.create({
            senderId: userId,
            receiverId: otherUserId,
            content,
        });

        return message;
    }

    async updateUser(userId: string, data: UpdateUserDTO) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        if (data.email && user.email !== data.email) {
            const emailExists = await userRepository.getUserByEmail(data.email);
            if(emailExists){
                throw new HttpError(403, "Email already in use");
            }
        }
        if (data.username && user.username !== data.username) {
            const usernameExists = await userRepository.getUserByUsername(data.username);
            if(usernameExists){
                throw new HttpError(403, "Username already in use");
            }
        }
        if(data.password){
            const hashedPassword = await bcryptjs.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateUser(userId, data);
        return updatedUser;
    }

    async forgotPassword(email: string) {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            return;
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

        await userRepository.updateUser(String(user._id), {
            resetPasswordToken: hashedResetToken,
            resetPasswordExpires: resetExpires,
        });

        const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;

        try {
            await emailService.sendPasswordResetEmail(user.email, resetLink);
        } catch {
            await userRepository.clearResetPasswordToken(String(user._id));
            throw new HttpError(500, "Failed to send password reset email");
        }
    }

    async resetPassword(token: string, newPassword: string) {
        const hashedResetToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await userRepository.getUserByResetPasswordToken(hashedResetToken);

        if (!user) {
            throw new HttpError(400, "Reset link is invalid or has expired");
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        const updatedUser = await userRepository.updateUser(String(user._id), {
            password: hashedPassword,
        });
        await userRepository.clearResetPasswordToken(String(user._id));

        if (!updatedUser) {
            throw new HttpError(500, "Failed to reset password");
        }
    }
}
