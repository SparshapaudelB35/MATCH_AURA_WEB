"use server";
import { loginUser, registerUser } from "@/lib/api/auth"
import { LoginData, RegisterData } from "@/app/(auth)/schema"
import { setAuthToken, setUserData, clearAuthCookies } from "../cookie"
import { redirect } from "next/navigation";
export const handleRegister = async (data: RegisterData) => {
    try {
        // Split full name into firstName / lastName
        const nameParts = data.name.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || "";
        const username = data.name; // optional, map full name as username

        // Build payload to match backend DTO
        const payload = {
            firstName,
            lastName,
            username,
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword
        };

        const response = await registerUser(payload);

        if (response.success) {
            return {
                success: true,
                message: 'Registration successful',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Registration failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Registration action failed' }
    }
}


export const handleLogin = async (data: LoginData) => {
    try {
        const response = await loginUser(data)
        if (response.success) {
            await setAuthToken(response.token)
            await setUserData(response.data)
            return {
                success: true,
                message: 'Login successful',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Login failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Login action failed' }
    }
}

export const handleLogout = async () => {
    await clearAuthCookies();
    return redirect('/login');
}