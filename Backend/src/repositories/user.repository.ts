import { UserModel, IUser } from "../models/user.model";
export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    // Additional
    // 5 common database queries for entity
    createUser(userData: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getUserByResetPasswordToken(token: string): Promise<IUser | null>;
    clearResetPasswordToken(id: string): Promise<void>;
    getUsersByIds(ids: string[]): Promise<IUser[]>;
    getAllUsers(): Promise<IUser[]>;
    getDiscoverUsers(currentUserId: string, targetGender?: string): Promise<IUser[]>;
    recordSwipe(userId: string, targetUserId: string, action: "like" | "dislike"): Promise<void>;
    updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id: string): Promise<boolean>;
}
// MongoDb Implementation of UserRepository
export class UserRepository implements IUserRepository {
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(userData); 
        return await user.save();
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "email": email })
        return user;
    }
    async getUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "username": username })
        return user;
    }

    async getUserById(id: string): Promise<IUser | null> {
        // UserModel.findOne({ "_id": id });
        const user = await UserModel.findById(id);
        return user;
    }
    async getUserByResetPasswordToken(token: string): Promise<IUser | null> {
        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });
        return user;
    }
    async getAllUsers(): Promise<IUser[]> {
        const users = await UserModel.find();
        return users;
    }
    async getUsersByIds(ids: string[]): Promise<IUser[]> {
        if (ids.length === 0) return [];
        return await UserModel.find({ _id: { $in: ids } }, { password: 0 }).sort({ updatedAt: -1 });
    }
    async getDiscoverUsers(currentUserId: string, targetGender?: string): Promise<IUser[]> {
        const currentUser = await UserModel.findById(currentUserId, {
            likedUsers: 1,
            dislikedUsers: 1,
        });
        const excludedIds = [
            currentUserId,
            ...((currentUser?.likedUsers as string[] | undefined) || []),
            ...((currentUser?.dislikedUsers as string[] | undefined) || []),
        ];

        const query: Record<string, unknown> = {
            _id: { $nin: excludedIds },
            role: "user",
            onboardingCompleted: true,
        };
        if (targetGender) {
            query.gender = { $regex: `^${targetGender}$`, $options: "i" };
        }

        const users = await UserModel.find(
            query,
            { password: 0 }
        ).sort({ updatedAt: -1 });
        return users;
    }
    async recordSwipe(userId: string, targetUserId: string, action: "like" | "dislike"): Promise<void> {
        const update =
            action === "like"
                ? {
                    $addToSet: { likedUsers: targetUserId },
                    $pull: { dislikedUsers: targetUserId },
                }
                : {
                    $addToSet: { dislikedUsers: targetUserId },
                    $pull: { likedUsers: targetUserId },
                };

        await UserModel.updateOne({ _id: userId }, update);
    }
    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        // UserModel.updateOne({ _id: id }, { $set: updateData });
        const updatedUser = await UserModel.findByIdAndUpdate(
            id, updateData, { new: true } // return the updated document
        );
        return updatedUser;
    }
    async clearResetPasswordToken(id: string): Promise<void> {
        await UserModel.updateOne(
            { _id: id },
            { $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } }
        );
    }
    async deleteUser(id: string): Promise<boolean> {
        // UserModel.deleteOne({ _id: id });
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : false;
    }
}
