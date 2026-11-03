import React, { useContext, useEffect, useState } from 'react';
import UserMenu from '.';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { formAttr } from '../../../helpers/func_helper';
import { PostApi } from '../../../services/ApiService';
import { API_PATH } from '../../../admin/constants/const';
import MealDetailsModal from '../../../pages/ModalsCommon/MealDetailsModal';
import { Context } from '../../../context/GeneralContext';
import { Link } from 'react-router-dom';

export default function Subscriptions() {
    const context = useContext(Context);
    const [openRequestDeliveryPopup, setOpenRequestDeliveryPopup] = useState(false);
    const [openModalByUnit, setOpenModalByUnit] = useState({ show: false, id: '' });
    const [selectDateForDay, setSelectDateForDay] = useState(false);
    const [upcomingOrder, setUpcomingOrder] = useState(false);
    const [states, setStates] = useState([]);
    const [datesArray, setDatesArray] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [initialValues, setInitialValues] = useState({
        address1: '',
        address2: '',
        city: '',
        state: '',
        state_name: '',
        zipcode: '',
        phone: '',
        gatecode: '',
        note: '',
        save: 0,
    });

    useEffect(() => {
        GetAllStates();
        setDatesArray(context.subscriptionDatesArray);
    }, [context.subscriptionDatesArray]);

    const GetAllStates = async () => {
        const response = await PostApi(API_PATH.getallDeliveryStates, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            setStates(response.data.data_result ?? []);
        }
    };

    const handleSubmitAddress = (values) => {
        console.log(values);
    };

    const handleChangeDate = (item) => {
        setSelectedDate(item);
    };

    return (
        <UserMenu>
            <div className="row stats_page responsive-container-admin">
                <div className="row mt-4 spacer_bottom h-auto">
                    <div className="col-12 mt-3">
                        <div className="clean-alert alert--warning">
                            <i className="fas fa-exclamation-triangle text-warning me-2 font-size-18"></i>
                            <span className="fw-bold font-size-18">Warning</span>
                            <div className="d-flex justify-content-between align-items-center">
                                <p className="mb-0">You still have 2 meals to select for your upcoming delivery on Apr 10, 2024</p>
                                <Link to="/meals" className="btn new_button_square_big back_warning mt-2 text-right">Select meals</Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12 col-lg-6 col-xl-4 myProfile h-auto my-2">
                        <div className="card-stats h-100">
                            <div className="d-flex align-items-center border-bottom mb-3">
                                <span className="calendar_title me-2 mb-3">My Subscription</span> <span className='mb-3'>(#41)</span>
                            </div>

                            <div className="mt-2 px-3">
                                <div className="user_profile_objective flex-column">
                                    <div className="d-flex align-items-center">
                                        <div className="text_label w-auto me-2">SUBSCRIPTION PRICE:</div>
                                        <div className="text_value w-auto">$276.57</div>
                                    </div>

                                    <div className="d-flex align-items-center">
                                        <div className="text_label w-auto me-2">FIRST DELIVERY:</div>
                                        <div className="text_value w-auto">Apr 24, 2022</div>
                                    </div>

                                    <div className="d-flex align-items-center">
                                        <div className="text_label w-auto me-2">LAST DELIVERY:</div>
                                        <div className="text_value w-auto">Jun 05, 2022</div>
                                    </div>

                                    <div className="d-flex align-items-center">
                                        <div className="text_label w-auto me-2">RENEW STATUS:</div>
                                        <div className="text_value w-auto">Manual Renewal</div>
                                    </div>

                                    <div className="d-flex align-items-center">
                                        <div className="text_label w-auto me-2">NEXT RENEWAL DATE:</div>
                                        <div className="text_value w-auto">Sep 12, 2023 - Sep 14, 2023</div>
                                    </div>
                                </div>
                                <div>
                                    <div className='purchase-pickup-cls mb-4'>
                                        This subscription is cancelled
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12 col-lg-6 col-xl-4 myProfile h-auto my-2">
                        <div className="card-stats h-100">
                            <div className="d-flex align-items-center border-bottom mb-3">
                                <span className="calendar_title me-2 mb-3">Subscription Details</span>
                            </div>

                            <div className="mt-2">
                                <div className="user_profile_objective flex-column px-3">
                                    <div className="d-flex align-items-center">
                                        <div className="text_label w-auto me-2">PLAN:</div>
                                        <div className="text_value w-auto">none</div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="text_label w-auto me-2">BILLING PLAN:</div>
                                        <div className="text_value w-auto">Breakfast, Lunch, &/or Dinner</div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="text_label w-auto me-2">PORTION SIZE:</div>
                                        <div className="text_value w-auto">Regular</div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="text_label w-auto me-2">DAYS PER WEEK:</div>
                                        <div className="text_value w-auto">6 days</div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="text_label w-auto me-2">MEALS PER DAY:</div>
                                        <div className="text_value w-auto">5</div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="text_label w-auto me-2">STARTING ON:</div>
                                        <div className="text_value w-auto">3 x Wed, 3 x Sun</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12 col-lg-6 col-xl-4 caloriesTable h-auto my-2">
                        <div className='row'>
                            <div className='col-6'>
                                <div className="card-stats text-center">
                                    <h3 className="font-size-38 m-0">0</h3>
                                    <p className="font-size-13 my-2">
                                        Upcoming Delivery Meals
                                    </p>
                                </div>
                            </div>
                            <div className='col-6'>
                                <div className="card-stats text-center">
                                    <h3 className="font-size-38 m-0">0</h3>
                                    <p className="font-size-13 my-2">
                                        Extras Meals
                                    </p>
                                </div>
                            </div>
                            <div className='col-6 mt-3'>
                                <div className="card-stats text-center">
                                    <h3 className="font-size-38 m-0">0</h3>
                                    <p className="font-size-13 my-2">
                                        Addons
                                    </p>
                                </div>
                            </div>
                            <div className='col-6 mt-3'>
                                <Link to="/meals">
                                    <div className="card-stats text-center primary-bg-cls">
                                        <h3 className="font-size-38 text-white m-0">0</h3>
                                        <p className="font-size-13 text-white my-2">
                                            Meals to choose
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12 col-lg-6 myProfile h-auto my-2">
                        <div className="card-stats h-100">
                            <div className="d-flex align-items-center border-bottom mb-3">
                                <span className="calendar_title me-2 mb-3">Pickup Settings / Delivery Settings</span>
                            </div>

                            <div className="mt-2 px-3">
                                <div className="user_profile_objective flex-column">
                                    <div className="">
                                        <div className="text_label">CURRENT PICKUP: / CURRENT DELIVERY ADDRESS:</div>
                                        <div className="text_value">TTP Fitness /   1017 Franklin Court Jefferson Hills 38018 2</div>
                                    </div>

                                    <div className="">
                                        <div className="text_label mt-3 mb-2">REQUEST DELIVERY ADDRESS CHANGE</div>
                                        <div>
                                            <button className='btn btn-warning w-50' onClick={() => setOpenRequestDeliveryPopup(true)}>Request</button>
                                        </div>
                                    </div>
                                    <div className="">
                                        <div className="text_label mt-3 mb-2">REQUEST PICKUP LOCATION CHANGE</div>
                                        <div>
                                            <button className='btn btn-warning w-50' onClick={() => setOpenRequestDeliveryPopup(true)}>Request</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12 col-lg-6 myProfile h-auto my-2">
                        <div className="card-stats h-100">
                            <div className="d-flex align-items-center border-bottom mb-3">
                                <span className="calendar_title me-2 mb-3">Subscription Settings</span>
                            </div>

                            <div className="mt-2">
                                <div className="user_profile_objective">
                                    <div className="col-6 padding-xs-col my-1">
                                        <div className="text_label me-2">SELECT MEALS:</div>
                                        <div>
                                            <Link to='/meals'> <button className='btn primary-bg-cls w-100'>Select</button></Link>
                                        </div>
                                    </div>
                                    <div className="col-6 padding-xs-col my-1">
                                        <div className="text_label w-auto me-2">PAUSE FUTURE RENEWALS:</div>
                                        <div>
                                            <button className='btn btn-warning w-100'>Pause Future Renewals</button>
                                        </div>
                                    </div>
                                    <div className="col-6 padding-xs-col my-1">
                                        <div className="text_label w-auto me-2">CREATE NEW PLAN:</div>
                                        <div>
                                            <Link to='/subscription'><button className='btn btn-dark w-100'>Create</button></Link>
                                        </div>
                                    </div>
                                    <div className="col-6 padding-xs-col my-1">
                                        <div className="text_label w-auto me-2">SKIP A DELIVERY:</div>
                                        <div>
                                            <button className='btn btn-warning w-100' onClick={() => setUpcomingOrder(true)}>Skip Upcoming Orders</button>
                                        </div>
                                    </div>
                                    <div className="col-12 padding-xs-col my-1">
                                        <div className="text_label w-auto me-2">CANCEL SUBSCRIPTION:</div>
                                        <div>
                                            <button className='btn back_danger w-100'>Cancel Subscription</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="card_table spacer_bottom spacer_top">
                            <div className="row">
                                <div className="col-12 border-bottom">
                                    <h2>Upcoming deliveries</h2>
                                </div>
                                <div className="wholesaleDates mt-3">
                                    <table id="date_select" className="scrolls scroll_horizontal_custom w-100">
                                        <tbody>
                                            <tr className="month_date_row">
                                                {datesArray
                                                    ?.filter(
                                                        (value, index, self) =>
                                                            index === self.findIndex((t) => t.month === value.month && t.year === value.year)
                                                    )
                                                    ?.map((item) => {
                                                        const monthYearKey = `${item.month}-${item.year}`;
                                                        const monthCounts = datesArray?.reduce((acc, { month, year }) => {
                                                            const key = `${month}-${year}`;
                                                            acc[key] = (acc[key] || 0) + 1;
                                                            return acc;
                                                        }, {});

                                                        return (
                                                            <td colSpan={monthCounts[monthYearKey]} key={monthYearKey}>
                                                                <span className="month_date">
                                                                    {item.name} {item.year}
                                                                </span>
                                                            </td>
                                                        );
                                                    })}
                                            </tr>
                                            <tr className="square_date_row">
                                                {datesArray?.map((item) => (
                                                    <td key={item.id}>
                                                        <div
                                                            className={`square_date ${selectedDate?.id === item.id ? 'active' : ''}`}
                                                            title={`${selectedDate?.day} ${item.year}-${item.month}-${item.date}`}
                                                            onClick={() => handleChangeDate(item)}
                                                        >
                                                            <p className="week_date">{item.day}</p>
                                                            <p className="day_date">{item.date}</p>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="card_table spacer_bottom">
                            <div className="row">
                                <div className="col-12 border-bottom mb-3">
                                    <h2>Subscription Reorder - Lock Menu</h2>
                                </div>
                                <div className='col-12'>
                                    <p>Looking to recieve the same meals every week. Select the date you would like to clone the menu from. Please note, if a recipe item(s) is not on the menu for the upcoming delivery, a random meal will be chosen. Additionally, if a 'locked' meal has a surcharge it will not be selected for any following week.</p>
                                </div>
                                <div className='col-md-4 col-sm-6'>
                                    <div className="card_table p-0 overflow-hidden shadow-none border">
                                        <div className='card_footer px-3 py-2 primary-bg-cls'>
                                            <div className='d-flex align-items-center'>
                                                <div className='col-6 tag-container p-0'>
                                                    Sunday
                                                    <p className='font-size-11 bg-secondary ms-2'>2021-10-17</p>
                                                </div>
                                                <div className='col-6 text-end cursor-pointer' onClick={() => setSelectDateForDay(true)}>Click to Change</div>
                                            </div>
                                        </div>
                                        <div className='card_body px-3 py-2'>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Ground Turkey Breakfast Burrito</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Sweet Potato Hash</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Ground Turkey Breakfast Burrito</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Shoyu Marianted Steak</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Honey Marianted Shrimp plate</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Pork Fried Rice</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-4 col-sm-6'>
                                    <div className="card_table p-0 overflow-hidden shadow-none border">
                                        <div className='card_footer px-3 py-2 primary-bg-cls'>
                                            <div className='d-flex align-items-center'>
                                                <div className='col-6 tag-container p-0'>
                                                    Wednesday
                                                    <p className='font-size-11 bg-secondary ms-2'>2022-05-04</p>
                                                </div>
                                                <div className='col-6 text-end cursor-pointer' onClick={() => setSelectDateForDay(true)}>Click to Change</div>
                                            </div>
                                        </div>
                                        <div className='card_body px-3 py-2'>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Flat Iron Steak Fajitas</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Soba Noodle Stir Fry With Chicken</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Flank Steak</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Puttanesca Pasta with Salmon</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Pork Fried Rice</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Sweet Potato Hash</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Honey Marianted Shrimp plate</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Flat Iron Steak Fajitas</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Sweet Potato Hash</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <span>Flank Steak</span>
                                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={openRequestDeliveryPopup} centered className="modal modal-650 modal-not-centered checkout">
                <ModalHeader className="border-0 d-block text-center pb-0 ms-2">
                    <div className="d-flex justify-content-center align-items-center">
                        <h3 className="font-size-32">REQUEST DELIVERY ADDRESS <br />CHANGE</h3>
                    </div>
                    <p className='font-size-24 text-secondary'>You are about to <b>request a change of your <br /> delivery address</b> to your subscription.</p>
                </ModalHeader>
                <ModalBody className="p-0">
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={Yup.object({
                            address1: Yup.string().required('Address is required!'),
                            city: Yup.string().required('City is required!'),
                            state: Yup.string().required('State is required!'),
                            zipcode: Yup.string().required('Zipcode is required!'),
                            phone: Yup.string().required('Phone is required!'),
                        })}
                        onSubmit={(values, actions) => {
                            handleSubmitAddress(values, actions);
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                {runform.errors && Object.keys(runform.errors)?.length > 0 && (
                                    <div className="alert alert-danger-login small mx-2">
                                        <h3>An error occurred!</h3>
                                        {runform.touched?.['address1'] && runform.errors?.['address1'] && (
                                            <p className="m-0">{runform.errors?.['address1']}</p>
                                        )}
                                        {runform.touched?.['city'] && runform.errors?.['city'] && (
                                            <p className="m-0">{runform.errors?.['city']}</p>
                                        )}
                                        {runform.touched?.['state'] && runform.errors?.['state'] && (
                                            <p className="m-0">{runform.errors?.['state']}</p>
                                        )}
                                        {runform.touched?.['zipcode'] && runform.errors?.['zipcode'] && (
                                            <p className="m-0">{runform.errors?.['zipcode']}</p>
                                        )}
                                        {runform.touched?.['phone'] && runform.errors?.['phone'] && (
                                            <p className="m-0">{runform.errors?.['phone']}</p>
                                        )}
                                    </div>
                                )}

                                <div className="row m-3">
                                    <div className="col-12 col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">Street Address</label>
                                            <input
                                                type="text"
                                                {...formAttr(runform, 'address1')}
                                                name="address1"
                                                placeholder="Street Address"
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">Street Address #2 (Unit, APT, Bldg, etc…)</label>
                                            <input
                                                type="text"
                                                {...formAttr(runform, 'address2')}
                                                name="address2"
                                                placeholder="Street Address #2 (Unit, APT, Bldg, etc…)"
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">City</label>
                                            <input
                                                type="text"
                                                placeholder="City"
                                                {...formAttr(runform, 'city')}
                                                name="city"
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">State</label>
                                            <select
                                                className="form-select form-control"
                                                {...formAttr(runform, 'state')}
                                                name="state"
                                            >
                                                <option>--Select--</option>
                                                {states?.map((state) => (
                                                    <option value={state.delivery_state_id} key={state.delivery_state_id}>
                                                        {state.state_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">Zip Code</label>
                                            <input
                                                type="text"
                                                placeholder="Zip Code"
                                                {...formAttr(runform, 'zipcode')}
                                                name="zipcode"
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">Phone</label>
                                            <input
                                                type="text"
                                                placeholder="(xxx)-xxx-xxxx"
                                                {...formAttr(runform, 'phone')}
                                                name="phone"
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">Gate Code</label>
                                            <input
                                                type="text"
                                                placeholder="Gate Code"
                                                {...formAttr(runform, 'gatecode')}
                                                name="gatecode"
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-group">
                                            <label className="control-label">Delivery Note</label>
                                            <input
                                                type="text"
                                                placeholder="Delivery Note"
                                                {...formAttr(runform, 'note')}
                                                name="note"
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                                    <button className="col-6 border-end" onClick={() => setOpenRequestDeliveryPopup(false)}>
                                        Cancel
                                    </button>
                                    <button className="col-6" type="submit">
                                        Request
                                    </button>
                                </ModalFooter>
                            </form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>

            <Modal isOpen={selectDateForDay} centered className="modal modal-650 modal-not-centered checkout">
                <ModalHeader className="border-0 d-block text-center pb-0 ms-2">
                    <div className="d-flex justify-content-center align-items-center">
                        <h3>SELECT DATE FOR WEDNESDAY</h3>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <button className='btn primary-bg-cls w-100'>
                        Random Meals
                    </button>
                    <div className="card_table p-0 overflow-hidden shadow-none border mt-2">
                        <div className='card_footer px-3 py-1'>
                            <div className='d-flex align-items-center'>
                                <div className='col-6'>2021-10-13</div>
                                <div className='col-6 text-end cursor-pointer' onClick={() => setSelectDateForDay(true)}>
                                    <button className='btn primary-bg-cls rounded-0 py-1'>
                                        <i className="fas fa-long-arrow-alt-right ms-0 me-1"></i>
                                        Select
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='card_body px-3 py-2'>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Flat Iron Steak Fajitas</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Soba Noodle Stir Fry With Chicken</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Flank Steak</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Puttanesca Pasta with Salmon</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Pork Fried Rice</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Sweet Potato Hash</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Honey Marianted Shrimp plate</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Flat Iron Steak Fajitas</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Sweet Potato Hash</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Flank Steak</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                        </div>
                    </div>
                    <div className="card_table p-0 overflow-hidden shadow-none border mt-2">
                        <div className='card_footer px-3 py-1'>
                            <div className='d-flex align-items-center'>
                                <div className='col-6'>2022-04-27</div>
                                <div className='col-6 text-end cursor-pointer' onClick={() => setSelectDateForDay(true)}>
                                    <button className='btn primary-bg-cls rounded-0 py-1'>
                                        <i className="fas fa-long-arrow-alt-right ms-0 me-1"></i>
                                        Select
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='card_body px-3 py-2'>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Flat Iron Steak Fajitas</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Soba Noodle Stir Fry With Chicken</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Flank Steak</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Puttanesca Pasta with Salmon</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                        </div>
                    </div>
                    <div className="card_table p-0 overflow-hidden shadow-none border mt-2">
                        <div className='card_footer px-3 py-1'>
                            <div className='d-flex align-items-center'>
                                <div className='col-6'>2022-05-04</div>
                                <div className='col-6 text-end cursor-pointer' onClick={() => setSelectDateForDay(true)}>
                                    <button className='btn primary-bg-cls rounded-0 py-1'>
                                        <i className="fas fa-long-arrow-alt-right ms-0 me-1"></i>
                                        Select
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='card_body px-3 py-2'>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Flat Iron Steak Fajitas</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Soba Noodle Stir Fry With Chicken</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Flank Steak</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Puttanesca Pasta with Salmon</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Pork Fried Rice</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Sweet Potato Hash</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Honey Marianted Shrimp plate</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Flank Steak</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Flat Iron Steak Fajitas</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Sweet Potato Hash</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Flank Steak</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Flat Iron Steak Fajitas</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <span>Pork Fried Rice</span>
                                <i className='bx bxs-help-circle fs-5 cursor-pointer primary-color-cls' onClick={() => setOpenModalByUnit({ show: true, id: '16DFCD4BF13443B88EA0A5EE00F6B4BB' })}></i>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button className="col-12" onClick={() => setSelectDateForDay(false)}>
                        Cancel
                    </button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={upcomingOrder} centered className="modal modal-650 modal-not-centered checkout">
                <ModalHeader className="border-0 text-center pb-0">
                    <div className="px-5">
                        <h3 className='font-size-28'>SELECT THE DAYS YOU WANT TO SKIP</h3>
                        <p className='font-size-24 px-1'>For each day you skip a new day is added to the end of the subscription.</p>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className='purchase-pickup-cls bg-warning mb-4 rounded p-3'>
                        For subscription cancellation please contact TTP Fitness.
                    </div>
                    <div className='row'>
                        <div className='col-md-6 col-sm-12'>
                            <div className="form-check mt-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="1424"
                                />
                                <label
                                    className="form-check-label d-flex align-items-center"
                                    htmlFor="1424"
                                >Sun, Apr 14, 2024</label>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button className="col-6 border-end" onClick={() => setUpcomingOrder(false)}>
                        Close
                    </button>
                    <button className="col-6" onClick={() => setUpcomingOrder(false)}>
                        Skip Upcoming Orders
                    </button>
                </ModalFooter>
            </Modal>

            {openModalByUnit.show && <MealDetailsModal data={openModalByUnit} close={setOpenModalByUnit} info={true} />}
        </UserMenu>
    )
}
