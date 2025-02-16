import axios from 'axios';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { toast } from 'react-toastify';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    withCredentials: true,
});
// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // If the response is successful, just return it
        return response;
    },
    (error) => {
        // Handle errors
        if (error.response && error.response.status === 429) {
            // Display a toast notification for rate-limiting errors
            toast.error('Too many requests. Please try again later.');
        } else if (error.response && error.response.status === 401) {
            // Handle 401 errors
            toast.error(error.response?.data?.message || 'Unauthorized');
            window.location.href = "/login";
            
        } else {
            // Handle other errors (optional)
            // toast.error(error.response?.data?.message || 'An unknown error occurred');
        }
        return Promise.reject(error);
    }
);


export const authenticateUser = async () => {
    const res = await axiosInstance({
        method: 'GET',
        url: `/auth/authenticate`
    });
    return res.data;
}

export const registerUser = async (data) => {
    const res = await axiosInstance({
        method: 'POST',
        url: `/auth/register`,
        data
    });
    return res;
}

export const loginUser = async (data) => {
    const res = await axiosInstance({
        method: 'POST',
        url: `/auth/login`,
        data
    });
    return res;
}

export const logoutUser = async () => {
    const res = await axiosInstance({
        method: 'POST',
        url: `/auth/logout`
    });
    return res;
}

export const resendVerificationEmail = async (loginId) => {
    const res = await axiosInstance({
        method: 'GET',
        url: `/auth/email/send?loginId=${loginId}`
    });
    return res;
}

export const updateUserMFA = async (data) => {
    const res = await axiosInstance({
        method: 'PUT',
        url: `/auth/mfa`,
        data
    });
    return res;
}

export const getMFAData = async () => {
    const res = await axiosInstance({
        method: 'GET',
        url: `/auth/mfa`
    });
    return res;
}

export const generateMagicLink = async (data) => {
    const res = await axiosInstance({
        method: 'POST',
        url: `/auth/magic-link`,
        data
    });
    return res;
}

export const verifyMagicLink = async (token) => {
    const res = await axiosInstance({
        method: 'GET',
        url: `/auth/magic-login?token=${token}`
    });
    return res;
}

export const generatePasswordResetLink = async (data) => {
    const res = await axiosInstance({
        method: 'POST',
        url: `/auth/password/reset/link`,
        data
    });
    return res;
}

export const verifyPasswordResetLink = async (token) => {
    const res = await axiosInstance({
        method: 'GET',
        url: `/auth/password/reset/verify?token=${token}`
    });
    return res;
}

export const updatePassword = async (data) => {
    const res = await axiosInstance({
        method: 'POST',
        url: `/auth/password/reset/update`,
        data
    });
    return res;
}

export const getUserSessions = async () => {
    const res = await axiosInstance({
        method: 'GET',
        url: `/auth/sessions`
    });
    return res;
}