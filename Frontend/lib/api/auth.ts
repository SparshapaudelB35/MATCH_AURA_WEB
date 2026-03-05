import axios from './axios';
import { API } from './endpoints';

export const registerUser = async (registerData: any) => {
  try {
        const response = await axios.post(API.AUTH.REGISTER, registerData)
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Registration failed')
    }
}

export const loginUser = async (loginData: any) => {
  try {
        const response = await axios.post(API.AUTH.LOGIN, loginData)
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Login failed')
    }
}

export const forgotPassword = async (payload: { email: string }) => {
  try {
    const response = await axios.post(API.AUTH.FORGOTPASSWORD, payload);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error.response?.data?.message || error.message || "Forgot password failed");
  }
}

export const resetPassword = async (payload: { token: string; password: string; confirmPassword: string }) => {
  try {
    const response = await axios.post(API.AUTH.RESETPASSWORD, payload);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error.response?.data?.message || error.message || "Reset password failed");
  }
}

export const fetchWhoAmI = async () => {
  try {
        const response = await axios.get(API.AUTH.WHOAMI)   
        return response.data
    } catch (error: Error | any) {
        throw new Error
        (
            error.response?.data?.message
             || error.message 
             || 'Fetching user data failed')
    }
}

export const fetchDiscoverUsers = async (targetGender?: string) => {
  try {
        const response = await axios.get(API.AUTH.DISCOVER, {
            params: targetGender ? { targetGender } : undefined,
        })
        return response.data
    } catch (error: Error | any) {
        throw new Error(
            error.response?.data?.message
            || error.message
            || 'Fetching discover users failed'
        )
    }
}

export const updateProfile = async (profileData: any) => {
  try {
    const response = await axios.put(
      API.AUTH.UPDATEPROFILE,
      profileData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', // for file upload/multer
        }
      }
    );
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Update profile failed');
  }
}
