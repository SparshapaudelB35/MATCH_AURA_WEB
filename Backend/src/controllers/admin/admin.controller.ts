import { AdminUserService } from "../../services/admin/user.service";
import { Request, Response } from "express";
import z from "zod";
import { CreateUserDto, UpdateUserDto } from "../../dtos/user.dto";
let adminUserService = new AdminUserService();
export class AdminUserController {
    async createUser(req: Request, res: Response) {
        // same as register user controller
        try {
            const parsedData = CreateUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                ); // z.prettifyError - better error messages (zod)
            }
            const newUser = await adminUserService.createUser(parsedData.data);
            return res.status(201).json(
                { success: true, data: newUser, message: "Register success" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
    async getUserById(req: Request, res: Response) {
        try {
            const userId = req.params.id; // from url /api/admin/users/:id
            const user = await adminUserService.getUserById(userId);
            return res.status(200).json(
                { success: true, data: user, message: "User Fetched" }
            )
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await adminUserService.getAllUsers();
            return res.status(200).json(
                { success: true, data: users, message: "Users Fetched" }
            )
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
    async updateOneUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const parsedData = UpdateUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                ); // z.prettifyError - better error messages (zod)
            }
            const updatedUser = await adminUserService.updateOneUser(userId, parsedData.data);
            return res.status(200).json(
                { success: true, data: updatedUser, message: "User Updated" }
            )
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
    async deleteOneUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            await adminUserService.deleteOneUser(userId);
            return res.status(200).json(
                { success: true, message: "User Deleted" }
            )
        } catch (
        error: Error | any) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
}
// Classroom task
// 1. Create routes app.use('/api/admin/users', adminUserRoutes);
// 2. Route paths:
// POST /api/admin/users/ -> createUser
// GET /api/admin/users/:id -> getUserById
// GET /api/admin/users/ -> getAllUsers
// PUT /api/admin/users/:id -> updateOneUser
// DELETE /api/admin/users/:id -> deleteOneUser
// 3. Create service methods in AdminUserService for getAllUsers, updateOneUser, deleteOneUser
// - Delete and Update add logic - check if user exists, if not throw 404 error
// 5. Create controller methods in 
// - AdminUserController for getAllUsers, updateOneUser, deleteOneUser
// Use UserRepository methods already created
// Test using Postman