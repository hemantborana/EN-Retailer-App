
const BASE_URL = 'https://script.google.com/macros/s/AKfycbwLtEPYhkoKpcWX5b-i41ZExoiydVB245-RaIOD_4L3B86HhdH3qNaFqX9IoKgWhFnsJw/exec';

const apiRequest = async (body) => {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(body),
            mode: 'cors',
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        return { success: false, message: 'An unexpected error occurred. Please check your network connection.' };
    }
};

export const generateOTP = (email) => {
    return apiRequest({ action: 'generateOTP', email });
};

export const verifyOTP = (email, otp) => {
    return apiRequest({ action: 'verifyOTP', email, otp });
};

export const checkSession = (email, sessionToken) => {
    return apiRequest({ action: 'checkSession', email, sessionToken });
};
