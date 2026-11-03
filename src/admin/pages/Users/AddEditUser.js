import React, { useContext, useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../helpers/func_helper';
import { useNavigate, useParams } from 'react-router-dom';
import { IconLoader, SelectLoader } from '../../Loader/IconLoader';
import { API_PATH } from '../../constants/const';
import { toast } from 'react-toastify';
import FileIco from '../../assets/images/cloud-arrow-up2.svg';
import { Tooltip } from 'reactstrap';
import CryptoJS from 'crypto-js';
import { SettingsStore } from "../../context/SettingsContext";
import { PostApi } from '../../../services/ApiService';

export default function AddEditUser() {
    const runforms = useRef();
    const navigate = useNavigate();
    const { id } = useParams();
    const context = useContext(SettingsStore);

    const [edit_data, set_edit_data] = useState('add');
    const [isLoading, set_isLoading] = useState(false);
    const [kitchen_loc_list, setkitchen_loc_list] = useState(null);
    const [load_data, set_load_data] = useState(false);
    const [userList, set_userList] = useState([]);
    const [initialValues, set_initialValues] = useState({
        user_profile_image: null,
        user_role_id: '',
        user_first_name: '',
        user_last_name: '',
        is_active: "1",
        receive_sms: "1",
        receive_email: "1",
        kitchen_loc_id: '',
        user_email: '',
        last_checkout_on: "",
        password: '',
        phone_number: '',
        dob: '',
        loyalty_cashback: '',
        digital_amount_to_referring_customer: '',
        digital_amount_to_referred_customer: '',
        notes: '',
        kitchen_wise_role: []
    });
    const [tooltipOpen, setTooltipOpen] = useState('');

    const toggle = (key) => {
        setTooltipOpen(tooltipOpen == key ? '' : key);
    }

    useEffect(() => {
        GlobalUserList();
        GetAllKitchenLocations();
    }, []);

    useEffect(() => {
        if (id && kitchen_loc_list) fetchEditData(id);
        else if (kitchen_loc_list && !id) {
            let kitchenWiseRole = kitchen_loc_list?.map((f) => ({
                kitchen_loc_id: f.kitchen_location_id,
                user_role_id: ""
            }))
            runforms?.current?.setFieldValue("kitchen_wise_role", kitchenWiseRole);
        }
    }, [id, kitchen_loc_list]);

    const GetAllKitchenLocations = async () => {
        const response = await PostApi(API_PATH.getAllKitchenLocation, {
            type: "all",
        });
        if (response.statusCode === 200) {
            setkitchen_loc_list(response.data.data_result);
        }
    };

    const GlobalUserList = async () => {
        set_load_data(true);
        const response = await PostApi(API_PATH.getGlobalUserList);
        if (response.statusCode === 200) {
            set_load_data(false);
            set_userList(response.data ?? []);
            if (!id) runforms?.current?.setFieldValue("user_role_id", response.data?.[0]?.user_role_id);
        }
        set_load_data(false);
    };

    const fetchEditData = async (user_id) => {
        const response = await PostApi(API_PATH.getCompanyUserById, { user_id });
        if (response.statusCode === 200) {
            let data = response.data.user_detail;
            set_edit_data('edit');

            let formattedDate = data.dob ?? '';
            if (data.dob && data.dob !== '') {
                const inputDate = new Date(data.dob).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
                const parts = inputDate.split('/');
                formattedDate = `${parts[2]}-${parts[0]}-${parts[1]}`;
            }
            let kitchenWiseRole = [];
            if (response.data.kitchen_wise_user_role?.length > 0) {
                kitchenWiseRole = response.data.kitchen_wise_user_role?.map((f) => ({
                    kitchen_loc_id: f.kitchen_location_id,
                    user_role_id: f.user_role_id === data?.user_role_id ? "" : f.user_role_id
                })) ?? [];
            } else {
                kitchenWiseRole = context.kitchen_loc_list?.map((f) => ({
                    kitchen_loc_id: f.kitchen_location_id,
                    user_role_id: ""
                })) ?? [];
            }

            set_initialValues({
                user_id: data.user_id,
                user_profile_image: data.user_profile_image,
                user_role_id: data.user_role_id,
                user_first_name: data.user_first_name,
                user_last_name: data.user_last_name,
                is_active: data.is_active,
                receive_sms: data.receive_sms,
                receive_email: data.receive_email,
                kitchen_loc_id: data.kitchen_loc_id,
                user_email: data.user_email,
                password: data.password ?? '',
                phone_number: data.phone_number,
                dob: formattedDate,
                loyalty_cashback: data.loyalty_cashback,
                digital_amount_to_referring_customer: data.digital_amount_to_referring_customer,
                digital_amount_to_referred_customer: data.digital_amount_to_referred_customer,
                notes: data.notes,
                firebase_user_id: data.firebase_user_id,
                last_checkout_on: "",
                kitchen_wise_role: kitchenWiseRole
            });

            document.getElementById('is_active').checked = data.is_active == 1;
            document.getElementById('receive_sms').checked = data.receive_sms == 1;
            document.getElementById('receive_email').checked = data.receive_email == 1;

            if (data.user_profile_image) {
                let img = document.getElementById('user-img');
                img.className = 'w-100 h-100';
                img.src = data.user_profile_image;
                document.getElementById('upload-img-area').style.display = 'none';
            }
        }
    }

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
            let img = document.getElementById('user-img');
            if (file && file != '') {
                let reader = new FileReader();
                reader.onload = function () {
                    img.className = 'w-100 h-100';
                    img.src = reader.result;
                    runforms.current.setFieldValue('user_profile_image', file);
                    document.getElementById('upload-img-area').style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSubmitForm = () => {
        document.getElementById('users-submit').click();
    };

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? "1" : "0";
        runforms.current.setFieldValue(e.target.id, value);
        document.getElementById(e.target.id).checked = e.target.checked;
    };

    const changeKitchenWiseUserRole = (value, item, index) => {
        let tempData = [...runforms.current?.values?.kitchen_wise_role];
        let tempObj = { ...item };
        tempObj.user_role_id = value;
        tempData?.splice(index, 1, tempObj);
        runforms?.current?.setFieldValue("kitchen_wise_role", tempData);
    }

    const handleSubmit = async (formData, actions) => {
        set_isLoading(true);
        let temp_obj = { ...formData };

        if (temp_obj.kitchen_loc_id === "") temp_obj.kitchen_loc_id = null;
        if (formData.password !== '') {
            const encryptedPassword = CryptoJS.AES.encrypt(formData.password, process.env.REACT_APP_SECRET_KEY).toString();
            temp_obj.password = encryptedPassword;
        }
        if (temp_obj?.kitchen_wise_role) {
            temp_obj.kitchen_wise_role = temp_obj?.kitchen_wise_role?.map((f) => ({
                kitchen_loc_id: (f.kitchen_loc_id ?? f.kitchen_location_id),
                user_role_id: (f.user_role_id === "" ? temp_obj?.user_role_id : f.user_role_id)
            }))
        }

        const timestamp = new Date(temp_obj.dob).getTime();
        if (temp_obj.dob && temp_obj.dob !== '') temp_obj.dob = timestamp;

        const form_data = new FormData()
        if (temp_obj.user_profile_image && typeof temp_obj.user_profile_image !== 'string') {
            form_data.append('user_profile_image', temp_obj.user_profile_image);
        }

        let api_path = '';
        let message = '';

        if (edit_data == 'edit') {
            api_path = API_PATH.editCompanyUsers;
            message = 'User updated successfully';
        } else {
            api_path = API_PATH.addCompanyUsers;
            message = 'User added successfully';
        }

        form_data.append('props', JSON.stringify(temp_obj));

        if (api_path != '') {
            const response = await PostApi(api_path, form_data);
            if (response.statusCode === 200) {
                toast.success(message);
                navigate('/admin/users');
            }
            set_isLoading(false);
        }
    };

    return (
        <React.Fragment>
            <div className="page-content user-add-main">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center">
                            <span
                                className="d-flex align-items-center p-0 me-3 cursor-pointer"
                                onClick={() => navigate('/admin/users')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data == 'edit' ? 'Edit' : 'Add'} User</h4>
                            <div className="ms-auto">
                                <button type="submit" className="btn btn-success" onClick={handleSubmitForm}>
                                    {isLoading ? <IconLoader /> : 'SAVE'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <Formik
                            innerRef={runforms}
                            enableReinitialize
                            initialValues={initialValues}
                            validationSchema={Yup.object({
                                user_first_name: Yup.string().required('Please enter first name'),
                                user_last_name: Yup.string().required('Please enter last name'),
                                user_email: Yup.string().required('Please enter email'),
                                password: Yup.string()
                                    .test('check-password', function (value) {
                                        if ((!id) && !value) {
                                            return this.createError({ message: 'Please enter password' });
                                        }
                                        if (value && value.length < 6) {
                                            return this.createError({ message: 'Password must be at least 6 characters' });
                                        }
                                        return true;
                                    }),
                            })}
                            onSubmit={(values, actions) => {
                                handleSubmit(values, actions);
                            }}
                        >
                            {(runform) => (
                                <form onSubmit={runform.handleSubmit}>
                                    <div className="row mx-2 mb-3">
                                        <div className="col-md-3 p-0 pe-2">
                                            <div className="p-3 bg-light rounded shadow-sm h-100">
                                                <div>
                                                    <div className="upload-file-dash-new position-relative">
                                                        <div className="file-selecter text-center position-relative">
                                                            <div className="file-area position-relative">
                                                                <input
                                                                    type="file"
                                                                    name="user_profile_image"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleImg(e.target.files[0], e)}
                                                                />
                                                                <div className="file-dummy">
                                                                    <img id="user-img" loading="lazy" alt="" />
                                                                    <div id='upload-img-area'>
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
                                                </div>
                                                <div className='mt-3'>
                                                    <label>Global User Role</label>
                                                    <div>
                                                        {load_data ? (
                                                            <span className="form-select p-1">
                                                                <SelectLoader />
                                                            </span>
                                                        ) : (
                                                            <select
                                                                className="form-select"
                                                                name="user_role_id"
                                                                {...formAttr(runform, "user_role_id")}
                                                            >
                                                                {userList.map((user) => (
                                                                    <option
                                                                        key={user.user_role_id}
                                                                        value={user.user_role_id}
                                                                    >
                                                                        {user.user_role_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                </div>
                                                {
                                                    runform.values?.kitchen_wise_role?.map((item, i) => {
                                                        let index = kitchen_loc_list?.findIndex((f) => f.kitchen_location_id === (item.kitchen_loc_id ?? item.kitchen_location_id));
                                                        return (
                                                            <div className='mt-3' key={`kitchen-role-${item.kitchen_location_id}-${i}`}>
                                                                <label>{kitchen_loc_list?.[index]?.kitchen_loc_name} kitchen User Role</label>
                                                                <div>
                                                                    <select
                                                                        className="form-select"
                                                                        name="kitchen_wise_role"
                                                                        onChange={(e) => changeKitchenWiseUserRole(e.target.value, item, i)}
                                                                        value={item.user_role_id}
                                                                    >
                                                                        <option value="">Default Global Role</option>
                                                                        {userList.map((user) => (
                                                                            <option
                                                                                key={user.user_role_id}
                                                                                value={user.user_role_id}
                                                                            >
                                                                                {user.user_role_name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-9 p-0 ps-2">
                                            <div className="p-3 bg-light rounded shadow-sm h-100">
                                                <div className="row">
                                                    <div className="col-md-4 mb-3">
                                                        <label>Name</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="user_first_name"
                                                                type="text"
                                                                placeholder="Enter First Name"
                                                                {...formAttr(runform, 'user_first_name')}
                                                            />
                                                            {errorContainer(runform, 'user_first_name')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label>Last Name</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="user_last_name"
                                                                type="text"
                                                                placeholder="Enter Last Name"
                                                                {...formAttr(runform, 'user_last_name')}
                                                            />
                                                            {errorContainer(runform, 'user_last_name')}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-4 mb-1">
                                                        <div className="form-check form-switch form-switch-md mt-2">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_active"
                                                                onChange={handleChangeSwitch}
                                                                defaultChecked={runform.values?.is_active == 1}
                                                            />
                                                            <label
                                                                className="form-check-label d-flex align-items-center"
                                                                htmlFor="is_active"
                                                            >Is Active?</label>
                                                        </div>
                                                        <div className="form-check form-switch form-switch-md mt-1">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="receive_sms"
                                                                onChange={handleChangeSwitch}
                                                                defaultChecked={runform.values?.receive_sms == 1}
                                                            />
                                                            <label
                                                                className="form-check-label d-flex align-items-center"
                                                                htmlFor="receive_sms"
                                                            >Recieve SMS?</label>
                                                        </div>
                                                        <div className="form-check form-switch form-switch-md my-1">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="receive_email"
                                                                onChange={handleChangeSwitch}
                                                                defaultChecked={runform.values?.receive_email == 1}
                                                            />
                                                            <label
                                                                className="form-check-label d-flex align-items-center"
                                                                htmlFor="receive_email"
                                                            >Recieve EMAIl?</label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label>Kitchen Location</label>
                                                        <div>
                                                            <select
                                                                className="form-select"
                                                                name="kitchen_loc_id"
                                                                {...formAttr(runform, 'kitchen_loc_id')}
                                                            >
                                                                <option value="">
                                                                    --Select--
                                                                </option>
                                                                {kitchen_loc_list?.map((user) => (
                                                                    <option
                                                                        key={user.kitchen_location_id}
                                                                        value={user.kitchen_location_id}
                                                                    >
                                                                        {user.kitchen_loc_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label>Email</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="user_email"
                                                                type="email"
                                                                disabled={edit_data === 'edit'}
                                                                autoComplete="off"
                                                                placeholder="Enter E-mail"
                                                                {...formAttr(runform, 'user_email')}
                                                            />
                                                            {errorContainer(runform, 'user_email')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 me-1 mb-3">
                                                        <label>Password</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="password"
                                                                type="password"
                                                                autoComplete="new-password"
                                                                placeholder="Leave blank to keep current"
                                                                {...formAttr(runform, 'password')}
                                                            />
                                                            {errorContainer(runform, 'password')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label>Phone</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="phone_number"
                                                                type="tel"
                                                                placeholder="Enter Phone Number"
                                                                {...formAttr(runform, 'phone_number')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label>Birth Date</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="dob"
                                                                type="date"
                                                                {...formAttr(runform, 'dob')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className='d-flex align-items-center'>
                                                            User Loyalty Cashback (-1 to use default: 0%)
                                                            <div id='Tooltip_loyalty_cashback' className='d-inline-flex'>
                                                                <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'loyalty_cashback'}
                                                                placement={'right'}
                                                                target='Tooltip_loyalty_cashback'
                                                                toggle={() => toggle('loyalty_cashback')}
                                                            >
                                                                tooltip
                                                            </Tooltip>
                                                        </label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="loyalty_cashback"
                                                                type="number"
                                                                {...formAttr(runform, 'loyalty_cashback')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className='d-flex align-items-center'>
                                                            Digital Amount to Referring Customer (-1 to use default: $40.00)
                                                            <div id='Tooltip_digital_amount_to_referring_customer' className='d-inline-flex'>
                                                                <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'digital_amount_to_referring_customer'}
                                                                placement={'right'}
                                                                target='Tooltip_digital_amount_to_referring_customer'
                                                                toggle={() => toggle('digital_amount_to_referring_customer')}
                                                            >
                                                                tooltip
                                                            </Tooltip>
                                                        </label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="digital_amount_to_referring_customer"
                                                                type="number"
                                                                {...formAttr(runform, 'digital_amount_to_referring_customer')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className='d-flex align-items-center'>
                                                            Digital Amount to Referred Customer (-1 to use default: $40.00)
                                                            <div id='Tooltip_digital_amount_to_referred_customer' className='d-inline-flex'>
                                                                <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'digital_amount_to_referred_customer'}
                                                                placement={'right'}
                                                                target='Tooltip_digital_amount_to_referred_customer'
                                                                toggle={() => toggle('digital_amount_to_referred_customer')}
                                                            >
                                                                tooltip
                                                            </Tooltip>
                                                        </label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="digital_amount_to_referred_customer"
                                                                type="number"
                                                                {...formAttr(runform, 'digital_amount_to_referred_customer')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className='d-flex align-items-center'>
                                                            Notes
                                                        </label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="notes"
                                                                type="text"
                                                                {...formAttr(runform, 'notes')}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            className="d-none"
                                            id="users-submit"
                                        >
                                            {runform.isSubmitting ? <IconLoader /> : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </React.Fragment >
    );
}
