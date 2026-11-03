import React, { useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../../../helpers/func_helper';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IconLoader } from '../../../../Loader/IconLoader';
import { API_PATH } from '../../../../constants/const';
import { PostApi } from '../../../../../services/ApiService';
import Loader from '../../../../Loader/Loader';

export default function AddEditKitchenLocation() {
    const runforms = useRef();
    const navigate = useNavigate();
    const { id } = useParams();

    const [isLoading, set_isLoading] = useState(false);
    const [load_data, set_load_data] = useState(false);
    const [edit_data, set_edit_data] = useState(false);
    const [initialValues, set_initialValues] = useState({
        kitchen_loc_name: '',
        is_active: "1",
        is_allow_customer_select: "1",
        is_active_on_sunday: "1",
        is_active_on_monday: "1",
        is_active_on_tuesday: "1",
        is_active_on_wednesday: "1",
        is_active_on_thursday: "1",
        is_active_on_friday: "1",
        is_active_on_saturday: "1",
    });

    useEffect(() => {
        if (id) {
            set_edit_data(true)
            GetKitchenLocationById(id)
        }
    }, [id]);

    const GetKitchenLocationById = async (id) => {
        set_load_data(true)
        const response = await PostApi(API_PATH.getKitchenLocationById, { kitchen_location_id: id });
        if (response.statusCode === 200) {
            set_load_data(false)
            let data = response.data;
            set_initialValues({
                kitchen_location_id: data.kitchen_location_id,
                kitchen_loc_name: data.kitchen_loc_name,
                is_active: data.is_active,
                is_allow_customer_select: data.is_allow_customer_select,
                is_active_on_sunday: data.is_active_on_sunday,
                is_active_on_monday: data.is_active_on_monday,
                is_active_on_tuesday: data.is_active_on_tuesday,
                is_active_on_wednesday: data.is_active_on_wednesday,
                is_active_on_thursday: data.is_active_on_thursday,
                is_active_on_friday: data.is_active_on_friday,
                is_active_on_saturday: data.is_active_on_saturday,
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
        document.getElementById('kitchen-locations-submit').click();
    };

    const handleSubmit = async (formData, actions) => {
        set_isLoading(true);
        let api_path = '';
        let message = '';

        if (edit_data) {
            api_path = API_PATH.updateKitchenLocation;
            message = 'Kitchen location updated successfully';
        } else {
            api_path = API_PATH.addKitchenLocation;
            message = 'Kitchen location added successfully';
        }

        if (api_path != '') {
            const response = await PostApi(api_path, formData);
            if (response.statusCode === 200) {
                toast.success(message);
                navigate('/admin/business-settings/kitchen-locations');
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
                                onClick={() => navigate('/admin/business-settings/kitchen-locations')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data ? 'Edit' : 'Add'} Kitchen Location</h4>
                            <div className="ms-auto">
                                <button type="submit" className="btn btn-success px-3 submit-button" onClick={handleSubmitForm}>
                                    {isLoading ? <IconLoader /> : 'SAVE'}
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
                                    kitchen_loc_name: Yup.string().required('Please Enter Name')
                                })}
                                onSubmit={(values, actions) => {
                                    handleSubmit(values, actions);
                                }}
                            >
                                {(runform) => (
                                    <form onSubmit={runform.handleSubmit}>
                                        <div className="row bg-light py-3 rounded shadow-sm m-2">
                                            <div className='col-md-9'>
                                                <div className='row'>
                                                    <div className="col-md-12 mb-3">
                                                        <label>Name</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="kitchen_loc_name"
                                                                type="text"
                                                                placeholder="Enter Name"
                                                                {...formAttr(runform, 'kitchen_loc_name')}
                                                            />
                                                            {errorContainer(runform, 'kitchen_loc_name')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 mb-2">
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
                                                    <div className="col-md-3 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_allow_customer_select"
                                                                defaultChecked={initialValues.is_allow_customer_select == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_customer_select">
                                                                Allow Customer to Select this kitchen
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row bg-light py-3 rounded shadow-sm m-2 px-3">
                                            <span className="heading-main-span mx-0">
                                                Meal Prep Online Delivery/Pickup Days
                                            </span>
                                            <div className="row">
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_active_on_sunday"
                                                            defaultChecked={initialValues.is_active_on_sunday == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_active_on_sunday">
                                                            Sunday
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_active_on_monday"
                                                            defaultChecked={initialValues.is_active_on_monday == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_active_on_monday">
                                                            Monday
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_active_on_tuesday"
                                                            defaultChecked={initialValues.is_active_on_tuesday == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_active_on_tuesday">
                                                            Tuesday
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_active_on_wednesday"
                                                            defaultChecked={initialValues.is_active_on_wednesday == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_active_on_wednesday">
                                                            Wednesday
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_active_on_thursday"
                                                            defaultChecked={initialValues.is_active_on_thursday == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_active_on_thursday">
                                                            Thursday
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_active_on_friday"
                                                            defaultChecked={initialValues.is_active_on_friday == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_active_on_friday">
                                                            Friday
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_active_on_saturday"
                                                            defaultChecked={initialValues.is_active_on_saturday == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_active_on_saturday">
                                                            Saturday
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-none">
                                            <button type="submit" id="kitchen-locations-submit">
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
