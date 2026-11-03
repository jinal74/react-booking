import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Common/Authentication/Login';
import Signup from './components/Common/Authentication/Signup';
import Verify from './components/Common/Authentication/Verify';
import Logout from './components/Common/Authentication/Logout';
import Pages404 from './admin/pages/Utility/pages-404';
import AdminApp from './admin/AdminApp';
import UserApp from './user/UserApp';
import HomePage from './pages/HomePage';
import { loadStripe } from '@stripe/stripe-js';
import { paymentTestKey } from './const';
import { Elements } from '@stripe/react-stripe-js';

export default function RoutesMain() {
    const stripePromise = loadStripe(paymentTestKey);

    return (
        <Elements stripe={stripePromise}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Signup />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/pages-404" element={<Pages404 />} />

                <Route path="/admin/*" element={<AdminApp />} />
                <Route path="/*" element={<UserApp />} />
            </Routes>
        </Elements>
    )
}
