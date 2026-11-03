import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Context } from '../../../../context/GeneralContext';

export default function SingleSubscription() {
    const { id } = useParams();
    const context = useContext(Context);
    const navigate = useNavigate();
    const [datesArray, setDatesArray] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        setDatesArray(context.subscriptionDatesArray);
    }, [context.subscriptionDatesArray]);

    const handleChangeDate = (item) => {
        setSelectedDate(item);
    };

    return (
        <React.Fragment>
            <div className="page-content meal-recipe-main single-subscription-cls bg-grey">
                <div className="col-12">
                    <div className="page-title-box d-sm-flex align-items-center">
                        <span
                            className="d-flex align-items-center p-0 me-3 cursor-pointer"
                            onClick={() => navigate('/admin/subscriptions')}
                        >
                            <i className="bx bx-arrow-back fs-3"></i>
                        </span>
                        <h4 className="mb-sm-0 font-size-18">Subscription View</h4>
                        <div className="ms-auto">
                            <button type="button" className="btn btn-danger me-2">
                                <i className='fas fa-exclamation-triangle me-1'></i> Force Renew
                            </button>
                            <button type="button" className="btn btn-dark me-2">
                                DbChanges
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card_table spacer_bottom">
                    <div className="d-flex flex-wrap py-3">
                        <div className="col-lg-4 col-md-6 col-sm-12 padding-xs-col">
                            <span className="bg-light d-block rounded ps-2 py-2 mb-3">Current Plan #{id}</span>
                            <div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>User:</h3>
                                    <span className='col-6 text-success'>
                                        <i className='bx bx-link me-1 align-middle fs-5'></i>
                                        Jade Balsicas
                                    </span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>Email:</h3>
                                    <span className='col-6 text-success'>
                                        <i className='bx bxs-envelope me-1 align-middle fs-5'></i>
                                        jade@sprtw.io
                                    </span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>Phone:</h3>
                                    <span className='col-6'>
                                        --
                                    </span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>Renew:</h3>
                                    <span className='col-6'>
                                        Automatic
                                    </span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>First Delivery:</h3>
                                    <span className='col-6'>
                                        Dec 31, 2023
                                    </span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>Last Delivery:</h3>
                                    <span className='col-6'>
                                        Jan 03, 2024
                                    </span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>Next Billing Period:</h3>
                                    <span className='col-6'>
                                        Jan 02, 2024 - Jan 04, 2024
                                    </span>
                                </div>
                                <div className='d-flex align-items-start'>
                                    <h3 className='my-2 font-size-14 col-6'>Previous Billed Date:</h3>
                                    <span className='col-6'>
                                        Dec 28, 2023 02:41 PM<br />
                                        ($112.50)
                                    </span>
                                </div>
                                <div className='mt-4'>
                                    <button className='btn btn-warning w-100'>Pause Subscription Auto Renewal</button>
                                </div>
                                <div className='mt-3'>
                                    <button className='btn back_danger w-100'>CANCEL SUBSCRIPTION</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12 padding-xs-col">
                            <span className="bg-light d-block rounded ps-2 py-2 mb-3">Subscription Renewal Settings</span>
                            <div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>Plan Group:</h3>
                                    <span className='col-6'>
                                        The Low Carb Plan
                                    </span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>Plan:</h3>
                                    <span className='col-6'>
                                        1 Week Plan Without Breakfast
                                    </span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>Plan Categories:</h3>
                                    <span className='col-6'>
                                        Low Carb
                                    </span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>Portion Size:</h3>
                                    <span className='col-6'>
                                        Any Size
                                    </span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>Days per week:</h3>
                                    <span className='col-6'>
                                        5 days
                                    </span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>Delivery days:</h3>
                                    <span className='col-6'>
                                        2XWednesday,<br />3XSunday
                                    </span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <h3 className='my-2 font-size-14 col-6'>Meals per day:</h3>
                                    <span className='col-6'>
                                        2 meals
                                    </span>
                                </div>
                                <div className='d-flex align-items-start'>
                                    <h3 className='my-2 font-size-14 col-6'>categories per day:</h3>
                                    <span className='col-6'>
                                        2XEntree
                                    </span>
                                </div>
                                <div className='d-flex align-items-start'>
                                    <h3 className='my-2 font-size-14 col-6'>Buffer:</h3>
                                    <span className='col-6'>
                                        2 days
                                    </span>
                                </div>
                                <div className='d-flex align-items-start'>
                                    <h3 className='my-2 font-size-14 col-6'>Day To Renew:</h3>
                                    <span className='col-6'>
                                        Thursday
                                    </span>
                                </div>
                                <div className='d-flex align-items-start'>
                                    <h3 className='my-2 font-size-14 col-6'>Rate to Charge for Plan<br />(Fees Excluded):</h3>
                                    <span className='col-6'>
                                        $112.50
                                    </span>
                                </div>
                                <div className='d-flex align-items-start'>
                                    <h3 className='my-2 font-size-14 col-6'>Included Surcharge Meals:</h3>
                                    <span className='col-6'>
                                        0 Meals
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12 padding-xs-col">
                            <span className="bg-light d-block rounded ps-2 py-2 mb-3">Delivery Renewal Settings</span>
                            <div>
                                <div className='mt-4'>
                                    <button className='btn btn-warning'>Pickup<i className='bx bxs-pencil ms-1'></i></button>
                                    <button className='btn btn-warning ms-2'>Delivery<i className='bx bxs-pencil ms-1'></i></button>
                                </div>
                                <div className=''>
                                    <h3 className='mt-3 mb-0 font-size-14'>Pickup at:</h3>
                                    <span className=''>
                                        Demo Location
                                    </span>
                                </div>
                                <div className=''>
                                    <h3 className='mt-3 mb-0 font-size-14'>Delivery Notes:</h3>
                                    <span className=''>
                                        Click to add note
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card_table spacer_bottom">
                    <div className="row padding-xs-col py-3">
                        <span className="col-12 bg-light rounded fw-bold py-2 mb-3">Subscription Reorder - Lock Menu</span>
                        <div className='col-12'>
                            <p>Looking to recieve the same meals every week. Select the date you would like to clone the menu from. Please note, if a recipe item(s) is not on the menu for the upcoming delivery, a random meal will be chosen. Additionally, if a 'locked' meal has a surcharge it will not be selected for any following week.</p>
                        </div>
                        <div className='col-md-4 col-sm-6'>
                            <div className="card_table p-0 overflow-hidden shadow-none border">
                                <div className='card_footer px-3 py-1 back_success'>
                                    <div className='d-flex align-items-center'>
                                        <div className='col-6 tag-container p-0'>
                                            Sunday
                                        </div>
                                    </div>
                                </div>
                                <div className='card_body px-3 py-3'>
                                    <div className='d-flex align-items-center justify-content-between'>
                                        <span className='dotted-underline'>2023-12-31</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='col-md-4 col-sm-6'>
                            <div className="card_table p-0 overflow-hidden shadow-none border">
                                <div className='card_footer px-3 py-1 back_success'>
                                    <div className='d-flex align-items-center'>
                                        <div className='col-6 tag-container p-0'>
                                            Wednesday
                                        </div>
                                    </div>
                                </div>
                                <div className='card_body px-3 py-3'>
                                    <div className='d-flex align-items-center justify-content-between'>
                                        <span className='dotted-underline'>Random Meals</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card_table spacer_bottom">
                    <div className="d-flex flex-wrap py-3">
                        <div className="col-lg-4 col-md-6 col-sm-12 padding-xs-col">
                            <span className="bg-light d-block rounded ps-2 py-2 mb-3">Admin Private Notes</span>
                            <div className='mt-4'>
                                <button className='btn add-note-btn'>
                                    <span className='dotted-underline fw-bold'>Click to add note</span>
                                    <i className='bx bxs-pencil ms-auto'></i>
                                </button>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12 padding-xs-col">
                            <span className="bg-light d-block rounded px-2 py-1 mb-3 d-flex align-items-center">
                                User Subscriptions
                                <button className='btn btn-warning ms-auto py-1'>Pause</button>
                            </span>
                            <div className='mt-4'>
                                <button className='btn back_success w-100 text-start'>
                                    <i className='bx bx-dock-bottom me-2 bg-success p-2 rounded fs-5'></i>
                                    2023-12-31
                                </button>
                            </div>
                            <div className='mt-3'>
                                <button className='btn btn-transparent w-100 border border-dark py-0'>
                                    See all user subscriptions [7]
                                </button>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12 padding-xs-col">
                            <span className="bg-light d-block rounded ps-2 py-2 mb-3">Last Subscription Payment</span>
                            <div className='mt-4'>
                                <button className='btn btn-dark w-100 text-start d-flex flex-wrap align-items-center'>
                                    <i className='bx bx-dock-bottom me-2 bg-secondary p-2 rounded fs-5'></i>
                                    <span>Order #8198<span className='font-size-10 d-block'>(Start on: 2023-12-31)</span></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card_table spacer_bottom">
                    <div className="row padding-xs-col py-3">
                        <span className="col-12 bg-light rounded fw-bold py-2 mb-3">Upcoming Subscription Fulfillment Dates</span>
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
        </React.Fragment>
    )
}
