import React, { useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../../helpers/func_helper';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IconLoader } from '../../../Loader/IconLoader';
import { API_PATH } from '../../../constants/const';
import { PostApi } from '../../../../services/ApiService';
import Loader from '../../../Loader/Loader';
import DataTable from '../../Tables/CustDataTable';

export default function AddEditCoupons() {
    const runforms = useRef();
    const navigate = useNavigate();
    const { id } = useParams();

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadData, setLoadData] = useState(false);
    const [editData, setEditData] = useState(false);
    const [options, setOptions] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'coupon_name',
        order: 1,
    });
    const [initialValues, setInitialValues] = useState({
        coupon_name: '',
        coupon_code: '',
        end_date: null,
        coupon_type: '',
        coupon_value: 0,
        minimum_cart_value: 0,
        coupon_exists: 0,
        is_limited_one_use_per_customer: "0",
        is_auto_apply_coupon_to_cart: "0",
        is_limited_to_first_time_buyers: "0",
        is_active: "1",
        is_offer_free_delivery: "0",
        is_discount_apply_to_delivery_fee: "0",
        is_allowed_on_gift_card: "1",
        is_allowed_on_cart: "1",
        is_allowed_on_meal_packs: "1",
        is_allowed_on_subscription_creation: "1",
        is_allowed_on_weekly_subscription: "1",
    });

    useEffect(() => {
        if (id) {
            setEditData(true)
            GetCouponsById(id)
        }
    }, [id]);

    const GetCouponsById = async (id) => {
        setLoadData(true)
        const response = await PostApi(API_PATH.getCouponsById, { coupon_id: id });
        if (response.statusCode === 200) {
            let data = response.data;
            setInitialValues({
                coupon_id: data.coupon_id,
                coupon_name: data.coupon_name,
                coupon_code: data.coupon_code,
                end_date: data.end_date,
                coupon_type: data.coupon_type,
                coupon_value: data.coupon_value,
                minimum_cart_value: data.minimum_cart_value,
                coupon_exists: data.coupon_exists,
                is_limited_one_use_per_customer: data.is_limited_one_use_per_customer,
                is_auto_apply_coupon_to_cart: data.is_auto_apply_coupon_to_cart,
                is_limited_to_first_time_buyers: data.is_limited_to_first_time_buyers,
                is_active: data.is_active,
                is_offer_free_delivery: data.is_offer_free_delivery,
                is_discount_apply_to_delivery_fee: data.is_discount_apply_to_delivery_fee,
                is_allowed_on_gift_card: data.is_allowed_on_gift_card,
                is_allowed_on_cart: data.is_allowed_on_cart,
                is_allowed_on_meal_packs: data.is_allowed_on_meal_packs,
                is_allowed_on_subscription_creation: data.is_allowed_on_subscription_creation,
                is_allowed_on_weekly_subscription: data.is_allowed_on_weekly_subscription,
            });
        }
        setLoadData(false)
    };

    const columns = [
        {
            name: 'Creation',
            column: 'creation',
            options: {
                sort: true,
            },
        },
        {
            name: 'Order',
            column: 'order',
            options: {
                sort: true,
            },
        },
        {
            name: 'User',
            column: 'user',
            options: {
                sort: true,
            },
        },
        {
            name: 'Value',
            column: 'value',
            options: {
                sort: true,
            },
        },
    ];

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? "1" : "0";
        runforms.current.setFieldValue(e.target.id, value);
        document.getElementById(e.target.id).checked = e.target.checked;
    };

    const handleSubmitForm = () => {
        document.getElementById('coupons-submit').click();
    };

    const handleSubmit = async (formData, actions) => {
        setIsLoading(true);
        let api_path = '';
        let message = '';

        if (editData) {
            api_path = API_PATH.updateCoupon;
            message = 'Coupon updated successfully';
        } else {
            api_path = API_PATH.addCoupon;
            message = 'Coupon added successfully';
        }

        if (api_path != '') {
            const response = await PostApi(api_path, formData);
            if (response.statusCode === 200) {
                toast.success(message);
                navigate('/admin/coupons');
                setEditData(false)
            }
            setIsLoading(false);
        }
    };

    const tableCallBack = (option) => {
        setOptions(option);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center">
                            <span
                                className="d-flex align-items-center p-0 me-3 cursor-pointer"
                                onClick={() => navigate('/admin/coupons')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{editData ? 'Edit' : 'Add'} Coupon</h4>
                            <div className="ms-auto">
                                <button type="submit" className="btn btn-success px-3 submit-button" onClick={handleSubmitForm}>
                                    {isLoading ? <IconLoader /> : 'SAVE'}
                                </button>
                            </div>
                        </div>
                    </div>
                    {loadData ? (
                        <Loader />
                    ) : (
                        <div className="col-12">
                            <Formik
                                innerRef={runforms}
                                enableReinitialize
                                initialValues={initialValues}
                                validationSchema={Yup.object({
                                    coupon_name: Yup.string().required('Please Enter Name'),
                                    coupon_code: Yup.string().required('Please Enter Coupon Code'),
                                })}
                                onSubmit={(values, actions) => {
                                    handleSubmit(values, actions);
                                }}
                            >
                                {(runform) => (
                                    <form onSubmit={runform.handleSubmit}>
                                        <div className="row bg-light py-3 rounded shadow-sm m-2">
                                            <div className='col-md-12'>
                                                <div className='row'>
                                                    <div className="col-md-4 mb-3">
                                                        <label>Name</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="coupon_name"
                                                                type="text"
                                                                placeholder="Enter Name"
                                                                {...formAttr(runform, 'coupon_name')}
                                                            />
                                                            {errorContainer(runform, 'coupon_name')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label>Code</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="coupon_code"
                                                                type="text"
                                                                placeholder="Enter Code"
                                                                {...formAttr(runform, 'coupon_code')}
                                                            />
                                                            {errorContainer(runform, 'coupon_code')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label>End Date</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="end_date"
                                                                type="date"
                                                                {...formAttr(runform, 'end_date')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label>Type</label>
                                                        <div>
                                                            <select
                                                                className="form-select"
                                                                name="coupon_type"
                                                                {...formAttr(runform, 'coupon_type')}
                                                            >
                                                                <option value={1}>Amount in Cart - Fixed Dollar Amount ($)</option>
                                                                <option value={2}>Precentage of Cart (Subtotal)</option>
                                                                <option value={3}>Fixed Dollar Amount to add to Digital Wallet</option>
                                                                <option value={4}>Fixed Precentage to add to Digital Wallet (Subtotal)</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label>Value</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="coupon_value"
                                                                type="number"
                                                                placeholder="Enter value"
                                                                {...formAttr(runform, 'coupon_value')}
                                                            />
                                                            {errorContainer(runform, 'coupon_value')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label>Minimum Cart Value Required To Apply ($)</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="minimum_cart_value"
                                                                type="number"
                                                                placeholder="Enter Minimum cart value"
                                                                {...formAttr(runform, 'minimum_cart_value')}
                                                            />
                                                            {errorContainer(runform, 'minimum_cart_value')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label>How Many Coupons Exist</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="coupon_exists"
                                                                type="number"
                                                                placeholder="Enter Coupons Exist"
                                                                {...formAttr(runform, 'coupon_exists')}
                                                            />
                                                            {errorContainer(runform, 'coupon_exists')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_limited_one_use_per_customer"
                                                                defaultChecked={initialValues.is_limited_one_use_per_customer == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="is_limited_one_use_per_customer">
                                                                Limited One Use per Customer
                                                            </label>
                                                        </div>
                                                        <div className="form-check form-switch form-switch-md mt-2">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_auto_apply_coupon_to_cart"
                                                                defaultChecked={initialValues.is_auto_apply_coupon_to_cart == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="is_auto_apply_coupon_to_cart">
                                                                Auto Apply Coupon to Cart
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_limited_to_first_time_buyers"
                                                                defaultChecked={initialValues.is_limited_to_first_time_buyers == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="is_limited_to_first_time_buyers">
                                                                Limited to First Time Buyers
                                                            </label>
                                                        </div>
                                                        <div className="form-check form-switch form-switch-md mt-2">
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
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row bg-light py-3 rounded shadow-sm m-2 mt-3 px-3">
                                            <span className="heading-main-span mx-0">
                                                Delivery
                                            </span>
                                            <div className="row">
                                                <div className="col-md-4 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_offer_free_delivery"
                                                            defaultChecked={initialValues.is_offer_free_delivery == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_offer_free_delivery">
                                                            Offer Free Delivery?
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_discount_apply_to_delivery_fee"
                                                            defaultChecked={initialValues.is_discount_apply_to_delivery_fee == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_discount_apply_to_delivery_fee">
                                                            Discount Applied to Delivery Fee?
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="heading-main-span mx-0">
                                                Allow on
                                            </span>
                                            <div className="row">
                                                <div className="col-md-4 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allowed_on_gift_card"
                                                            defaultChecked={initialValues.is_allowed_on_gift_card == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allowed_on_gift_card">
                                                            Gift Card
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allowed_on_cart"
                                                            defaultChecked={initialValues.is_allowed_on_cart == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allowed_on_cart">
                                                            À la Carte
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allowed_on_meal_packs"
                                                            defaultChecked={initialValues.is_allowed_on_meal_packs == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allowed_on_meal_packs">
                                                            Meal Packs
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allowed_on_subscription_creation"
                                                            defaultChecked={initialValues.is_allowed_on_subscription_creation == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allowed_on_subscription_creation">
                                                            Subscription Creation
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allowed_on_weekly_subscription"
                                                            defaultChecked={initialValues.is_allowed_on_weekly_subscription == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allowed_on_weekly_subscription">
                                                            Weekly Subscription
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row bg-light py-3 rounded shadow-sm m-2 mt-5 px-3">
                                            <span className="fs-5 fw-bold mx-0">
                                                Checkouts used
                                            </span>
                                            <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                                        </div>

                                        <div className="d-none">
                                            <button type="submit" id="coupons-submit">
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
