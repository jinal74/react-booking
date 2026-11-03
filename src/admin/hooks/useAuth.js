import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';
import { PostApi } from '../../services/ApiService';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { Context } from '../../context/GeneralContext';
import { SettingsStore } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { API_PATH_USER } from '../../const';

export const useAuth = () => {
    const navigate = useNavigate();
    const context = useContext(Context);
    const settingContext = useContext(SettingsStore);

    const login = async (args, action) => {
        const { email, password, set_isLoading, page } = args;
        set_isLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (auth.currentUser?.emailVerified === false) {
                navigate('/verify');
            } else {
                const token = await auth.currentUser?.getIdToken(true);
                if (token) {
                    localStorage.setItem('token_auth', token);
                    try {
                        const response = await PostApi(API_PATH_USER.login);
                        if (response.statusCode === 200) {
                            context.set_user_details(response.data);
                            if (page !== 'cart-confirm') {
                                navigate('/');
                            }
                            settingContext.GetAllKitchenLocations();
                            context.GetAllKitchenLocations();
                            toast.success('Login successfully');
                        }
                    } catch (error) {
                    }
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
        action.resetForm();
        set_isLoading(false);
    };

    const resendEmailVerification = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                await sendEmailVerification(user);
                toast.success('Email Sent successful!', 3000);
            }
        } catch (error) {
            toast.error('Not Sent Email. Please try again after few minutes!', 2000);
        }
    };

    const verifyEmail = async (type) => {
        try {
            const authGet = getAuth();
            await authGet.currentUser.reload();

            if (authGet.currentUser?.emailVerified) {
                const token = await authGet.currentUser?.getIdToken(true);
                if (token) {
                    localStorage.setItem('token_auth', token);
                    try {
                        const response = await PostApi(API_PATH_USER.login);
                        if (response.statusCode === 200) {
                            context.set_user_details(response.data);
                            navigate('/');
                            settingContext.GetAllKitchenLocations();
                            context.GetAllKitchenLocations();
                            toast.success('Login successfully');
                        }
                    } catch (error) {
                    }
                }
            } else {
                if (type === 'is_dashboard') toast.error('Not Verify Email. Please try again!', 2000);
            }
        } catch (error) {
            toast.error('Not Verify Email. Please try again!', 2000);
        }
    };

    const signUp = async (data) => {
        data.set_isLoading(true);
        await createUserWithEmailAndPassword(auth, data.user_email, data.password)
            .then(async (userCredential) => {
                const authGet = getAuth();
                const user = userCredential.user;

                let metadata = {
                    phone_number: data.phone_number,
                    receive_sms: data.receive_sms ? 1 : 0,
                    receive_email: data.receive_email ? 1 : 0

                }
                updateProfile(user, {
                    displayName: data.user_first_name
                })

                const token = await authGet.currentUser?.getIdToken(true);
                if (token) {
                    localStorage.setItem('token_auth', token);
                    try {
                        const response = await PostApi(API_PATH_USER.login, metadata);
                        if (response.statusCode === 200) {
                            localStorage.removeItem('token_auth');
                            navigate('/verify');
                        }
                    } catch (error) {
                    }
                }

            })
            .catch((error) => {
                toast.warn(error.message);
            });
        data.set_isLoading(false);
    }

    return {
        login,
        signUp,
        verifyEmail,
        resendEmailVerification
    };
};
