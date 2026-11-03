import React, { useContext, useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../../../helpers/func_helper';
import { useNavigate, useParams } from 'react-router-dom';
import { API_PATH } from '../../../../constants/const';
import { toast } from 'react-toastify';
import { IconLoader, SelectLoader } from '../../../../Loader/IconLoader';
import FileIco from '../../../../assets/images/cloud-arrow-up2.svg';
import { PostApi } from '../../../../../services/ApiService';
import { Context } from '../../../../../context/GeneralContext';
import Loader from '../../../../Loader/Loader';
import { SettingsStore } from '../../../../context/SettingsContext';

export default function AddEditPickupPoints() {
    const runforms = useRef();
    const context = useContext(Context);
    const settingContext = useContext(SettingsStore);
    const navigate = useNavigate();
    const { id } = useParams()
    let oneLocation = settingContext.selected_location;

    const [isLoading_routes, set_isLoading_routes] = useState(false);
    const [load_data, set_load_data] = useState(false);
    const [state_list, set_state_list] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [edit_data, set_edit_data] = useState(false);
    const [initialValues, set_initialValues] = useState({
        company_id: context?.user_details?.company_id ?? "",
        pickup_loc_name: '',
        root_planner_loc_id: "NULL",
        pickup_address: '',
        city: '',
        zipcode: '',
        delivery_state_id: '',
        latitude: 0,
        longitude: 0,
        pickup_fee: 0,
        reseller_payout_percentage: 0,
        opening_hours: '',
        pickup_color: '#FFFFFF',
        pickup_text_color: '#FFFFFF',
        is_active: "1",
        is_chargeonly_onefee_perday: "1",
        is_export_root_planner: "1",
        is_allow_on_sunday: oneLocation.is_active_on_sunday == 1 ? "1" : "0",
        is_allow_on_monday: oneLocation.is_active_on_monday == 1 ? "1" : "0",
        is_allow_on_tuesday: oneLocation.is_active_on_tuesday == 1 ? "1" : "0",
        is_allow_on_wednesday: oneLocation.is_active_on_wednesday == 1 ? "1" : "0",
        is_allow_on_thursday: oneLocation.is_active_on_thursday == 1 ? "1" : "0",
        is_allow_on_friday: oneLocation.is_active_on_friday == 1 ? "1" : "0",
        is_allow_on_saturday: oneLocation.is_active_on_saturday == 1 ? "1" : "0",
        is_allow_giftcard: "1",
        is_allow_cart: "1",
        is_allow_mealpacks: "1",
        is_allow_subscription_creation: "1",
        is_allow_weekly_subscription: "1",
        kitchen_location_id: oneLocation?.kitchen_location_id ?? '',
        // pickup_image: '',
    })

    useEffect(() => {
        GetAllDeliveryState();
    }, []);

    useEffect(() => {
        if (id) {
            set_edit_data(true)
            GetPickupPointById(id)
        }
    }, [id]);

    const GetPickupPointById = async (id) => {
        set_load_data(true)
        const response = await PostApi(API_PATH.getPickupLocationById, { pickup_location_id: id });
        if (response.statusCode === 200) {
            set_load_data(false)
            let data = response.data;
            set_initialValues({
                company_id: data.company_id ?? "",
                pickup_loc_name: data.pickup_loc_name,
                root_planner_loc_id: data.root_planner_loc_id,
                pickup_address: data.pickup_address,
                city: data.city,
                zipcode: data.zipcode,
                delivery_state_id: data.delivery_state_id,
                latitude: data.latitude,
                longitude: data.longitude,
                pickup_fee: data.pickup_fee,
                reseller_payout_percentage: data.reseller_payout_percentage,
                opening_hours: data.opening_hours,
                pickup_color: data.pickup_color,
                pickup_text_color: data.pickup_text_color,
                is_active: data.is_active,
                is_chargeonly_onefee_perday: data.is_chargeonly_onefee_perday,
                is_export_root_planner: data.is_export_root_planner,
                is_allow_on_sunday: oneLocation.is_active_on_sunday == 1 ? data.is_allow_on_sunday : "0",
                is_allow_on_monday: oneLocation.is_active_on_monday == 1 ? data.is_allow_on_monday : "0",
                is_allow_on_tuesday: oneLocation.is_active_on_tuesday == 1 ? data.is_allow_on_tuesday : "0",
                is_allow_on_wednesday: oneLocation.is_active_on_wednesday == 1 ? data.is_allow_on_wednesday : "0",
                is_allow_on_thursday: oneLocation.is_active_on_thursday == 1 ? data.is_allow_on_thursday : "0",
                is_allow_on_friday: oneLocation.is_active_on_friday == 1 ? data.is_allow_on_friday : "0",
                is_allow_on_saturday: oneLocation.is_active_on_saturday == 1 ? data.is_allow_on_saturday : "0",
                is_allow_giftcard: data.is_allow_giftcard,
                is_allow_cart: data.is_allow_cart,
                is_allow_mealpacks: data.is_allow_mealpacks,
                is_allow_subscription_creation: data.is_allow_subscription_creation,
                is_allow_weekly_subscription: data.is_allow_weekly_subscription,
                kitchen_location_id: data.kitchen_location_id,
                pickup_location_id: data.pickup_location_id,
                pickup_image: data.pickup_image,
            });
            setTimeout(() => {
                if (data.pickup_image) {
                    let img = document.getElementById('pickup-point-img');
                    img.className = 'w-100 h-100';
                    img.src = data.pickup_image;
                    document.getElementById('upld-img-area').style.display = 'none';
                }
            }, 200);
        } else {
            set_load_data(false)
        }
    };

    const GetAllDeliveryState = async () => {
        set_isLoading_routes(true);
        const response = await PostApi(API_PATH.getallDeliveryStates, { type: "all" });
        if (response.statusCode === 200) {
            set_state_list(response.data.data_result ?? []);
        }
        set_isLoading_routes(false);
    };

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? "1" : "0";
        runforms.current.setFieldValue(e.target.id, value);
        document.getElementById(e.target.id).checked = e.target.checked;
    };

    const handleImg = (file, e) => {
        if (file.length < 0) {
            return;
        }
        if ((file.size / 1024 / 1024).toFixed(2) >= 1) {
            if (e) e.target.value = null;
            toast.error('please select less than 1mb size');
            return;
        } else if (!file.type.includes('image')) {
            if (e) e.target.value = null;
            toast.error('please select valid image');
            return;
        }

        if (file) {
            let img = document.getElementById('pickup-point-img');
            if (file && file != '') {
                let reader = new FileReader();
                reader.onload = function () {
                    img.className = 'w-100 h-100';
                    img.src = reader.result;
                    runforms.current.setFieldValue('pickup_image', file);
                    document.getElementById('upld-img-area').style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSubmitForm = () => {
        document.getElementById('pickup-points-submit').click();
    };

    const handleSubmit = async (formData, actions) => {
        const form_data = new FormData();
        if (typeof formData.sub_recipe_image !== 'string') {
            form_data.append('pickup_image', formData.pickup_image);
            delete formData.pickup_image;
        }
        form_data.append('props', JSON.stringify(formData));

        set_isLoading(true);
        let api_path = '';
        let message = '';

        if (edit_data) {
            api_path = API_PATH.updatePickupLocation;
            message = 'Pickup location updated successfully';
        } else {
            api_path = API_PATH.addPickupLocation;
            message = 'Pickup location added successfully';
        }

        if (api_path != '') {
            const response = await PostApi(api_path, form_data);
            if (response.statusCode === 200) {
                toast.success(message);
                navigate('/admin/delivery-settings/pickup-points');
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
                                onClick={() => navigate('/admin/delivery-settings/pickup-points')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data ? 'Edit' : 'Add'}  Pickup Point <span style={{ fontWeight: "800", fontSize: "17px" }}>{oneLocation?.kitchen_loc_name}</span> </h4>
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
                                    pickup_loc_name: Yup.string().required('Please Enter Name'),
                                    pickup_address: Yup.string().required('Please Enter Address'),
                                    city: Yup.string().required('Please Enter City Name'),
                                    zipcode: Yup.string().required('Please Enter Zip Code'),
                                    delivery_state_id: Yup.string().required('Please Select State'),
                                })}
                                onSubmit={(values, actions) => {
                                    handleSubmit(values, actions);
                                }}
                            >
                                {(runform) => (
                                    <form onSubmit={runform.handleSubmit}>
                                        <div className="row bg-light py-3 rounded shadow-sm m-2">
                                            <div className='col-md-3'>
                                                <div className="upload-file-dash-new position-relative mb-3">
                                                    <div className="file-selecter text-center position-relative">
                                                        <div className="file-area position-relative">
                                                            <input
                                                                type="file"
                                                                name="pickup_image"
                                                                accept="image/*"
                                                                onChange={(e) => handleImg(e.target.files[0], e)}
                                                            />
                                                            <div className="file-dummy py-5">
                                                                <img id="pickup-point-img" loading="lazy" alt="" />
                                                                <div id='upld-img-area'>
                                                                    <div className="file-upload-content">
                                                                        <img
                                                                            className="file-dummy-image"
                                                                            loading="lazy"
                                                                            src={FileIco}
                                                                            alt=""
                                                                        />
                                                                    </div>
                                                                    <span>
                                                                        Drag and drop your files or{' '}
                                                                        <bdi
                                                                            style={{ textDecoration: 'underline' }}
                                                                        >
                                                                            Browse
                                                                        </bdi>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
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
                                                            id="is_chargeonly_onefee_perday"
                                                            defaultChecked={initialValues.is_chargeonly_onefee_perday == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_chargeonly_onefee_perday">
                                                            Charge only one fee per day of pickup?
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_export_root_planner"
                                                            defaultChecked={initialValues.is_export_root_planner == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_export_root_planner">
                                                            Export to Root Planner?
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-9'>
                                                <div className='row'>
                                                    <div className="col-md-6 mb-2">
                                                        <label>Name</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="pickup_loc_name"
                                                                type="text"
                                                                placeholder="Enter Name"
                                                                {...formAttr(runform, 'pickup_loc_name')}
                                                            />
                                                            {errorContainer(runform, 'pickup_loc_name')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label>Root Planner Location</label>
                                                        <div>

                                                            <select
                                                                className="form-select"
                                                                name="root_planner_loc_id"
                                                            // {...formAttr(runform, 'root_planner_loc_id')}
                                                            >
                                                                <option value="NULL">
                                                                    -- No Root Locations --
                                                                </option>

                                                            </select>

                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 mb-2">
                                                        <label>Address</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="pickup_address"
                                                                type="text"
                                                                placeholder="Enter Address"
                                                                {...formAttr(runform, 'pickup_address')}
                                                            />
                                                            {errorContainer(runform, 'pickup_address')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-2">
                                                        <label>City</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="city"
                                                                type="text"
                                                                {...formAttr(runform, 'city')}
                                                            />
                                                            {errorContainer(runform, 'city')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-2">
                                                        <label>Zip Code</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="zipcode"
                                                                type="text"
                                                                {...formAttr(runform, 'zipcode')}
                                                            />
                                                            {errorContainer(runform, 'zipcode')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label>State</label>
                                                        <div>
                                                            {isLoading_routes ? (
                                                                <span className="form-select p-1">
                                                                    <SelectLoader />
                                                                </span>
                                                            ) : (
                                                                <select
                                                                    className="form-select"
                                                                    name="delivery_state_id"
                                                                    {...formAttr(runform, 'delivery_state_id')}
                                                                >
                                                                    <option value="">
                                                                        -- No State Select --
                                                                    </option>
                                                                    {state_list.map((state) =>
                                                                        <option value={state.delivery_state_id} key={state.delivery_state_id}>{state.state_name}</option>
                                                                    )}
                                                                </select>
                                                            )}
                                                            {errorContainer(runform, 'delivery_state_id')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-2">
                                                        <label>Latitude (DECIMAL)</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="latitude"
                                                                type="number"
                                                                {...formAttr(runform, 'latitude')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-2">
                                                        <label>Longitude (DECIMAL)</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="longitude"
                                                                type="number"
                                                                {...formAttr(runform, 'longitude')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-2">
                                                        <label>Pickup Fee</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="pickup_fee"
                                                                type="number"
                                                                {...formAttr(runform, 'pickup_fee')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-2">
                                                        <label>Reseller Payout Percentage (%)</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="reseller_payout_percentage"
                                                                type="number"
                                                                max="100"
                                                                {...formAttr(runform, 'reseller_payout_percentage')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-2">
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
                                                    <div className="col-md-3 mb-3">
                                                        <label htmlFor="example-color-input">Pickup Color</label>
                                                        <div>
                                                            <label
                                                                className="input-group-text p-0"
                                                                htmlFor="example-color-input"
                                                            >
                                                                <input
                                                                    className="form-control form-control-color p-1 me-2"
                                                                    type="color"
                                                                    name="pickup_color"
                                                                    id="example-color-input"
                                                                    {...formAttr(runform, 'pickup_color')}
                                                                />
                                                                {runform.values?.pickup_color ?? '#000000'}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 mb-3">
                                                        <label htmlFor="example-color-input">Pickup Text Color</label>
                                                        <div>
                                                            <label
                                                                className="input-group-text p-0"
                                                                htmlFor="example-color-input1"
                                                            >
                                                                <input
                                                                    className="form-control form-control-color p-1 me-2"
                                                                    type="color"
                                                                    name="pickup_text_color"
                                                                    id="example-color-input1"
                                                                    {...formAttr(runform, 'pickup_text_color')}
                                                                />
                                                                {runform.values?.pickup_text_color ?? '#000000'}
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row bg-light py-3 rounded shadow-sm m-2 px-3">
                                            <span className="heading-main-span mx-0">
                                                Meal Prep Pickup Availability
                                            </span>
                                            <div className="row">
                                                {oneLocation.is_active_on_sunday == 1 &&
                                                    <div className="col-md-3 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_allow_on_sunday"
                                                                defaultChecked={initialValues.is_allow_on_sunday == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_on_sunday">
                                                                Sunday
                                                            </label>
                                                        </div>
                                                    </div>
                                                }
                                                {oneLocation.is_active_on_monday == 1 &&
                                                    <div className="col-md-3 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_allow_on_monday"
                                                                defaultChecked={initialValues.is_allow_on_monday == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_on_monday">
                                                                Monday
                                                            </label>
                                                        </div>
                                                    </div>
                                                }
                                                {oneLocation.is_active_on_tuesday == 1 &&
                                                    <div className="col-md-3 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_allow_on_tuesday"
                                                                defaultChecked={initialValues.is_allow_on_tuesday == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_on_tuesday">
                                                                Tuesday
                                                            </label>
                                                        </div>
                                                    </div>
                                                }
                                                {oneLocation.is_active_on_wednesday == 1 &&
                                                    <div className="col-md-3 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_allow_on_wednesday"
                                                                defaultChecked={initialValues.is_allow_on_wednesday == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_on_wednesday">
                                                                Wednesday
                                                            </label>
                                                        </div>
                                                    </div>
                                                }
                                                {oneLocation.is_active_on_thursday == 1 &&
                                                    <div className="col-md-3 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_allow_on_thursday"
                                                                defaultChecked={initialValues.is_allow_on_thursday == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_on_thursday">
                                                                Thursday
                                                            </label>
                                                        </div>
                                                    </div>
                                                }
                                                {oneLocation.is_active_on_friday == 1 &&
                                                    <div className="col-md-3 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_allow_on_friday"
                                                                defaultChecked={initialValues.is_allow_on_friday == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_on_friday">
                                                                Friday
                                                            </label>
                                                        </div>
                                                    </div>
                                                }
                                                {oneLocation.is_active_on_saturday == 1 &&
                                                    <div className="col-md-3 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_allow_on_saturday"
                                                                defaultChecked={initialValues.is_allow_on_saturday == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_on_saturday">
                                                                Saturday
                                                            </label>
                                                        </div>
                                                    </div>
                                                }

                                            </div>
                                            <span className="heading-main-span mx-0">
                                                Modules allowed Online
                                            </span>
                                            <div className="row">
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allow_giftcard"
                                                            defaultChecked={initialValues.is_allow_giftcard == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_giftcard">
                                                            Gift Card
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allow_cart"
                                                            defaultChecked={initialValues.is_allow_cart == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_cart">
                                                            À la Carte
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allow_mealpacks"
                                                            defaultChecked={initialValues.is_allow_mealpacks == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_mealpacks">
                                                            Meal Packs
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allow_subscription_creation"
                                                            defaultChecked={initialValues.is_allow_subscription_creation == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_subscription_creation">
                                                            Subscription Creation
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allow_weekly_subscription"
                                                            defaultChecked={initialValues.is_allow_weekly_subscription == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_weekly_subscription">
                                                            Weekly Subscription
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-none">
                                            <button type="submit" id="pickup-points-submit">
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
