import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import withRouter from '../../../admin/components/Common/withRouter';

const Logout = (props) => {
    const history = props.router.navigate

    useEffect(() => {
        localStorage.removeItem('token_auth');
        history('/');
    }, [history]);

    return <></>;
};

Logout.propTypes = {
    history: PropTypes.object,
};

export default withRouter(Logout);
