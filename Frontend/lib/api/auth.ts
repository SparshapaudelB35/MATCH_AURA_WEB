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