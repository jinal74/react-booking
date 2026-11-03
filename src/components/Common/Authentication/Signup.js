import React, { useState } from 'react';
import PropTypes from 'prop-types';
import withRouter from '../../../admin/components/Common/withRouter';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { errorContainer, formAttr } from '../../../helpers/func_helper';
import { useAuth } from '../../../admin/hooks/useAuth';
import { IconLoader } from '../../../admin/Loader/IconLoader';
import { Link } from 'react-router-dom';

const Signup = (props) => {
    //meta title
    document.title = 'Register | TTP Fitness.';

    const [isLoading, set_isLoading] = useState(false);
    const [initialValues, set_initialValues] = useState({
        user_first_name: '',
        user_email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
        terms_conditions: false,
        receive_email: false,
        receive_sms: false,
    });

    const { signUp } = useAuth();

    const handleSubmit = async (values) => {
        await signUp({ ...values, set_isLoading });
    };

    return (
        <React.Fragment>
            <div>
                <div className="row half">
                    <div className="d-md-block d-none col-6 p-0">
                        <div className='bg-half'></div>
                    </div>
                    <div className="col-md-6 col-12 p-0">
                        <div className="d-flex mt-2 me-4">
                            <span className="ms-auto"><Link to="/" className="text-decoration-underline"><i className="fas fa-long-arrow-alt-left"></i> Back to Homepage</Link></span>
                        </div>
                        <div className='container-user w-100 pt-5'>
                            <div className='row d-flex align-items-top justify-content-center'>
                                <div className='col-sm-7'>
                                    <div className='mb-4'>
                                        <h3><strong>Sign Up to TTP Fitness</strong></h3>
                                    </div>
                                    <div>
                                        <Formik
                                            enableReinitialize
                                            initialValues={initialValues}
                                            validationSchema={Yup.object({
                                                user_first_name: Yup.string().required('Please Enter Name'),
                                                user_email: Yup.string()
                                                    .email('Please Enter Valid Email')
                                                    .required('Please Enter Your Email'),
                                                password: Yup.string()
                                                    .test('check-password', function (value) {
                                                        if (!value) {
                                                            return this.createError({ message: 'Please enter password' });
                                                        }
                                                        if (value && value.length < 8) {
                                                            return this.createError({ message: 'Passwords must have at least 8 characters' });
                                                        }
                                                        return true;
                                                    }),
                                                confirm_password: Yup.string()
                                                    .required('Please Enter Confirm Password')
                                                    .oneOf([Yup.ref('password'), null], 'Invalid Password Confirmation'),
                                                phone_number: Yup.string().required('Please Enter Your Phone Number'),
                                                terms_conditions: Yup.boolean()
                                                    .required('Please read and accept our terms and conditions.')
                                                    .oneOf([true], 'Please read and accept our terms and conditions.'),
                                                receive_email: Yup.boolean()
                                                    .required('Please accept EMAIL Option')
                                                    .oneOf([true], 'Please accept EMAIL Option'),
                                            })}
                                            onSubmit={(values) => {
                                                handleSubmit(values);
                                            }}
                                        >
                                            {(runform) => (
                                                <form onSubmit={runform.handleSubmit} className="form-horizontal">
                                                    <div className="mb-3">
                                                        <label className="form-label">First Name</label>
                                                        <input
                                                            name="user_first_name"
                                                            className="form-control"
                                                            placeholder="First Name"
                                                            type="text"
                                                            {...formAttr(runform, 'user_first_name')}
                                                        />
                                                        {errorContainer(runform, 'user_first_name')}
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">Email</label>
                                                        <input
                                                            name="user_email"
                                                            className="form-control"
                                                            placeholder="Enter email"
                                                            type="text"
                                                            {...formAttr(runform, 'user_email')}
                                                        />
                                                        {errorContainer(runform, 'user_email')}
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">Phone </label>
                                                        <input
                                                            name="phone_number"
                                                            className="form-control"
                                                            placeholder="(xxx)-xxx-xxxx"
                                                            type="text"
                                                            {...formAttr(runform, 'phone_number')}
                                                        />
                                                        {errorContainer(runform, 'phone_number')}
                                                    </div>
                                                    <div className="mb-3">
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
                                                    <div className="mb-3">
                                                        <label className="form-label">Password Confirmation</label>
                                                        <input
                                                            name="confirm_password"
                                                            type="password"
                                                            className="form-control"
                                                            placeholder="Enter Confirm Password"
                                                            {...formAttr(runform, 'confirm_password')}
                                                        />
                                                        {errorContainer(runform, 'confirm_password')}
                                                    </div>
                                                    <div className='d-flex mt-5 mb-1'>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input me-2 p-2"
                                                            id="receive_sms"
                                                            {...formAttr(runform, 'receive_sms')}
                                                        />
                                                        <label className='form-check-label' htmlFor="receive_sms">
                                                            I agree to receiving periodic messages sent to my phone for alerts and notifications. Message and data rates may apply.
                                                        </label>
                                                    </div>
                                                    <div className='d-flex mb-1'>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input me-2 p-2"
                                                            id="receive_email"
                                                            {...formAttr(runform, 'receive_email')}
                                                        />
                                                        <label className='form-check-label' htmlFor="receive_email">
                                                            I agree to receiving periodic messages sent to my email for alerts and notifications.*
                                                            {Object.keys(runform.errors)?.length === 2 && errorContainer(runform, 'receive_email')}
                                                        </label>
                                                    </div>
                                                    <div className='d-flex mb-5'>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input me-2 p-2"
                                                            id="terms_conditions"
                                                            {...formAttr(runform, 'terms_conditionss')}
                                                        />
                                                        <label className='form-check-label' htmlFor="terms_conditions">
                                                            I have read and agree to the <u>Terms & Conditions</u>.*
                                                            {Object.keys(runform.errors)?.length === 1 && errorContainer(runform, 'terms_conditions')}
                                                        </label>
                                                    </div>

                                                    <div className="mt-3 d-grid">
                                                        <button className="btn primary-bg-cls" type="submit">
                                                            {isLoading ? <IconLoader /> : 'Register'}
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
        </React.Fragment >
    );
};

export default withRouter(Signup);

Signup.propTypes = {
    history: PropTypes.object,
};
