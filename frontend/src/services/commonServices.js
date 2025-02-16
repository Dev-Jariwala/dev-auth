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

export const getSignedUrl = async (filePath) => {
    const encodedFilePath = encodeURIComponent(filePath);
    // const response = await axios.get('/common/storage/signed-url?filePath=' + encodedFilePath);
    const response = await axiosInstance.get('/common/storage/signed-url?filePath=' + encodedFilePath);
    return { success: true, data: response.data };
}

export const getSignedUrlUseingBodyPath = async (info) => {
    // const response = await axios.post('/common/storage/getSignedUrlUseingBodyPath', info);
    const response = await axiosInstance.post('/common/storage/getSignedUrlUseingBodyPath', info);
    return { success: true, data: response.data };
}

export const getSignedUrlForUpload = async (info) => {
    // const response = await axios.post('/common/storage/upload/signed-url', info);
    const response = await axiosInstance.post('/common/storage/upload/signed-url', info);
    return { success: true, data: response.data };
}

export const uploadFileToSignedUrl = async (signedUrl, file) => {
    const response = await axios.put(signedUrl, file);
    return { success: true, data: response.data }
};

export const deleteFile = async (data) => {
    const response = await axiosInstance({
        method: 'delete',
        url: '/common/storage/delete',
        data
    });
    return { success: true, data: response.data };
}