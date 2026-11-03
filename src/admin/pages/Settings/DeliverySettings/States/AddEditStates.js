import React, { useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../../../helpers/func_helper';
import { useNavigate, useParams } from 'react-router-dom';
import { API_PATH } from '../../../../constants/const';
import { toast } from 'react-toastify';
import { IconLoader } from '../../../../Loader/IconLoader';
import { PostApi } from '../../../../../services/ApiService';
import Loader from '../../../../Loader/Loader';

export default function AddEditStates() {
    const runforms = useRef();
    const navigate = useNavigate();
    const { id } = useParams();

    const [isLoading, set_isLoading] = useState(false);
    const [load_data, set_load_data] = useState(false);
    const [edit_data, set_edit_data] = useState('add');
    const [initialValues, set_initialValues] = useState({
        state_name: '',
        is_active: "1",
        abbreviation: '',
        country: '',
        tax: 0,
        input_mask: '',
    });

    useEffect(() => {
        if (id) {
            set_edit_data('edit');
            GetStateById(id)
        }
    }, [id]);

    const GetStateById = async (id) => {
        set_load_data(true)
        const response = await PostApi(API_PATH.getDeliveryStateById, { delivery_state_id: id });
        if (response.statusCode === 200) {
            set_load_data(false)
            let data = response.data;
            set_initialValues({
                delivery_state_id: data.delivery_state_id,
                state_name: data.state_name,
                is_active: data.is_active,
                abbreviation: data.abbreviation,
                country: data.country,
                tax: data.tax,
                input_mask: data.input_mask,
            });
        } else {
            set_load_data(false)
        }
    };

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? "1" : "0";
        runforms.current.setFieldValue(e.target.id, value);
        document.getElementById(e.target.id).checked = e.target.checked;
    };

    const handleSubmitForm = () => {
        document.getElementById('states-submit').click();
    };

    const handleSubmit = async (formData, actions) => {
        set_isLoading(true);
        let api_path = '';
        let message = '';

        if (edit_data == 'edit') {
            api_path = API_PATH.updateDeliveryStates;
            message = 'States updated successfully';
        } else {
            api_path = API_PATH.addDeliveryStates;
            message = 'States added successfully';
        }
        if (api_path != '') {
            const response = await PostApi(api_path, formData);
            if (response.statusCode === 200) {
                toast.success(message);
                navigate('/admindelivery-settings/states');
                set_edit_data(null)
            }
            set_isLoading(false);
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center">
                            <span
                                className="d-flex align-items-center p-0 me-3 cursor-pointer"
                                onClick={() => navigate('/admin/delivery-settings/states')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data == 'edit' ? 'Edit' : 'Add'} States</h4>
                            <div className="ms-auto">
                                <button type="submit" className="btn btn-success submit-button" onClick={handleSubmitForm}>
                                    {isLoading ? <IconLoader /> : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </div>
                    {load_data ? (
                        <Loader />
                    ) : (
                        <div className="col-12">
                            <Formik
                                innerRef={runforms}
                                enableReinitialize
                                initialValues={initialValues}
                                validationSchema={Yup.object({
                                    state_name: Yup.string().required('Please Enter State Name'),
                                    abbreviation: Yup.string().required('Please Enter Abbreviation'),
                                    country: Yup.string().required('Please Enter Country Name'),
                                    tax: Yup.string().required('Please Enter Tax'),
                                })}
                                onSubmit={(values, actions) => {
                                    handleSubmit(values, actions);
                                }}
                            >
                                {(runform) => (
                                    <form onSubmit={runform.handleSubmit}>
                                        <div className="row align-items-end">
                                            <div className="col-md-8 mb-3">
                                                <label>State</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="state_name"
                                                        type="text"
                                                        placeholder="Enter State Name"
                                                        {...formAttr(runform, 'state_name')}
                                                    />
                                                    {errorContainer(runform, 'state_name')}
                                                </div>
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <div className="form-check form-switch form-switch-md">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id="is_active"
                                                        defaultChecked={initialValues.is_active == 1}
                                                        onChange={handleChangeSwitch}
                                                    />
                                                    <label className='d-flex align-items-center form-check-label' htmlFor="is_active">
                                                        Is Active?
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label>Abbreviation</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="abbreviation"
                                                        type="text"
                                                        placeholder="Eg. FL"
                                                        {...formAttr(runform, 'abbreviation')}
                                                    />
                                                    {errorContainer(runform, 'abbreviation')}
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label>Country</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="country"
                                                        type="text"
                                                        placeholder="Eg. USA"
                                                        {...formAttr(runform, 'country')}
                                                    />
                                                    {errorContainer(runform, 'country')}
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3 me-1">
                                                <label>Tax %</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="tax"
                                                        type="number"
                                                        {...formAttr(runform, 'tax')}
                                                    />
                                                    {errorContainer(runform, 'tax')}
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label>Input Mask (9 : numeric, a : alphabetical, *: alphanumerical Ex: a9a 9a9)</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="input_mask"
                                                        type="text"
                                                        {...formAttr(runform, 'input_mask')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-none">
                                            <button type="submit" id="states-submit">
                                                Submit
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </Formik>
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
}