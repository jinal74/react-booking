import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import withRouter from '../../../admin/components/Common/withRouter';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { errorContainer, formAttr } from '../../../helpers/func_helper';
import { useAuth } from '../../../admin/hooks/useAuth';
import { IconLoader } from '../../../admin/Loader/IconLoader';

const Login = (props) => {
    //meta title
    document.title = 'Login | TTP Fitness.';
    const navigate = props.router.navigate;
    const [isLoading, set_isLoading] = useState(false);
    const [initialValues, set_initialValues] = useState({
        email: '',
        password: '',
    });

    useEffect(() => {
        if (localStorage.getItem('token_auth')) navigate('/admin/dashboard');
    }, []);

    const { login } = useAuth();

    const handleSubmit = async (values, action) => {
        await login({ ...values, set_isLoading }, action);
    };

    return (
        <React.Fragment>
            <div>
                <div className="row half login-main-page">
                    <div className="d-md-block d-none col-6 p-0">
                        <div className='bg-half'></div>
                    </div>
                    <div className="col-md-6 col-12 p-0">
                        <div className="d-flex mt-2 me-4">
                            <span className="ms-auto"><Link to="/" className="text-decoration-underline"><i className="fas fa-long-arrow-alt-left"></i> Back to Homepage</Link></span>
                        </div>
                        <div className='container-user w-100'>
                            <div className='row d-flex align-items-center justify-content-center'>
                                <div className='col-sm-7'>
                                    <div className='mb-4'>
                                        <h3 className='my-3'><strong>Login to TTP Fitness</strong></h3>
                                        <p className='grey-txt-cls'>To access your account please login with your email address and password.</p>
                                    </div>
                                    <div>
                                        <Formik
                                            enableReinitialize
                                            initialValues={initialValues}
                                            validationSchema={Yup.object({
                                                email: Yup.string()
                                                    .email('Please Enter Valid Email')
                                                    .required('Please Enter Your Email'),
                                                password: Yup.string().required('Please Enter Your Password'),
                                            })}
                                            onSubmit={(values, action) => {
                                                handleSubmit(values, action);
                                            }}
                                        >
                                            {(runform) => (
                                                <form onSubmit={runform.handleSubmit} className="form-horizontal">
                                                    <div className="mb-2">
                                                        <label className="form-label">Email</label>
                                                        <input
                                                            name="email"
                                                            className="form-control"
                                                            placeholder="Enter email"
                                                            type="text"
                                                            {...formAttr(runform, 'email')}
                                                        />
                                                        {errorContainer(runform, 'email')}
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="form-label">Password</label>
                                                        <input
                                                            name="password"
                                                            type="password"
                                                            className="form-control"
                                                            placeholder="Enter Password"
                                                            {...formAttr(runform, 'password')}
                                                        />
                                                        {errorContainer(runform, 'password')}
                                                    </div>

                                                    <div className="d-flex mb-5 align-items-center">
                                                        <span>
                                                            <Link className="caption" to="/register"> Dont have an account? </Link>
                                                        </span>
                                                        {/* <span id="recover_trigger" className="ml-auto"><a className="forgot-pass" to="#recovery">Forgot password?</a></span> */}
                                                    </div>

                                                    <div className="d-grid">
                                                        <button className="btn primary-bg-cls btn-block" type="submit">
                                                            {isLoading ? <IconLoader /> : 'Log In'}
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </Formik>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default withRouter(Login);

Login.propTypes = {
    history: PropTypes.object,
};
