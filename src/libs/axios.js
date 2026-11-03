import Axios from 'axios';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import { ERROR_CODE } from '../const';
import CryptoJS from 'crypto-js';

let LIVE = Number(process.env.REACT_APP_LIVE);

let api_url = {
    0: process.env.REACT_APP_LOCAL_BASE_URL,
    1: process.env.REACT_APP_LIVE_BASE_URL,
};
export const ApiBaseUrl = api_url[LIVE];

const axios = Axios.create({
    baseURL: ApiBaseUrl,
});

const generatedToken = () => {
    const encryptedPassword = CryptoJS.AES.encrypt(process.env.REACT_APP_RANDOM_VALUE, process.env.REACT_APP_SECRET_KEY).toString();
    return encryptedPassword;
}

onIdTokenChanged(auth, async (user) => {
    let get_token = localStorage.getItem('token_auth')
    if (user && get_token) {
        const token = await user.getIdToken();
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token_auth', token);
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
});

axios.interceptors.request.use((config) => {
    // const token = localStorage.getItem('token_auth');
    // config.headers.Authorization = token ? `Bearer ${token}` : '';
    const isLoggedIn = !!localStorage.getItem('token_auth');

    if (isLoggedIn) {
        const token = localStorage.getItem('token_auth');
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        config.headers.Authorization = `Bearer ${generatedToken()}`;
    }
    return config;
});

axios.interceptors.response.use(
    async (response) => {
        if (response?.data.statusCode === ERROR_CODE.success) {
            return response;
        } else if (response?.data.statusCode === ERROR_CODE.usernotactive) {
            localStorage.removeItem('token_auth');
            if (window.location.pathname !== '/admin/login') window.location.href = '/admin/login';
            toast.error(response.data.message);
        } else if (response?.data.statusCode === ERROR_CODE.datanotfound) {
            return Promise.reject(response.data);
        } else {
            toast.error(response.data.message);
            return Promise.reject(response.data);
        }
    },

    async (error) => {
        if (error.response && error.response.status === ERROR_CODE.invalidtoken) {
            try {
                if (localStorage.getItem('token_auth')) {
                    const token = await auth.currentUser?.getIdToken(true);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    localStorage.setItem('token_auth', token);
                    return axios(error.config);
                }
            } catch (refreshError) {
                // console.log('Token refresh failed:', refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
