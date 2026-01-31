"use server";
import { fetchWhoAmI, loginUser, registerUser, updateProfile } from "@/lib/api/auth"
import { LoginData, RegisterData } from "@/app/(auth)/schema"
import { setAuthToken, setUserData, clearAuthCookies } from "../cookie"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

export const handleWhoAmI = async () => {
    try{
        const result = await fetchWhoAmI();
        if(result.success){
            return {
                success:true,
                message:'User data fetched successfully',
                data:result.data
            }
        }
        return {
            success:false,
            message:result.message || 'Failed to fetch user data'
        }
    }catch(error: Error | any){
        return {
            success:false,
            message:error.message || 'WhoAmI action failed'
        }
    }
}

export async function handleUpdateProfile(profileData: FormData) {
    try {
        const result = await updateProfile(profileData);
        if (result.success) {
            await setUserData(result.data); // update cookie 
            revalidatePath('/user/profile'); // revalidate profile page/ refresh new data
            return {
                success: true,
                message: 'Profile updated successfully',
                data: result.data
            };
        }
        return { success: false, message: result.message || 'Failed to update profile' };
    } catch (error: Error | any) {
        return { success: false, message: error.message };
    }
}