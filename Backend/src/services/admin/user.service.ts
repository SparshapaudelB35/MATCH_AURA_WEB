import { UserRepository } from "../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";
import { CreateUserDto, UpdateUserDto } from "../../dtos/user.dto";
let userRepository = new UserRepository();
export class AdminUserService {
    async createUser(data: CreateUserDto) {
        // Business logic, check duplicate username/email, hash
        const checkEmail = await userRepository.getUserByEmail(data.email);
        if (checkEmail) {
            throw new HttpError(403, "Email already in use");
        }
        const checkUsername = await userRepository.getUserByUsername(data.username);
        if (checkUsername) {
            throw new HttpError(403, "Username already in use");
        }
        // hash/encrypt password, to not store plain text password - security risk
        const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
        data.password = hashedPassword; // update the password with hashed one
        const newUser = await userRepository.createUser(data);
        return newUser;
    }
    async getUserById(id: string) {
        const user = await userRepository.getUserById(id);
        if (!user) throw new HttpError(404, "User not found");
        return user;
    }
    async getAllUsers() {
        const users = await userRepository.getAllUsers();
        // transform/map data if needed
        return users;
    }
    async updateOneUser(id: string, data: UpdateUserDto) {
        const existingUser = await userRepository.getUserById(id);
        if (!existingUser) throw new HttpError(404, "User not found");
        // If password is being updated, hash it
        if (data.password) {
            const hashedPassword = await bcryptjs.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateOneUser(id, data);
        if (!updatedUser) throw new HttpError(500, "Failed to update user");
        return updatedUser;
    }
    async deleteOneUser(id: string) {
        const existingUser = await userRepository.getUserById(id);
        if (!existingUser) throw new HttpError(404, "User not found");
        const result = await userRepository.deleteOneUser(id);
        if (!result) throw new HttpError(500, "Failed to delete user");
        return true;
    }
}