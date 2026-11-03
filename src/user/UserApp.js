import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Authmiddleware from './routes/route';
import { authNotProtectedRoutes, authProtectedRoutes } from './routes';

const UserApp = () => {
    return (
        <Routes>
            {authProtectedRoutes.map((route, idx) => (
                <Route
                    path={route.path}
                    element={
                        <Authmiddleware>
                            {route.component}
                        </Authmiddleware>
                    }
                    key={idx}
                    exact={true}
                />
            ))}
            {authNotProtectedRoutes.map((route, idx) => (
                <Route
                    path={route.path}
                    element={route.component}
                    key={idx}
                    exact={true}
                />
            ))}
            <Route path="/*" element={<Navigate to="/pages-404" />} />
        </Routes>
    );
};

export default UserApp;