import React, { useContext, useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../../helpers/func_helper';
import { useNavigate, useParams } from 'react-router-dom';
import DataTable from '../../Tables/CustDataTable';
import SubscriptionCreationModals from './SubscriptionCreationModals';
import { SettingsStore } from '../../../context/SettingsContext';
import { API_PATH, daysOfWeek } from '../../../constants/const';
import { PostApi } from '../../../../services/ApiService';
import { IconLoader } from '../../../Loader/IconLoader';
import { toast } from 'react-toastify';

export default function AddEditSubscriptionCreation() {
    const runforms = useRef();
    const { id } = useParams();
    const navigate = useNavigate();
    const context = useContext(SettingsStore);

    const [isLoading, setIsLoading] = useState(false);
    const [delete_prices, set_delete_prices] = useState({ data: null, show: false });
    const [kitchen_location, set_kitchen_location] = useState(context?.selected_location?.kitchen_location_id);
    const [edit_data, set_edit_data] = useState(false);
    const [no_of_surcharge_meals_per_day, set_no_of_surcharge_meals_per_day] = useState({ data: null, show: false });
    const [price_edit, set_price_edit] = useState({ data: null, show: false });
    const [delivery_meals, set_delivery_meals] = useState({ data: null, show: false });
    const [categories, set_categories] = useState({ data: null, show: false });
    const [plan_description, set_plan_description] = useState('');
    const [portion_description, set_portion_description] = useState('');
    const [portion_description_show, set_portion_description_show] = useState(false);
    const [plan_description_show, set_plan_description_show] = useState(false);
    const [price_show, set_price_show] = useState(false);
    const [portionSizes, setPortionSizes] = useState([]);
    const [modalNext, setModalNext] = useState({
        formData: null,
        show: false,
        prevState: '',
        to_which_subscriptions_changes_applied: 'new'
    });
    const [priceData, setPriceData] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState([]);
    const [initialValues, setInitialValues] = useState({
        plan_nick_name: '',
        plan_name: '',
        is_active: '0',
        numbers_of_weeks: '0',
        better_days_before_renew: '0',
        billing_renew_day: '-1',
        portion_size_id: '',
        display_order: '0',
        plan_description: '',
        portion_description: '',
        // prices: [],
    });
    const [priceOptions, setPriceOptions] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: '',
        order: 0,
    });
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
    });

    const columnsPrices = [
        {
            name: 'Days per week',
            column: 'days_per_week',
            options: {
                className: 'align-top',
                sort: true
            }
        },
        {
            name: 'Meals per day',
            column: 'meals_per_day',
            options: {
                className: 'align-top',
                sort: true
            }
        },
        {
            name: 'Price',
            column: 'price',
            options: {
                className: 'align-top',
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="cursor-pointer" onClick={() => set_price_edit({ data: data[i], show: true })}>
                            <span className="dotted-underline">${data[i].price}</span>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Delivery meals',
            column: 'del_for_days_on_sunday',
            options: {
                className: 'align-top',
                sort: true,
                CustomBodyRender: (data, i) => {
                    let days = daysOfWeek;
                    let temp_arr = [];
                    for (let ind = 0; ind < days.length; ind++) {
                        if (initialValues?.[`is_start_on_${days[ind]}`] !== undefined && data[i]?.[`del_for_days_on_${days[ind]}`] && data[i]?.[`del_for_days_on_${days[ind]}`] > 0) {
                            temp_arr.push(`${(data[i]?.[`del_for_days_on_${days[ind]}`])}X${days[ind]}`);
                        }
                    }
                    return (
                        <div className="cursor-pointer" onClick={() => set_delivery_meals({ data: data[i], show: true })}>
                            {temp_arr.map((item, index) => (
                                <div key={index} className={`dotted-underline${index === temp_arr.length - 1 ? '' : ' mb-1'}`}>
                                    {item}{index !== temp_arr.length - 1 && ','}
                                </div>
                            ))}
                        </div>
                    );
                },
            },
        },
        {
            name: 'Categories',
            column: 'meals_by_category',
            options: {
                className: 'align-top',
                sort: true,
                CustomBodyRender: (data, i) => {
                    let temp_arr = data[i].meals_by_category?.split(',');
                    return (
                        <div className="cursor-pointer" onClick={() => set_categories({ data: data[i], show: true })}>
                            {temp_arr
                                ?.filter(item => parseInt(item.split('X')[0]) > 0)
                                ?.map((item, index, arr) => (
                                    <div key={index} className={`dotted-underline${index === arr.length - 1 ? '' : ' mb-1'}`}>
                                        {item + (index === arr.length - 1 ? '' : ',')}
                                    </div>
                                ))
                            }
                        </div>
                    );
                },
            },
        },
        {
            name: 'Included Surcharge Meals',
            column: 'no_of_surcharge_meals_per_day',
            options: {
                className: 'align-top',
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div
                            className={`cursor-pointer ${data[i].no_of_surcharge_meals_per_day === '' ? 'text-danger' : ''}`}
                            onClick={() => set_no_of_surcharge_meals_per_day({ data: data[i], show: true })}
                        >
                            <span className="dotted-underline">
                                {data[i].no_of_surcharge_meals_per_day !== '' ? data[i].no_of_surcharge_meals_per_day : 'Empty'}
                            </span>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Action',
            column: 'subscription_price_plan_id',
            options: {
                className: 'align-top',
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="cursor-pointer" onClick={() => set_delete_prices({ data: data[i].subscription_price_plan_id, show: true })}>
                            <i className="bx bxs-trash fs-4 text-danger"></i>
                        </div>
                    );
                },
            },
        },
    ];

    const columns = [
        {
            name: 'Subscription',
            column: 'days_per_week',
            options: {
                sort: true
            }
        },
        {
            name: 'User',
            column: 'meals_per_day',
            options: {
                sort: true
            }
        },
        {
            name: 'Last Charge',
            column: 'price',
            options: {
                sort: true
            }
        },
        {
            name: 'Start',
            column: 'delivery_meals',
            options: {
                sort: true
            }
        },
        {
            name: 'End',
            column: 'categories',
            options: {
                sort: true
            }
        },
        {
            name: 'Renew',
            column: 'no_of_surcharge_meals_per_day',
            options: {
                sort: true
            }
        },
        {
            name: 'Amount',
            column: 'no_of_surcharge_meals_per_day',
            options: {
                sort: true
            }
        },
        {
            name: 'Action',
            column: 'id',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="cursor-pointer" onClick={() => handleRowClick(data[i].id)}>
                            <i className="bx bxs-edit-alt fs-4"></i>
                        </div>
                    );
                },
            },
        },
    ];

    useEffect(() => {
        GetAllPortionSize();
        if (id) {
            GetAllPrices(priceOptions);
        }
    }, [id]);

    useEffect(() => {
        if (context?.selected_location && !id) {
            set_kitchen_location(context?.selected_location?.kitchen_location_id);
            setInitialValues({ ...initialValues, ...updateStateBasedOnObject(context?.selected_location) });
        } else if (context?.selected_location && id) {
            FetchEditData(id);
        }
    }, [id, context?.selected_location]);

    const GetAllPrices = async (option) => {
        const response = await PostApi(API_PATH.getAllPrices, {
            subscription_plan_id: id,
            type: "page",
            sort_by: option.sort,
            is_ascending: option.order,
            offset: option.page + 1,
            limit: option.sizePerPage,
            search_name: option.search
        });
        if (response.statusCode === 200) {
            setPriceData(response.data?.data_result ?? []);
            setPriceOptions({ ...option, totalCount: response.data?.data_count });
        } else {
            setPriceData([]);
            setPriceOptions({ ...option, totalCount: 0 });
        }
    };

    const GetAllPortionSize = async () => {
        const response = await PostApi(API_PATH.getActivePortionSize);
        if (response.statusCode === 200) {
            setPortionSizes(response.data ?? []);
            if (!id) runforms.current.setFieldValue('portion_size_id', response.data[0].portion_size_id);
        }
    };

    const FetchEditData = async (subscription_plan_id) => {
        const response = await PostApi(API_PATH.subscriptionPlansById, { subscription_plan_id });
        if (response.statusCode === 200) {
            let data = response.data;
            set_edit_data(true);

            setInitialValues({
                subscription_plan_id: data.subscription_plan_id,
                plan_nick_name: data.plan_nick_name,
                plan_name: data.plan_name,
                is_active: data.is_active,
                numbers_of_weeks: data.numbers_of_weeks,
                better_days_before_renew: data.better_days_before_renew,
                billing_renew_day: data.billing_renew_day,
                portion_size_id: data.portion_size_id,
                display_order: data.display_order,
                plan_description: data.plan_description,
                portion_description: data.portion_description,
                // prices: data.prices,
                ...updateStateBasedOnObject(context?.selected_location, data),
            });
            set_plan_description(data.plan_description);
            set_portion_description(data.portion_description);

            document.getElementById('is_active').checked = data.is_active == 1;
        }
    };

    const updateStateBasedOnObject = (object, data) => {
        const updatedState = {};
        daysOfWeek.forEach((day) => {
            const isActiveKey = `is_active_on_${day}`;
            const isStartKey = `is_start_on_${day}`;

            if (object[isActiveKey] === 1) {
                updatedState[isStartKey] = data?.[isStartKey] ?? '0';
            }
        });
        return updatedState;
    };

    const handleDelete = async () => {
        const response = await PostApi(API_PATH.deleteSubscriptionPrice, { subscription_price_plan_id: delete_prices.data });
        if (response.statusCode === 200) {
            toast.success('Subscription price deleted successfully');
            set_delete_prices({ data: null, show: false });
            GetAllPrices(priceOptions);
        }
    };

    const tableCallBackPrice = (option) => {
        GetAllPrices(option);
    };

    const tableCallBack = (option) => {
        set_options(option);
    };

    const handleRowClick = (data) => {

    };

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? '1' : '0';
        runforms.current.setFieldValue(e.target.id, value);
        document.getElementById(e.target.id).checked = e.target.checked;
    };

    const handleSubmitForm = () => {
        document.getElementById('subscription-creation-submit').click();
    };

    const handleSubmit = async (formData, actions) => {
        setIsLoading(true);
        let api_path = '';
        let message = '';

        if (edit_data) {
            api_path = API_PATH.updateSubscriptionPlan;
            message = 'Subscription creation updated successfully';
        } else {
            api_path = API_PATH.addSubscriptionPlan;
            message = 'Subscription creation added successfully';
            formData.kitchen_location_id = kitchen_location;
        }

        if (api_path != '') {
            const response = await PostApi(api_path, formData);
            if (response.statusCode === 200) {
                toast.success(message);
                if (edit_data) navigate('/admin/kitchen-settings/subscription-creation');
                else navigate(`/admin/kitchen-settings/edit-subscription-creation/${response.data[0].subscription_plan_id}`);
                set_edit_data(false);
                actions.resetForm();
            }
        }
        setIsLoading(false);
    };

    const handleSubmitDescription = (type) => {
        if (type == 1) {
            runforms.current.setFieldValue('plan_description', plan_description);
            set_plan_description_show(false);
        } else {
            runforms.current.setFieldValue('portion_description', portion_description);
            set_portion_description_show(false);
        }
    };

    const mergeAllArrays = (obj) => {
        return Object.values(obj).reduce((mergedArray, currentArray) => {
            if (Array.isArray(currentArray)) {
                return mergedArray.concat(currentArray);
            }
            return mergedArray;
        }, []);
    }

    const handleSubmitPrices = async (formData) => {
        const allMergedArray = formData.is_custom_meal_category == 1 ? mergeAllArrays(formData.category_wise_meals_per_day) : [];
        let data = {
            ...formData,
            category_wise_meals_per_day: allMergedArray?.map(({ meal_category_id, meals_per_day }) => ({ meal_category_id, meals_per_day })),
            subscription_plan_id: id
        }
        const response = await PostApi(API_PATH.addSubscriptionPrice, data);
        if (response.statusCode === 200) {
            toast.success('Subscription price added successfully');
            set_price_show(false);
            GetAllPrices(priceOptions);
        }
    };

    const handleSubmitUpdatedPrices = async (data) => {
        const allMergedArray = modalNext.prevState === 'categories' ? mergeAllArrays(data.formData.category_wise_meals_per_day) : [];
        let formData = {
            ...data.formData,
            to_which_subscriptions_changes_applied: data.to_which_subscriptions_changes_applied,
            ...(modalNext.prevState === 'categories' && { category_wise_meals_per_day: allMergedArray?.map(({ meal_category_id, meals_per_day }) => ({ meal_category_id, meals_per_day })) }),
        }

        const response = await PostApi(API_PATH.updateSubscriptionPrice, formData);
        if (response.statusCode === 200) {
            toast.success('Subscription price updated successfully');
            setModalNext({ formData: null, show: false, prevState: '', to_which_subscriptions_changes_applied: 'new' });
            GetAllPrices(priceOptions);
        }
    }

    return (
        <React.Fragment>
            <div className="page-content subscription-creation-main">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center">
                            <span
                                className="d-flex align-items-center p-0 me-3 cursor-pointer"
                                onClick={() => navigate('/admin/kitchen-settings/subscription-creation')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data ? 'Edit' : 'Add'} Subscription Creation</h4>
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
                                plan_nick_name: Yup.string().required('Please Enter Plan Nickname'),
                                plan_name: Yup.string().required('Please Enter Plan Name'),
                            })}
                            onSubmit={(values, actions) => {
                                handleSubmit(values, actions);
                            }}
                        >
                            {(runform) => (
                                <form onSubmit={runform.handleSubmit}>
                                    <div className="row align-items-end bg-light py-3 rounded shadow-sm m-2">
                                        <div className="col-md-4 mb-3">
                                            <label>Plan Nickname (Internal)</label>
                                            <div>
                                                <input
                                                    className="form-control"
                                                    name="plan_nick_name"
                                                    type="text"
                                                    placeholder="Enter Plan Nickname"
                                                    {...formAttr(runform, 'plan_nick_name')}
                                                />
                                                {errorContainer(runform, 'plan_nick_name')}
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label>Plan Name (Shown to customers)</label>
                                            <div>
                                                <input
                                                    className="form-control"
                                                    name="plan_name"
                                                    type="text"
                                                    placeholder="Enter Plan Name"
                                                    {...formAttr(runform, 'plan_name')}
                                                />
                                                {errorContainer(runform, 'plan_name')}
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <div className="row align-items-center">
                                                <div className="col-md-6">
                                                    <button
                                                        type="button"
                                                        className="btn btn-success w-100"
                                                        onClick={() => set_plan_description_show(true)}
                                                    >
                                                        Edit Plan Description
                                                    </button>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-check form-switch form-switch-md mb-2">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            name="is_active"
                                                            id="is_active"
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className="form-check-label" htmlFor="is_active">
                                                            Is Active?
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label>Weeks</label>
                                            <div>
                                                <input
                                                    className="form-control"
                                                    name="numbers_of_weeks"
                                                    type="number"
                                                    placeholder="Enter Weeks"
                                                    onChange={(e) => {
                                                        runform.setFieldValue(
                                                            'numbers_of_weeks',
                                                            Number(e.target.value === '' ? 0 : e.target.value).toString()
                                                        );
                                                    }}
                                                    onBlur={runform.handleBlur}
                                                    value={runform.values?.numbers_of_weeks}
                                                />
                                                {errorContainer(runform, 'numbers_of_weeks')}
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label>Buffer Days to Charge Before Renewal</label>
                                            <div>
                                                <input
                                                    className="form-control"
                                                    name="better_days_before_renew"
                                                    type="number"
                                                    placeholder="Enter Buffer Days"
                                                    onChange={(e) => {
                                                        runform.setFieldValue(
                                                            'better_days_before_renew',
                                                            Number(e.target.value === '' ? 0 : e.target.value).toString()
                                                        );
                                                    }}
                                                    onBlur={runform.handleBlur}
                                                    value={runform.values?.better_days_before_renew}
                                                />
                                                {errorContainer(runform, 'better_days_before_renew')}
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label>Billing Renew Day</label>
                                            <div>
                                                <select
                                                    className="form-select"
                                                    name="billing_renew_day"
                                                    onChange={runform.handleChange}
                                                    onBlur={runform.handleBlur}
                                                    value={
                                                        runform.values?.billing_renew_day !== undefined
                                                            ? runform.values?.billing_renew_day.toString()
                                                            : '-1'
                                                    }
                                                >
                                                    <option value="-1">Renew on Client Buy Day</option>
                                                    <option value="6">Sunday</option>
                                                    <option value="0">Monday</option>
                                                    <option value="1">Tuesday</option>
                                                    <option value="2">Wednesday</option>
                                                    <option value="3">Thusrday</option>
                                                    <option value="4">Friday</option>
                                                    <option value="5">Saturday</option>
                                                </select>
                                                {errorContainer(runform, 'billing_renew_day')}
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <label>Portion Size</label>
                                            <div>
                                                <select
                                                    className="form-select"
                                                    name="portion_size_id"
                                                    {...formAttr(runform, 'portion_size_id')}
                                                >
                                                    {portionSizes?.map((item, index) => (
                                                        <option key={index} value={item.portion_size_id}>
                                                            {item.portion_size_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errorContainer(runform, 'portion_size_id')}
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <button
                                                type="button"
                                                className="btn btn-success w-100"
                                                onClick={() => set_portion_description_show(true)}
                                            >
                                                Edit Portion Description
                                            </button>
                                        </div>
                                        <div className="col-md-4">
                                            <label>Sort Display Order</label>
                                            <div>
                                                <input
                                                    className="form-control"
                                                    name="display_order"
                                                    type="number"
                                                    placeholder="Enter Sort Display Order"
                                                    onChange={(e) => {
                                                        runform.setFieldValue(
                                                            'display_order',
                                                            Number(e.target.value === '' ? 0 : e.target.value).toString()
                                                        );
                                                    }}
                                                    onBlur={runform.handleBlur}
                                                    value={runform.values?.display_order}
                                                />
                                                {errorContainer(runform, 'display_order')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mt-3 bg-light py-3 rounded align-items-center shadow-sm m-2">
                                        {runform.values?.is_start_on_monday !== undefined && (
                                            <div className="col-md-6 col-lg-3">
                                                <div>
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_start_on_monday"
                                                            onChange={handleChangeSwitch}
                                                            defaultChecked={runform.values?.is_start_on_monday == 1}
                                                        />
                                                        <label className="form-check-label" htmlFor="is_start_on_monday">
                                                            Start On Monday
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {runform.values?.is_start_on_tuesday !== undefined && (
                                            <div className="col-md-6 col-lg-3">
                                                <div>
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_start_on_tuesday"
                                                            onChange={handleChangeSwitch}
                                                            defaultChecked={runform.values?.is_start_on_tuesday == 1}
                                                        />
                                                        <label className="form-check-label" htmlFor="is_start_on_tuesday">
                                                            Start On Tuesday
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {runform.values?.is_start_on_wednesday !== undefined && (
                                            <div className="col-md-6 col-lg-3">
                                                <div>
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_start_on_wednesday"
                                                            onChange={handleChangeSwitch}
                                                            defaultChecked={runform.values?.is_start_on_wednesday == 1}
                                                        />
                                                        <label className="form-check-label" htmlFor="is_start_on_wednesday">
                                                            Start On Wednesday
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {runform.values?.is_start_on_thursday !== undefined && (
                                            <div className="col-md-6 col-lg-3">
                                                <div>
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_start_on_thursday"
                                                            onChange={handleChangeSwitch}
                                                            defaultChecked={runform.values?.is_start_on_thursday == 1}
                                                        />
                                                        <label className="form-check-label" htmlFor="is_start_on_thursday">
                                                            Start On Thursday
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {runform.values?.is_start_on_friday !== undefined && (
                                            <div className="col-md-6 col-lg-3">
                                                <div>
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_start_on_friday"
                                                            onChange={handleChangeSwitch}
                                                            defaultChecked={runform.values?.is_start_on_friday == 1}
                                                        />
                                                        <label className="form-check-label" htmlFor="is_start_on_friday">
                                                            Start On Friday
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {runform.values?.is_start_on_saturday !== undefined && (
                                            <div className="col-md-6 col-lg-3">
                                                <div>
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_start_on_saturday"
                                                            onChange={handleChangeSwitch}
                                                            defaultChecked={runform.values?.is_start_on_saturday == 1}
                                                        />
                                                        <label className="form-check-label" htmlFor="is_start_on_saturday">
                                                            Start On Saturday
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {runform.values?.is_start_on_sunday !== undefined && (
                                            <div className="col-md-6 col-lg-3">
                                                <div>
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_start_on_sunday"
                                                            onChange={handleChangeSwitch}
                                                            defaultChecked={runform.values?.is_start_on_sunday == 1}
                                                        />
                                                        <label className="form-check-label" htmlFor="is_start_on_sunday">
                                                            Start On Sunday
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {edit_data && (
                                        <>
                                            <div className="mt-4 d-flex align-items-center justify-content-between mx-2">
                                                <h5 className="mb-0">Prices</h5>
                                                <button type="button" className="btn btn-success" onClick={() => set_price_show(true)}>
                                                    Add New Prices
                                                </button>
                                            </div>
                                            <div className="row bg-light py-3 rounded align-items-center shadow-sm m-2">
                                                <DataTable
                                                    data={priceData}
                                                    options={priceOptions}
                                                    tableCallBack={tableCallBackPrice}
                                                    columns={columnsPrices}
                                                />
                                            </div>
                                            <div className="mt-4 d-flex align-items-center justify-content-between mx-2">
                                                <h5 className="mb-0">Current Subscription</h5>
                                            </div>
                                            <div className="row bg-light py-3 rounded align-items-center shadow-sm m-2">
                                                <DataTable
                                                    data={currentSubscription}
                                                    options={options}
                                                    tableCallBack={tableCallBack}
                                                    columns={columns}
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="d-none">
                                        <button type="submit" id="subscription-creation-submit">
                                            save
                                        </button>
                                    </div>
                                </form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>

            {
                (plan_description_show || portion_description_show || price_show || categories.show || delivery_meals.show || price_edit.show || no_of_surcharge_meals_per_day.show || delete_prices.show || modalNext.show) &&
                <SubscriptionCreationModals
                    states={{
                        plan_description,
                        portion_description,
                        price_show,
                        plan_description_show,
                        portion_description_show,
                        categories,
                        delivery_meals,
                        price_edit,
                        no_of_surcharge_meals_per_day,
                        runforms,
                        delete_prices,
                        modalNext,
                        setModalNext,
                        set_delete_prices,
                        set_plan_description,
                        set_portion_description,
                        set_price_show,
                        set_plan_description_show,
                        set_portion_description_show,
                        set_categories,
                        set_delivery_meals,
                        set_price_edit,
                        set_no_of_surcharge_meals_per_day,
                    }}
                    functions={{
                        handleSubmitDescription,
                        handleSubmitPrices,
                        handleSubmitUpdatedPrices,
                        handleDelete
                    }}
                />
            }
        </React.Fragment>
    );
}
