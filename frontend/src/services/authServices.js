import axios from 'axios';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const authenticateUser = async () => {
    const res = await axios({
        method: 'GET',
        url: `${BACKEND_URL}/api/auth/authenticate`,
        withCredentials: true
    });
    return res.data;
}

export const registerUser = async (data) => {
    const res = await axios({
        method: 'POST',
        url: `${BACKEND_URL}/api/auth/register`,
        data,
        withCredentials: true
    });
    return res;
}

export const loginUser = async (data) => {
    const res = await axios({
        method: 'POST',
        url: `${BACKEND_URL}/api/auth/login`,
        data,
        withCredentials: true
    });
    return res;
}

export const logoutUser = async () => {
    const res = await axios({
        method: 'POST',
        url: `${BACKEND_URL}/api/auth/logout`,
        withCredentials: true
    });
    return res;
}

export const resendVerificationEmail = async (loginId) => {
    const res = await axios({
        method: 'GET',
        url: `${BACKEND_URL}/api/auth/email/send?loginId=${loginId}`,
        withCredentials: true
    });
    return res;
}

export const updateUserMFA = async (data) => {
    const res = await axios({
        method: 'PUT',
        url: `${BACKEND_URL}/api/auth/mfa`,
        data,
        withCredentials: true
    });
    return res;
}

export const getMFAData = async () => {
    const res = await axios({
        method: 'GET',
        url: `${BACKEND_URL}/api/auth/mfa`,
        withCredentials: true
    });
    return res;
}

export const generateMagicLink = async (data) => {
    const res = await axios({
        method: 'POST',
        url: `${BACKEND_URL}/api/auth/magic-link`,
        data,
        withCredentials: true
    });
    return res;
}

export const verifyMagicLink = async (token) => {
    const res = await axios({
        method: 'GET',
        url: `${BACKEND_URL}/api/auth/magic-login?token=${token}`,
        withCredentials: true
    });
    return res;
}

export const generatePasswordResetLink = async (data) => {
    const res = await axios({
        method: 'POST',
        url: `${BACKEND_URL}/api/auth/password/reset/link`,
        data,
        withCredentials: true
    });
    return res;
}

export const verifyPasswordResetLink = async (token) => {
    const res = await axios({
        method: 'GET',
        url: `${BACKEND_URL}/api/auth/password/reset/verify?token=${token}`,
        withCredentials: true
    });
    return res;
}

export const updatePassword = async (data) => {
    const res = await axios({
        method: 'POST',
        url: `${BACKEND_URL}/api/auth/password/reset/update`,
        data,
        withCredentials: true
    });
    return res;
}