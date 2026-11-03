import PropTypes from 'prop-types';
import React from 'react';
import './assets/css/mainCommon.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RoutesMain from './RoutesMain';

const App = () => {

    return (
        <React.Fragment>
            <ToastContainer autoClose={1000} theme="dark" position="bottom-left" />
            <RoutesMain />
        </React.Fragment>
    );
};

App.propTypes = {
    layout: PropTypes.any,
};

export default App;
