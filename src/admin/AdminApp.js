import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import VerticalLayout from './components/VerticalLayout';
import { layoutTypes } from './constants/layout';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';
import { authProtectedRoutes } from './routes';
import { ContextProviderSettings } from './context/SettingsContext';
import Authmiddleware from '../user/routes/route';

const getLayout = (layoutType) => {
    let Layout = VerticalLayout;
    switch (layoutType) {
        case layoutTypes.VERTICAL:
            Layout = VerticalLayout;
            break;
        default:
            break;
    }
    return Layout;
};

const AdminApp = () => {
    const selectLayoutState = (state) => state.Layout;
    const LayoutProperties = createSelector(selectLayoutState, (layout) => ({
        layoutType: layout.layoutType,
    }));

    const { layoutType } = useSelector(LayoutProperties);

    const Layout = getLayout(layoutType);

    return (
        <ContextProviderSettings>
            <Routes>
                {authProtectedRoutes.map((route, idx) => (
                    <Route
                        path={route.path}
                        element={
                            <Authmiddleware>
                                <Layout>{route.component}</Layout>
                            </Authmiddleware>
                        }
                        key={idx}
                        exact={true}
                    />
                ))}
                <Route path="/*" element={<Navigate to="/pages-404" />} />
            </Routes>
        </ContextProviderSettings>
    );
};

export default AdminApp;