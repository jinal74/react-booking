import React, { useContext, useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../../../helpers/func_helper';
import { useNavigate, useParams } from 'react-router-dom';
import { API_PATH } from '../../../../constants/const';
import { toast } from 'react-toastify';
import { IconLoader } from '../../../../Loader/IconLoader';
import { PostApi } from '../../../../../services/ApiService';
import Loader from '../../../../Loader/Loader';
import { SettingsStore } from '../../../../context/SettingsContext';

export default function AddEditTransporters() {
    const runforms = useRef();
    const navigate = useNavigate();
    const { id } = useParams();
    const context = useContext(SettingsStore);

    const [isLoading, set_isLoading] = useState(false);
    const [edit_data, set_edit_data] = useState('add');
    const [load_data, set_load_data] = useState(false);
    const [initialValues, set_initialValues] = useState({
        route_name: '',
        route_tag: '',
        route_color: '#FFFFFF',
        route_text_color: '#FFFFFF',
        opening_hours: '',
        is_active: "1",
        is_charge_one_fee_per_day: "1",
        export_to_root_planner: "1",
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
            set_edit_data('edit');
            GetDeliveryRouteById(id)
        }
    }, [id]);

    const GetDeliveryRouteById = async (id) => {
        set_load_data(true)
        const response = await PostApi(API_PATH.getDeliveryRouteById, { delivery_route_id: id });
        if (response.statusCode === 200) {
            set_load_data(false)
            let data = response.data;
            set_initialValues({
                delivery_route_id: data.delivery_route_id,
                route_name: data.route_name,
                route_tag: data.route_tag,
                route_color: data.route_color,
                route_text_color: data.route_text_color,
                opening_hours: data.opening_hours,
                is_active: data.is_active,
                is_charge_one_fee_per_day: data.is_charge_one_fee_per_day,
                export_to_root_planner: data.export_to_root_planner,
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
        document.getElementById('transporters-submit').click();
    };

    const handleSubmit = async (formData, actions) => {
        set_isLoading(true);
        let api_path = '';
        let message = '';


        if (edit_data == 'edit') {
            api_path = API_PATH.updateDeliveryRoutes;
            message = 'Transporters updated successfully';
        } else {
            formData.kitchen_location_id = context?.selected_location?.kitchen_location_id;
            api_path = API_PATH.addDeliveryRoutes;
            message = 'Transporters added successfully';
        }

        if (api_path != '') {
            const response = await PostApi(api_path, formData);
            if (response.statusCode === 200) {
                toast.success(message);
                navigate('/admin/delivery-settings/transporters');
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
                                onClick={() => navigate('/admin/delivery-settings/transporters')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data == 'edit' ? 'Edit' : 'Add'} Delivery Routes & Methods</h4>
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
                                    route_name: Yup.string().required('Please Enter Name')
                                })}
                                onSubmit={(values, actions) => {
                                    handleSubmit(values, actions);
                                }}
                            >
                                {(runform) => (
                                    <form onSubmit={runform.handleSubmit}>
                                        <div className="row align-items-center bg-light py-3 rounded shadow-sm m-2">
                                            <div className='col-md-3'>
                                                <div className="mb-3">
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
                                                <div className="mb-3">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_charge_one_fee_per_day"
                                                            defaultChecked={initialValues.is_charge_one_fee_per_day == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_charge_one_fee_per_day">
                                                            Charge only one fee per day of pickup?
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="export_to_root_planner"
                                                            defaultChecked={initialValues.export_to_root_planner == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="export_to_root_planner">
                                                            Export to Root Planner?
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-9'>
                                                <div className='row'>
                                                    <div className="col-md-12 mb-2">
                                                        <label>Name</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="route_name"
                                                                type="text"
                                                                placeholder="Enter Name"
                                                                {...formAttr(runform, 'route_name')}
                                                            />
                                                            {errorContainer(runform, 'route_name')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-2">
                                                        <label>Tag</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="route_tag"
                                                                type="text"
                                                                placeholder="Enter Tag"
                                                                {...formAttr(runform, 'route_tag')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-2">
                                                        <label htmlFor="example-color-input">Route Color</label>
                                                        <div>
                                                            <label
                                                                className="input-group-text p-0"
                                                                htmlFor="example-color-input"
                                                            >
                                                                <input
                                                                    className="form-control form-control-color p-1 me-2"
                                                                    type="color"
                                                                    name="route_color"
                                                                    id="example-color-input"
                                                                    {...formAttr(runform, 'route_color')}
                                                                />
                                                                {runform.values?.route_color ?? '#000000'}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-2">
                                                        <label htmlFor="example-color-input">Route Text Color</label>
                                                        <div>
                                                            <label
                                                                className="input-group-text p-0"
                                                                htmlFor="example-color-input1"
                                                            >
                                                                <input
                                                                    className="form-control form-control-color p-1 me-2"
                                                                    type="color"
                                                                    name="route_text_color"
                                                                    id="example-color-input1"
                                                                    {...formAttr(runform, 'route_text_color')}
                                                                />
                                                                {runform.values?.route_text_color ?? '#000000'}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 mb-2">
                                                        <label>Opening Hours</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="opening_hours"
                                                                type="text"
                                                                {...formAttr(runform, 'opening_hours')}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-12'>
                                                <span className="heading-main-span mx-0">
                                                    Meal Prep Delivery Schedule
                                                </span>
                                                <div className="row">
                                                    <div className="col-md-3">
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
                                                    <div className="col-md-3">
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
                                                    <div className="col-md-3">
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
                                                    <div className="col-md-3">
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
                                                    <div className="col-md-3">
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
                                                    <div className="col-md-3">
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
                                                    <div className="col-md-3">
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
                                        </div>

                                        <div className="d-none">
                                            <button type="submit" id="transporters-submit">
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