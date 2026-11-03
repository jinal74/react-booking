import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import { Modal } from 'reactstrap';
import { errorContainer, formAttr } from '../../../../helpers/func_helper';
import 'react-quill/dist/quill.snow.css';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { PostApi } from '../../../../services/ApiService';
import { API_PATH, daysOfWeek } from '../../../constants/const';
import { IconLoader } from '../../../Loader/IconLoader';

export default function SubscriptionCreationModals({ states, functions }) {
    const toolbar = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        // [{ indent: '-1' }, { indent: '+1' }],
        // [{ direction: 'rtl' }],
        ['link', 'image'],
        // [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        // [{ font: [] }],
        // [{ align: [] }],
        ['clean'],
    ];
    const runforms = useRef();

    const [totalMealsPerDay, setTotalMealsPerDay] = useState(0);
    const [initialFlag, setInitialFlag] = useState(true);
    const [totalDayPerWeek, setTotalDayPerWeek] = useState(0);
    const [displayError, setDisplayError] = useState({
        days_per_week: false,
        meals_per_day: false
    });
    const [initialValues, setInitialValues] = useState({
        days_per_week: '',
        meals_per_day: '',
        price: '',
        is_custom_meal_category: 1,
        del_for_days_on_sunday: "0",
        del_for_days_on_monday: "0",
        del_for_days_on_tuesday: "0",
        del_for_days_on_wednesday: "0",
        del_for_days_on_thursday: "0",
        del_for_days_on_friday: "0",
        del_for_days_on_saturday: "0",
        no_of_surcharge_meals_per_day: "0",
        category_wise_meals_per_day: null
    });

    useEffect(() => {
        if (states.price_show || states.categories.show) {
            setInitialFlag(true);
            GetMealCategories();
        }
    }, [states.price_show, states.categories.show]);

    useEffect(() => {
        if (states.price_show || states.delivery_meals.show || states.categories.show) {
            setDisplayError({
                days_per_week: (runforms.current?.values?.days_per_week < totalDayPerWeek || runforms.current?.values?.days_per_week > totalDayPerWeek) ? true : false,
                meals_per_day: (runforms.current?.values?.meals_per_day < totalMealsPerDay || runforms.current?.values?.meals_per_day > totalMealsPerDay) ? true : false,
            });
        }
    }, [runforms.current?.values, totalMealsPerDay, totalDayPerWeek, states.price_show, states.categories, states.delivery_meals, initialFlag]);

    useEffect(() => {
        if (states.delivery_meals.show) {
            let days = daysOfWeek;
            setTotalDayPerWeek(days?.reduce((acc, item) => acc + Number(states.delivery_meals?.data?.[`del_for_days_on_${item}`]), 0));
        } else if (states.categories.show && initialValues?.category_wise_meals_per_day && initialFlag) {
            let data = { ...states.categories.data, category_wise_meals_per_day: initialValues?.category_wise_meals_per_day }
            let meals_by_category = states.categories?.data?.meals_by_category?.split(',');
            meals_by_category.forEach(item => {
                const [value, name] = item.split('X');
                for (const category in data?.category_wise_meals_per_day) {
                    const matchingItem = data?.category_wise_meals_per_day[category].find(entry => entry.meal_category_name === name);
                    if (matchingItem) {
                        matchingItem.meals_per_day = value;
                        break;
                    }
                }
            });
            runforms.current?.setValues(data);
            setTotalMealsPerDay(Object.values(data?.category_wise_meals_per_day)?.flat()?.reduce((sum, item) => sum + (parseInt(item.meals_per_day)), 0));
            setInitialFlag(false);
        }
    }, [states.delivery_meals, states.categories, initialValues]);

    const GetMealCategories = async () => {
        const response = await PostApi(API_PATH.getMealCategories, { type: 'all' });
        if (response.statusCode === 200) {
            const result = response.data.data_result?.reduce((acc, obj) => {
                const key = obj.meal_category_group_name;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push({ ...obj, ...(states.price_show && { meals_per_day: 0 }) });
                return acc;
            }, {});
            setInitialValues(prevState => ({ ...prevState, category_wise_meals_per_day: result }));
            runforms.current?.setFieldValue('category_wise_meals_per_day', result);
        }
    };

    const handleChangeEditor = (value, type) => {
        if (type == 1) {
            states.set_plan_description(value);
        } else {
            states.set_portion_description(value);
        }
    };

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? '1' : '0';
        runforms.current.setFieldValue(e.target.id, value);
        document.getElementById(e.target.id).checked = e.target.checked;

        if (e.target.id === 'is_custom_meal_category' && value == 0) setDisplayError(prevState => ({ ...prevState, meals_per_day: false }));
    };

    const handleMealsChange = (e, value, item, index, type) => {
        let temp_data = { ...(runforms.current?.values?.category_wise_meals_per_day ?? {}) };
        let temp_arr = temp_data[type];
        let temp_obj = { ...item };
        temp_obj[e.target.name] = value;
        temp_arr.splice(index, 1, temp_obj);
        temp_data[type] = temp_arr;
        runforms.current?.setFieldValue('category_wise_meals_per_day', temp_data);
        setTotalMealsPerDay(Object.values(temp_data)?.flat()?.reduce((sum, item) => sum + (parseInt(item.meals_per_day) || 0), 0));
    }

    const handleChangeDaysPerWeek = (value, name) => {
        let days = daysOfWeek;
        let temp_data = { ...(runforms.current?.values ?? {}) };
        temp_data[name] = value;
        runforms.current?.setFieldValue(name, value);
        setTotalDayPerWeek(days?.reduce((acc, item) => acc + Number(temp_data?.[`del_for_days_on_${item}`]), 0));
    }

    return (
        <>
            {/* Plan Description Modal */}

            <Modal isOpen={states.plan_description_show} centered>
                <div className="modal-header">
                    <h5 className="modal-title mt-0 fw-bold">ADD PLAN DESCRIPTION</h5>
                    <button
                        type="button"
                        onClick={() => {
                            states.set_plan_description_show(false);
                        }}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <p>This description will show on the Subscription creation page</p>
                    <div className="modal-description">
                        <ReactQuill
                            theme="snow"
                            value={states.plan_description}
                            onChange={(value) => handleChangeEditor(value, 1)}
                            modules={{
                                toolbar: toolbar,
                            }}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <div className="ms-auto">
                        <button
                            type="button"
                            className="btn btn-white border-light"
                            onClick={() => {
                                states.set_plan_description_show(false);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                    <div className="">
                        <button type="submit" className="btn btn-success" onClick={() => functions.handleSubmitDescription(1)}>
                            Submit
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Portion Description Modal */}

            <Modal isOpen={states.portion_description_show} centered>
                <div className="modal-header">
                    <h5 className="modal-title mt-0 fw-bold">ADD PORTION DESCRIPTION</h5>
                    <button
                        type="button"
                        onClick={() => {
                            states.set_portion_description_show(false);
                        }}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <p>This description will show on the Subscription creation page</p>
                    <ReactQuill
                        theme="snow"
                        value={states.portion_description}
                        onChange={(value) => handleChangeEditor(value, 2)}
                        modules={{
                            toolbar: toolbar,
                        }}
                    />
                </div>
                <div className="modal-footer">
                    <div className="ms-auto">
                        <button
                            type="button"
                            className="btn btn-white border-light"
                            onClick={() => {
                                states.set_portion_description_show(false);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                    <div className="">
                        <button type="submit" className="btn btn-success" onClick={() => functions.handleSubmitDescription(2)}>
                            Submit
                        </button>
                    </div>
                </div>
            </Modal>

            {/* New Prices Modal */}

            <Modal isOpen={states.price_show} centered className="modal-lg subscription-mdl">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">ADD PRICE PLAN</h5>
                    <button
                        type="button"
                        onClick={() => {
                            states.set_price_show(false);
                        }}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body p-0">
                    <Formik
                        innerRef={runforms}
                        initialValues={initialValues}
                        validationSchema={Yup.object({
                            days_per_week: Yup.string().required('Please Enter Days Per Week'),
                            meals_per_day: Yup.string().required('Please Enter Meals Per Day'),
                            price: Yup.string().required('Please Enter Price'),
                        })}
                        onSubmit={(values, actions) => {
                            functions.handleSubmitPrices(values, actions);
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row px-3 pt-3">
                                    <div className="col-md-4 mb-3">
                                        <label>Days Per Week</label>
                                        <div>
                                            <input
                                                className="form-control"
                                                name="days_per_week"
                                                type="number"
                                                placeholder="Enter Days Per Week"
                                                {...formAttr(runform, 'days_per_week')}
                                            />
                                            {errorContainer(runform, 'days_per_week')}
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label>Meals Per Day</label>
                                        <div>
                                            <input
                                                className="form-control"
                                                name="meals_per_day"
                                                type="number"
                                                placeholder="Enter Meals Per Day"
                                                {...formAttr(runform, 'meals_per_day')}
                                            />
                                            {errorContainer(runform, 'meals_per_day')}
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label>Price</label>
                                        <div className='d-flex align-items-center border rounded overflow-hidden'>
                                            <div className='px-3 me-1 py-2 border-end bg-light'>$</div>
                                            <input
                                                className="form-control border-0"
                                                name="price"
                                                type="number"
                                                placeholder="Enter Price"
                                                {...formAttr(runform, 'price')}
                                            />
                                        </div>
                                        {errorContainer(runform, 'price')}
                                    </div>
                                </div>
                                {
                                    (runform.values?.days_per_week !== "" && runform.values?.meals_per_day !== "" && runform.values?.price !== "") &&
                                    <div className='px-3'>
                                        <div>
                                            <h6 className='bg-light d-block rounded ps-2 py-2 my-3'>In which days you deliver the subscriptions?</h6>
                                            <p className="mb-0 fw-light">
                                                Enter the amount of days worth of food that is delivered on each delivery date.
                                                <bdi className='fw-normal ms-1'>Watch this video to learn more!</bdi>
                                            </p>
                                            <span className={`pt-2 ${displayError?.days_per_week ? 'text-danger' : ''}`}>{totalDayPerWeek} of {runform.values?.days_per_week}</span>
                                            {
                                                displayError?.days_per_week &&
                                                <p className='text-danger'>
                                                    You've selected a total of ({runform.values?.days_per_week}) delivery dates which exceeds the plan settings of ({totalDayPerWeek}). You need to enter the amount of days of deliveries made on each day.
                                                </p>
                                            }
                                            <div className="row mt-2">
                                                {states.runforms.current?.values?.is_start_on_monday !== undefined && (
                                                    <div className="col-md-4 mb-2">
                                                        <label>Monday</label>
                                                        <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                            <input
                                                                className="form-control border-0"
                                                                name="del_for_days_on_monday"
                                                                type="number"
                                                                onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                                value={runform.values?.del_for_days_on_monday}
                                                            />
                                                            <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                        </div>
                                                    </div>
                                                )}
                                                {states.runforms.current?.values?.is_start_on_tuesday !== undefined && (
                                                    <div className="col-md-4 mb-2">
                                                        <label>Tuesday</label>
                                                        <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                            <input
                                                                className="form-control border-0"
                                                                name="del_for_days_on_tuesday"
                                                                type="number"
                                                                onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                                value={runform.values?.del_for_days_on_tuesday}
                                                            />
                                                            <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                        </div>
                                                    </div>
                                                )}
                                                {states.runforms.current?.values?.is_start_on_wednesday !== undefined && (
                                                    <div className="col-md-4 mb-2">
                                                        <label>Wednesday</label>
                                                        <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                            <input
                                                                className="form-control border-0"
                                                                name="del_for_days_on_wednesday"
                                                                type="number"
                                                                onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                                value={runform.values?.del_for_days_on_wednesday}
                                                            />
                                                            <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                        </div>
                                                    </div>
                                                )}
                                                {states.runforms.current?.values?.is_start_on_thursday !== undefined && (
                                                    <div className="col-md-4 mb-2">
                                                        <label>Thursday</label>
                                                        <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                            <input
                                                                className="form-control border-0"
                                                                name="del_for_days_on_thursday"
                                                                type="number"
                                                                onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                                value={runform.values?.del_for_days_on_thursday}
                                                            />
                                                            <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                        </div>
                                                    </div>
                                                )}
                                                {states.runforms.current?.values?.is_start_on_friday !== undefined && (
                                                    <div className="col-md-4 mb-2">
                                                        <label>Friday</label>
                                                        <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                            <input
                                                                className="form-control border-0"
                                                                name="del_for_days_on_friday"
                                                                type="number"
                                                                onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                                value={runform.values?.del_for_days_on_friday}
                                                            />
                                                            <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                        </div>
                                                    </div>
                                                )}
                                                {states.runforms.current?.values?.is_start_on_saturday !== undefined && (
                                                    <div className="col-md-4 mb-2">
                                                        <label>Saturday</label>
                                                        <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                            <input
                                                                className="form-control border-0"
                                                                name="del_for_days_on_saturday"
                                                                type="number"
                                                                onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                                value={runform.values?.del_for_days_on_saturday}
                                                            />
                                                            <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                        </div>
                                                    </div>
                                                )}
                                                {states.runforms.current?.values?.is_start_on_sunday !== undefined && (
                                                    <div className="col-md-4 mb-2">
                                                        <label>Sunday</label>
                                                        <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                            <input
                                                                className="form-control border-0"
                                                                name="del_for_days_on_sunday"
                                                                type="number"
                                                                onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                                value={runform.values?.del_for_days_on_sunday}
                                                            />
                                                            <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className='bg-light d-flex align-items-center justify-content-between rounded ps-2 py-2 my-3'>
                                                <h6 className='mb-0'>Customize meal categories for this plan</h6>
                                                <div className="form-check form-switch form-switch-md">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        onChange={handleChangeSwitch}
                                                        id="is_custom_meal_category"
                                                        defaultChecked={runform.values?.is_custom_meal_category == 1}
                                                    />
                                                </div>
                                            </div>
                                            {
                                                runform.values?.is_custom_meal_category == 1 &&
                                                <>
                                                    <p className="mb-0 fw-light">
                                                        Select the meal category delivered per day. For example, this plan includes 1 breakfast 2 entree per day.
                                                    </p>
                                                    <span className={`pt-2 ${displayError?.meals_per_day ? 'text-danger' : ''}`}>{totalMealsPerDay} of {runform.values?.meals_per_day}</span>
                                                    {
                                                        displayError?.meals_per_day &&
                                                        <p className='text-danger'>
                                                            You've selected a total of ({runform.values?.meals_per_day}) meals per day, which exceeds the plan settings of ({totalMealsPerDay}). You need to enter the amount of meals made on each day.
                                                        </p>
                                                    }
                                                    <div className="row mt-2">
                                                        {runform.values?.category_wise_meals_per_day && (
                                                            Object.keys(runform.values?.category_wise_meals_per_day)?.map((name, index) => (
                                                                <React.Fragment key={index}>
                                                                    <span className="fw-bold my-2 font-size-15">{name}</span>
                                                                    {runform.values?.category_wise_meals_per_day[name]?.map((item, i) => (
                                                                        <div className="col-md-4 mb-2" key={item.meal_category_id}>
                                                                            <label>{item.meal_category_name}</label>
                                                                            <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                                                <input
                                                                                    className="form-control border-0"
                                                                                    name='meals_per_day'
                                                                                    type="number"
                                                                                    value={item.meals_per_day}
                                                                                    onChange={(e) => handleMealsChange(e, (Number(e.target.value === '' ? 0 : e.target.value).toString()), item, i, name)}
                                                                                />
                                                                                <div className='px-2 py-2 border-end bg-light d-flex'>Meals/Day</div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </React.Fragment>
                                                            ))
                                                        )}
                                                    </div>
                                                </>
                                            }
                                        </div>
                                        <div>
                                            <h6 className='bg-light d-block rounded ps-2 py-2 my-3'>How many surcharge meals are included?</h6>
                                            <div className="row mt-2">
                                                <div className="col-md-4 mb-3">
                                                    <label>Included Surcharge Meals</label>
                                                    <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                        <input
                                                            className="form-control border-0"
                                                            name="no_of_surcharge_meals_per_day"
                                                            type="number"
                                                            {...formAttr(runform, 'no_of_surcharge_meals_per_day')}
                                                        />
                                                        <div className='px-2 py-2 border-end bg-light d-flex'>Meals/Day</div>
                                                    </div>
                                                    {errorContainer(runform, 'no_of_surcharge_meals_per_day')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                                <div className="modal-footer upld-mls-btn p-0 overflow-hidden">
                                    <button
                                        type="button"
                                        className="col-6 border-end"
                                        onClick={() => {
                                            states.set_price_show(false);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`col-6 ${(displayError?.meals_per_day || displayError?.days_per_week) ? 'grey-bg-cls cursor-not-allowed' : ''}`}
                                        disabled={(displayError?.meals_per_day || displayError?.days_per_week)}
                                    >
                                        {runform.isSubmitting ? <IconLoader /> : 'Save'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Modal >

            {/* Price Edit Modal */}

            <Modal isOpen={states.price_edit.show} centered className="modal subscription-mdl" >
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Edit Price</h5>
                    <button
                        type="button"
                        onClick={() => {
                            states.set_price_edit({ data: null, show: false });
                            states.setModalNext({ formData: null, show: false, prevState: '', to_which_subscriptions_changes_applied: 'new' });
                        }}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body p-0">
                    <div className="text-center pt-2">
                        <p className="mb-1 fw-bold">{states.price_edit?.data?.days_per_week} days per week</p>
                        <p className="mb-2 fw-bold">{states.price_edit?.data?.meals_per_day} meals per day</p>
                    </div>
                    <Formik
                        initialValues={states.price_edit?.data}
                        validationSchema={Yup.object({
                            price: Yup.string().required('Please Enter Price'),
                        })}
                        onSubmit={(values) => {
                            states?.set_price_edit({ data: null, show: false });
                            states.setModalNext(prevState => ({ ...prevState, formData: values, prevState: 'price_edit', show: true }));
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row px-3">
                                    <div className="col-md-12 mb-3">
                                        <label>price</label>
                                        <div className='d-flex align-items-center border rounded overflow-hidden'>
                                            <div className='px-3 me-1 py-2 border-end bg-light'>$</div>
                                            <input
                                                className="form-control border-0"
                                                name="price"
                                                type="number"
                                                placeholder="Enter Price"
                                                {...formAttr(runform, 'price')}
                                            />
                                        </div>
                                        {errorContainer(runform, 'price')}
                                    </div>
                                </div>

                                <div className='modal-footer upld-mls-btn p-0 overflow-hidden'>
                                    <button type='button' className='col-6 border-end' onClick={() => {
                                        states.set_price_edit({ data: null, show: false });
                                        states.setModalNext({ formData: null, show: false, prevState: '', to_which_subscriptions_changes_applied: 'new' });
                                    }}>
                                        Cancel
                                    </button>
                                    <button type='submit' className='col-6'>
                                        Next
                                    </button>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Modal>

            {/* Delivery Meals Modal */}

            <Modal isOpen={states.delivery_meals.show} centered className="modal subscription-mdl" >
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Edit Delivery Meals</h5>
                    <button
                        type="button"
                        onClick={() => {
                            states.set_delivery_meals({ data: null, show: false });
                            states.setModalNext({ formData: null, show: false, prevState: '', to_which_subscriptions_changes_applied: 'new' });
                        }}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body p-0">
                    <div className="text-center pt-2">
                        <p className="mb-1 fw-bold">{states.delivery_meals?.data?.days_per_week} days per week</p>
                        <p className="mb-2 fw-bold">{states.delivery_meals?.data?.meals_per_day} meals per day</p>
                    </div>
                    <h6 className='bg-light d-block rounded ps-2 py-2 m-3'>In which days you deliver the subscriptions?</h6>
                    <p className="mb-0 fw-light px-3">
                        Enter the amount of days worth of food that is delivered on each delivery date.
                        <bdi className='fw-normal ms-1'>Watch this video to learn more!</bdi>
                    </p>
                    <Formik
                        innerRef={runforms}
                        enableReinitialize
                        initialValues={states.delivery_meals.data}
                        onSubmit={(values, actions) => {
                            states?.set_delivery_meals({ data: null, show: false });
                            states.setModalNext(prevState => ({ ...prevState, formData: values, prevState: 'delivery_meals', show: true }));
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="px-3">
                                    <span className={`pt-2 ${displayError?.days_per_week ? 'text-danger' : ''}`}>{totalDayPerWeek} of {runform.values?.days_per_week}</span>
                                    {
                                        displayError?.days_per_week &&
                                        <p className='text-danger'>
                                            You've selected a total of ({runform.values?.days_per_week}) delivery dates which exceeds the plan settings of ({totalDayPerWeek}). You need to enter the amount of days of deliveries made on each day.
                                        </p>
                                    }
                                    <div className="row mt-2">
                                        {states.runforms.current?.values?.is_start_on_monday !== undefined && (
                                            <div className="col-md-4 mb-2">
                                                <label>Monday</label>
                                                <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                    <input
                                                        className="form-control border-0"
                                                        name="del_for_days_on_monday"
                                                        type="number"
                                                        onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                        value={runform.values?.del_for_days_on_monday}
                                                    />
                                                    <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                </div>
                                            </div>
                                        )}
                                        {states.runforms.current?.values?.is_start_on_tuesday !== undefined && (
                                            <div className="col-md-4 mb-2">
                                                <label>Tuesday</label>
                                                <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                    <input
                                                        className="form-control border-0"
                                                        name="del_for_days_on_tuesday"
                                                        type="number"
                                                        onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                        value={runform.values?.del_for_days_on_tuesday}
                                                    />
                                                    <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                </div>
                                            </div>
                                        )}
                                        {states.runforms.current?.values?.is_start_on_wednesday !== undefined && (
                                            <div className="col-md-4 mb-2">
                                                <label>Wednesday</label>
                                                <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                    <input
                                                        className="form-control border-0"
                                                        name="del_for_days_on_wednesday"
                                                        type="number"
                                                        onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                        value={runform.values?.del_for_days_on_wednesday}
                                                    />
                                                    <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                </div>
                                            </div>
                                        )}
                                        {states.runforms.current?.values?.is_start_on_thursday !== undefined && (
                                            <div className="col-md-4 mb-2">
                                                <label>Thursday</label>
                                                <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                    <input
                                                        className="form-control border-0"
                                                        name="del_for_days_on_thursday"
                                                        type="number"
                                                        onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                        value={runform.values?.del_for_days_on_thursday}
                                                    />
                                                    <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                </div>
                                            </div>
                                        )}
                                        {states.runforms.current?.values?.is_start_on_friday !== undefined && (
                                            <div className="col-md-4 mb-2">
                                                <label>Friday</label>
                                                <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                    <input
                                                        className="form-control border-0"
                                                        name="del_for_days_on_friday"
                                                        type="number"
                                                        onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                        value={runform.values?.del_for_days_on_friday}
                                                    />
                                                    <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                </div>
                                            </div>
                                        )}
                                        {states.runforms.current?.values?.is_start_on_saturday !== undefined && (
                                            <div className="col-md-4 mb-2">
                                                <label>Saturday</label>
                                                <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                    <input
                                                        className="form-control border-0"
                                                        name="del_for_days_on_saturday"
                                                        type="number"
                                                        onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                        value={runform.values?.del_for_days_on_saturday}
                                                    />
                                                    <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                </div>
                                            </div>
                                        )}
                                        {states.runforms.current?.values?.is_start_on_sunday !== undefined && (
                                            <div className="col-md-4 mb-2">
                                                <label>Sunday</label>
                                                <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                    <input
                                                        className="form-control border-0"
                                                        name="del_for_days_on_sunday"
                                                        type="number"
                                                        onChange={(e) => handleChangeDaysPerWeek((Number(e.target.value === '' ? 0 : e.target.value).toString()), e.target.name)}
                                                        value={runform.values?.del_for_days_on_sunday}
                                                    />
                                                    <div className='px-1 py-2 border-end bg-light d-flex'>× <span className='px-1'>{runform?.values?.meals_per_day}</span> <span>Meals</span></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className='modal-footer upld-mls-btn p-0 overflow-hidden'>
                                    <button type='button' className='col-6 border-end' onClick={() => {
                                        states.set_delivery_meals({ data: null, show: false });
                                        states.setModalNext({ formData: null, show: false, prevState: '', to_which_subscriptions_changes_applied: 'new' });
                                    }}>
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        className={`col-6 ${displayError?.days_per_week ? 'grey-bg-cls cursor-not-allowed' : ''}`}
                                        disabled={displayError?.days_per_week}
                                    >
                                        Next
                                    </button>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Modal>

            {/* Categories Modal */}

            <Modal isOpen={states.categories.show} centered className="modal modal-md subscription-mdl" >
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Edit Categories</h5>
                    <button
                        type="button"
                        onClick={() => {
                            states.set_categories({ data: null, show: false });
                            states.setModalNext({ formData: null, show: false, prevState: '', to_which_subscriptions_changes_applied: 'new' });
                        }}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body p-0">
                    <div className="text-center pt-2">
                        <p className="mb-1 fw-bold">{states.categories?.data?.days_per_week} days per week</p>
                        <p className="mb-2 fw-bold">{states.categories?.data?.meals_per_day} meals per day</p>
                    </div>
                    <h6 className='px-3'>Custimize meal categories for this plan</h6>
                    <p className="mb-0 fw-light px-3">
                        Select the meal category delivered per day. For example, this plan includes 1 breakfast and 2 entrees per
                        day.
                    </p>
                    <Formik
                        innerRef={runforms}
                        enableReinitialize
                        initialValues={initialValues}
                        onSubmit={(values, actions) => {
                            states?.set_categories({ data: null, show: false });
                            states.setModalNext(prevState => ({ ...prevState, formData: values, prevState: 'categories', show: true }));
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className='px-3'>
                                    <span className={`pt-2 ${displayError?.meals_per_day ? 'text-danger' : ''}`}>{totalMealsPerDay} of {runform.values?.meals_per_day}</span>
                                    {
                                        displayError?.meals_per_day &&
                                        <p className='text-danger'>
                                            You've selected a total of ({runform.values?.meals_per_day}) meals per day, which exceeds the plan settings of ({totalMealsPerDay}). You need to enter the amount of meals made on each day.
                                        </p>
                                    }
                                    <div className="row mt-2">
                                        {runform.values?.category_wise_meals_per_day && (
                                            Object.keys(runform.values?.category_wise_meals_per_day)?.map((name, index) => (
                                                <React.Fragment key={index}>
                                                    <span className="fw-bold my-2 font-size-15">{name}</span>
                                                    {runform.values?.category_wise_meals_per_day[name]?.map((item, i) => (
                                                        <div className="col-md-4 mb-2" key={item.meal_category_id}>
                                                            <label>{item.meal_category_name}</label>
                                                            <div className='d-flex align-items-center border rounded overflow-hidden'>
                                                                <input
                                                                    className="form-control border-0"
                                                                    name='meals_per_day'
                                                                    type="number"
                                                                    value={item.meals_per_day}
                                                                    onChange={(e) => handleMealsChange(e, (Number(e.target.value === '' ? 0 : e.target.value).toString()), item, i, name)}
                                                                />
                                                                <div className='px-2 py-2 border-end bg-light d-flex'>Meals/Day</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </React.Fragment>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className='modal-footer upld-mls-btn p-0 overflow-hidden'>
                                    <button type='button' className='col-6 border-end' onClick={() => {
                                        states.set_categories({ data: null, show: false });
                                        states.setModalNext({ formData: null, show: false, prevState: '', to_which_subscriptions_changes_applied: 'new' });
                                    }}>
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        className={`col-6 ${displayError?.meals_per_day ? 'grey-bg-cls cursor-not-allowed' : ''}`}
                                        disabled={displayError?.meals_per_day}
                                    >
                                        Next
                                    </button>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Modal>

            {/* surcharge meals edit */}

            <Modal isOpen={states.no_of_surcharge_meals_per_day.show} centered className="modal subscription-mdl" >
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Edit Included Surcharge Meals</h5>
                    <button
                        type="button"
                        onClick={() => {
                            states.set_no_of_surcharge_meals_per_day({ data: null, show: false });
                            states.setModalNext({ formData: null, show: false, prevState: '', to_which_subscriptions_changes_applied: 'new' });
                        }}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="text-center">
                    <p className="my-1 fw-bold">{states.no_of_surcharge_meals_per_day?.data?.days_per_week} days per week</p>
                    <p className="mb-0 fw-bold">{states.no_of_surcharge_meals_per_day?.data?.meals_per_day} meals per day</p>
                </div>
                <div className="modal-body p-0">
                    <Formik
                        enableReinitialize
                        initialValues={states.no_of_surcharge_meals_per_day.data}
                        onSubmit={(values, actions) => {
                            states?.set_no_of_surcharge_meals_per_day({ data: null, show: false });
                            states.setModalNext(prevState => ({ ...prevState, formData: values, prevState: 'no_of_surcharge_meals_per_day', show: true }));
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row px-3">
                                    <div className="col-md-12 mb-3">
                                        <label>Included Surcharge Meals</label>
                                        <div>
                                            <input
                                                className="form-control"
                                                name="no_of_surcharge_meals_per_day"
                                                type="number"
                                                placeholder="Enter Included Surcharge Meals"
                                                {...formAttr(runform, 'no_of_surcharge_meals_per_day')}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='modal-footer upld-mls-btn p-0 overflow-hidden'>
                                    <button type='button' className='col-6 border-end' onClick={() => {
                                        states.set_no_of_surcharge_meals_per_day({ data: null, show: false });
                                        states.setModalNext({ formData: null, show: false, prevState: '', to_which_subscriptions_changes_applied: 'new' });
                                    }}>
                                        Cancel
                                    </button>
                                    <button type='submit' className='col-6'>
                                        Next
                                    </button>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Modal>

            {/* Next Modal */}

            <Modal isOpen={states.modalNext.show} centered className="modal" >
                <div className="modal-header">
                    <h5 className="modal-title mt-0 mx-auto">SELECT WHICH SUBSCRIPTIONS <br />THESE CHANGES WILL APPLY TO</h5>
                </div>
                <div className="modal-body p-0">
                    <div className='p-3'>
                        <div className="form-check mb-2">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="to_which_subscriptions_changes_applied"
                                id="new"
                                defaultChecked={states.modalNext.to_which_subscriptions_changes_applied === 'new'}
                                onClick={() => { states.setModalNext(prevState => ({ ...prevState, to_which_subscriptions_changes_applied: 'new' })); }}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="new"
                            >
                                New subscriptions only
                            </label>
                        </div>
                        <div className="form-check mb-2">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="to_which_subscriptions_changes_applied"
                                id="new_and_active_when_renew"
                                defaultChecked={states.modalNext.to_which_subscriptions_changes_applied === 'new_and_active_when_renew'}
                                onClick={() => states.setModalNext(prevState => ({ ...prevState, to_which_subscriptions_changes_applied: 'new_and_active_when_renew' }))}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="new_and_active_when_renew"
                            >
                                New subscriptions and when active subscriptions renew
                            </label>
                        </div>
                        {
                            states.modalNext?.prevState === "categories" &&
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="to_which_subscriptions_changes_applied"
                                    id="all_new_and_active"
                                    defaultChecked={states.modalNext.to_which_subscriptions_changes_applied === 'all_new_and_active'}
                                    onClick={() => states.setModalNext(prevState => ({ ...prevState, to_which_subscriptions_changes_applied: 'all_new_and_active' }))}
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor="all_new_and_active"
                                >
                                    All new subscriptions and active subscriptions
                                </label>
                            </div>
                        }
                    </div>
                </div>
                <div className='modal-footer upld-mls-btn p-0 overflow-hidden'>
                    <button type='button' className='col-6 border-end' onClick={() => {
                        states?.[`set_${states.modalNext.prevState}`]({ data: states.modalNext.formData, show: true });
                        states.setModalNext(prevState => ({ ...prevState, formData: null, show: false, prevState: '' }));
                    }}>
                        Back
                    </button>
                    <button type='submit' className='col-6' onClick={() => {
                        functions.handleSubmitUpdatedPrices(states.modalNext);
                    }}>
                        Save
                    </button>
                </div>
            </Modal>

            {/* Delete Modal */}

            <Modal isOpen={states.delete_prices.show} centered className="modal modal-sm">
                <div className="modal-header pb-0 border-0 justify-content-center">
                    <h4 className="modal-title mt-0">Are you sure?</h4>
                </div>
                <div className="modal-body pb-0">
                    <p className='text-center'>Do you want to delete this item?</p>
                </div>
                <div className="modal-footer justify-content-center">
                    <button type="button" className="btn btn-secondary" onClick={() => { states.set_delete_prices({ data: null, show: false }); }} >
                        Cancel
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => { functions.handleDelete(); }}>
                        Delete
                    </button>
                </div>
            </Modal>
        </>
    );
}
