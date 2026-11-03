import React, { useContext, useEffect, useState } from 'react';
import { SettingsStore } from '../../context/SettingsContext';
import { PostApi } from '../../../services/ApiService';
import { API_PATH, daysOfWeek } from '../../constants/const';
import { Calendar } from 'react-multi-date-picker';
import pieChart from '../../assets/images/pie-chart.svg'
import HowToModal from '../../../pages/ModalsCommon/HowToModal';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import DataTable from '../../../pages/Tables/CustDataTable';
import moment from 'moment/moment';
import { Modal, ModalBody } from 'reactstrap';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const currentDate = new Date();
    const context = useContext(SettingsStore);
    const selectedLocation = context.selected_location;
    const [selectedDate, setSelectedDate] = useState(null);
    const [kitchenStatus, setKitchenStatus] = useState(null);
    const [showMealsModal, setShowMealsModal] = useState(false);
    const [cloneMealsModal, setCloneMealsModal] = useState(false);
    const [statusUpdateModal, setStatusUpdateModal] = useState(false);
    const [dateRangeMenus, setDateRangeMenus] = useState([]);
    const [openHowToModal, setOpenHowToModal] = useState({ show: false, link: '', title: '' });
    const [data, setData] = useState([]);
    const [dataSubscriptions, setDataSubscriptions] = useState([]);
    const [options, setOptions] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
    });
    const [optionsSubscriptions, setOptionsSubscriptions] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
    });

    const months = [
        {
            name: 'January',
            short_name: 'Jan',
        },
        {
            name: 'February',
            short_name: 'Feb',
        },
        {
            name: 'March',
            short_name: 'Mar',
        },
        {
            name: 'April',
            short_name: 'Apr',
        },
        {
            name: 'May',
            short_name: 'May',
        },
        {
            name: 'June',
            short_name: 'Jun',
        },
        {
            name: 'July',
            short_name: 'Jul',
        },
        {
            name: 'August',
            short_name: 'Aug',
        },
        {
            name: 'September',
            short_name: 'Sep',
        },
        {
            name: 'October',
            short_name: 'Oct',
        },
        {
            name: 'November',
            short_name: 'Nov',
        },
        {
            name: 'December',
            short_name: 'Dec',
        },
    ];

    const dataMemory = {
        datasets: [
            {
                label: 'Memory',
                data: [82.61, 100 - 82.61],
                backgroundColor: [
                    'rgb(254 100 131)',
                    'rgb(212 217 226)'
                ],
                borderColor: [
                    '#ffffff',
                    '#ffffff'
                ],
                borderWidth: 2
            },
        ],
    };

    const dataDiskUsage = {
        datasets: [
            {
                label: 'Disk usage',
                data: [44.56, 100 - 44.56],
                backgroundColor: [
                    'rgb(28 99 242)',
                    'rgb(212 217 226)'
                ],
                borderColor: [
                    '#ffffff',
                    '#ffffff'
                ],
                borderWidth: 2
            },
        ],
    };

    const containerStyles = {
        width: '100%',
        backgroundColor: '#e0e0de',
        borderRadius: 50,
    };

    const fillerStyles = {
        height: '5px',
        borderRadius: 'inherit',
        textAlign: 'right',
    };

    const labelStyles = {
        color: 'white',
        fontWeight: 'bold',
        padding: '1px',
    };

    const columns = [
        {
            name: 'Order',
            column: 'order',
            options: {
                sort: true
            },
        },
        {
            name: 'Date',
            column: 'date',
            options: {
                sort: true
            },
        },
        {
            name: 'Type',
            column: 'type',
            options: {
                sort: true
            },
        },
        {
            name: 'User',
            column: 'user',
            options: {
                sort: true
            },
        },
        {
            name: 'Amount',
            column: 'amount',
            options: {
                sort: true
            },
        },
        {
            name: 'Status',
            column: 'status',
            options: {
                sort: true
            },
        }
    ];

    const columnsSubscriptions = [
        {
            name: 'ID',
            column: 'id',
            options: {
                sort: true
            },
        },
        {
            name: 'Subscription',
            column: 'subscription',
            options: {
                sort: true
            },
        },
        {
            name: 'User',
            column: 'user',
            options: {
                sort: true
            },
        },
        {
            name: 'Renew',
            column: 'renew',
            options: {
                sort: true
            },
        },
        {
            name: 'Amount',
            column: 'amount',
            options: {
                sort: true
            },
        },
    ];

    useEffect(() => {
        let date = new Date();
        let month = months[date.getMonth()];

        setSelectedDate({
            date: date.getDate(),
            month: date.getMonth() + 1,
            name: month.name,
            short_name: month.short_name,
            year: date.getFullYear(),
        });
    }, []);

    useEffect(() => {
        if (selectedDate && selectedLocation) GetKitchenStatus();
    }, [selectedDate, selectedLocation]);

    useEffect(() => {
        if (selectedDate && selectedLocation && (!showMealsModal || !cloneMealsModal)) GetDateRangeMenu();
    }, [selectedDate?.month, selectedDate?.year, showMealsModal, selectedLocation, cloneMealsModal]);

    const GetDateRangeMenu = async () => {
        const { month, year } = selectedDate;
        const lastDay = new Date(year, month, 0).getDate();
        const firstDayOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`;
        const lastDayOfMonth = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

        let dataToSend = {
            kitchen_location_id: selectedLocation?.kitchen_location_id,
            from_date: firstDayOfMonth,
            to_date: lastDayOfMonth,
        };
        const response = await PostApi(API_PATH.getDateRangeMenu, dataToSend);
        if (response.statusCode === 200) {
            setDateRangeMenus(response.data ?? []);
        }
    };

    const GetKitchenStatus = async () => {
        let dataToSend = {
            kitchen_location_id: selectedLocation?.kitchen_location_id,
            delivery_date: `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`
        };
        const response = await PostApi(API_PATH.GetKitchenStatus, dataToSend);
        if (response.statusCode === 200) {
            setKitchenStatus(response.data);
        } else {
            setKitchenStatus(null);
        }
    };

    const handleUpdateKitchenStatus = async (value) => {
        let dataToSend = {
            kitchen_location_id: selectedLocation?.kitchen_location_id,
            delivery_date: `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`,
            is_open: value
        };
        const response = await PostApi(API_PATH.UpdateKitchenStatus, dataToSend);
        if (response.statusCode === 200) {
            setStatusUpdateModal(false);
            GetKitchenStatus();
        }
    };

    const handleFetchMapDays = ({ date }) => {
        let arr = compareDateWithCurrent();
        let step;
        let dateString = `${date.year}${date.month.number.toString().padStart(2, '0')}${date.day
            .toString()
            .padStart(2, '0')}`;

        if (selectedDate?.date == date.day && selectedDate?.month == date.month.number && selectedDate?.year == date.year)
            step = 'current';
        else if (arr?.openDates?.includes(dateString)) step = 'open';
        else if (arr?.inProgress?.includes(dateString)) step = 'progress';
        else if (arr?.finished?.includes(dateString)) step = 'finish';
        else if (arr?.noMenus?.includes(dateString)) step = 'none';

        if (step) return { className: `highlight highlight-${step}` };
    };

    const compareDateWithCurrent = () => {
        let allowDaysArr = [
            'is_active_on_sunday',
            'is_active_on_monday',
            'is_active_on_tuesday',
            'is_active_on_wednesday',
            'is_active_on_thursday',
            'is_active_on_friday',
            'is_active_on_saturday',
        ];
        let AllDaysArr = daysOfWeek;
        let daysArr = allowDaysArr?.filter((f) => selectedLocation?.[f] == 1)?.map((f) => f?.split('_')?.pop());
        let OpenDatesArr = [];
        let FinishedDatesArr = [];
        let InProgressArr = [];
        let NoMenusArr = [];
        const today = new Date(`${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`);
        let inProgressFound = false;

        const getLastDayOfMonth = (year, month) => new Date(year, month + 1, 0).getDate();
        const lastDay = getLastDayOfMonth(today.getFullYear(), today.getMonth());
        const datesInMenu = dateRangeMenus.map((menu) => menu.meal_menu_date);
        for (let i = 1; i <= lastDay; i++) {
            const tempDate = new Date(today.getFullYear(), today.getMonth(), i);
            const tempDay = AllDaysArr[tempDate.getDay()];
            const dateString =
                tempDate.getFullYear() +
                '-' +
                (tempDate.getMonth() + 1).toString().padStart(2, '0') +
                '-' +
                tempDate.getDate().toString().padStart(2, '0');
            if (daysArr.includes(tempDay) && !datesInMenu.includes(dateString)) {
                NoMenusArr.push(dateString?.replaceAll('-', ''));
            }
        }

        dateRangeMenus.forEach((menu) => {
            const menuDate = new Date(menu.meal_menu_date);
            const menuDay = AllDaysArr[menuDate.getDay()];
            const mealMenuDate = menu.meal_menu_date?.replaceAll('-', '');

            if (
                !inProgressFound &&
                menuDate > currentDate &&
                daysArr.includes(menuDay) &&
                menuDate.getMonth() === currentDate.getMonth() // Check if the month matches today's month
            ) {
                inProgressFound = true;
                InProgressArr.push(mealMenuDate);
            } else if (menuDate > currentDate && daysArr.includes(menuDay)) {
                OpenDatesArr.push(mealMenuDate);
            } else if (menuDate < currentDate && daysArr.includes(menuDay)) {
                FinishedDatesArr.push(mealMenuDate);
            }
        });

        return {
            openDates: OpenDatesArr,
            finished: FinishedDatesArr,
            inProgress: InProgressArr,
            noMenus: NoMenusArr,
        };
    };

    const handleSelect = (date) => {
        setSelectedDate({
            date: date.day,
            month: date.month.number,
            name: date.month.name,
            short_name: date.month.shortName,
            year: date.year,
        });
    };

    const tableCallBack = (option) => {
        setOptions(option);
    };

    const tableCallBackSubscriptions = (option) => {
        setOptionsSubscriptions(option);
    };

    return (
        <React.Fragment>
            <div className="dashboard-main bg-grey">
                <div className="page-content">
                    <h4 className="mb-sm-0 font-size-22 fw-bold col-6">
                        Meal Prep menu for
                        <bdi className="text-success">
                            {' '}
                            {selectedDate?.short_name} {selectedDate?.date}, {selectedDate?.year}
                        </bdi>{' '}
                        for
                        <bdi className="text-info"> {selectedLocation?.kitchen_loc_name}</bdi>
                        <bdi className="fw-light"> #1234</bdi>
                    </h4>
                    {
                        (kitchenStatus && (kitchenStatus?.auto_close_on || kitchenStatus?.manual_close_on)) && (
                            <p className='font-size-12 mt-2'>
                                This day was
                                {kitchenStatus?.auto_close_on && (<><b> automatically closed</b> on <b>{moment(kitchenStatus?.auto_close_on).format('mmm dd, yyyy hh:mm A')}</b></>)}
                                {(kitchenStatus?.auto_close_on && kitchenStatus?.manual_close_on) && (<> and after</>)}
                                {kitchenStatus?.manual_close_on && (<> <b>manually closed</b> by {kitchenStatus?.closed_by} on <b>{moment(kitchenStatus?.manual_close_on).format('MMM DD, yyyy hh:mm A')}!</b></>)}
                            </p>
                        )
                    }
                    <div className="page-title-box d-flex flex-wrap mt-4">
                        <div className="col-xl-8 col-sm-12">
                            <div className='d-flex flex-wrap count-bxs-main'>
                                <div className='col-xl-4 col-md-6 col-sm-12 padding-xs-col mb-4'>
                                    <div className='d-flex align-items-center count-single-bx h-100'>
                                        <div className='col-5 count-bxs-left'>
                                            <span className=''>2</span>
                                        </div>
                                        <div className='col-7 count-bxs-right position-relative'>
                                            <div className='my-2'>
                                                <h2 className='m-0'>Orders to deliver</h2>
                                                <small className='text-success'>VIEW REPORTS</small>
                                            </div>
                                            <div className='position-absolute end-0 me-3'>
                                                <i className='bx bx-dots-horizontal-rounded fs-5'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-md-6 col-sm-12 padding-xs-col mb-4'>
                                    <div className='d-flex align-items-center count-single-bx h-100'>
                                        <div className='col-5 count-bxs-left'>
                                            <span className=''>12</span>
                                        </div>
                                        <div className='col-7 count-bxs-right position-relative'>
                                            <div className='my-2'>
                                                <h2 className='m-0'>Orders to pickup</h2>
                                                <small className='text-success'>VIEW REPORTS</small>
                                            </div>
                                            <div className='position-absolute end-0 me-3'>
                                                <i className='bx bx-dots-horizontal-rounded fs-5'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-md-6 col-sm-12 padding-xs-col mb-4'>
                                    <div className='d-flex align-items-center count-single-bx h-100'>
                                        <div className='col-5 count-bxs-left'>
                                            <span className=''>111</span>
                                        </div>
                                        <div className='col-7 count-bxs-right position-relative'>
                                            <div className='my-2'>
                                                <h2 className='m-0'>Meals to serve</h2>
                                                <small className='text-success'>VIEW REPORTS</small>
                                            </div>
                                            <div className='position-absolute end-0 me-3'>
                                                <i className='bx bx-dots-horizontal-rounded fs-5'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-md-6 col-sm-12 padding-xs-col mb-4'>
                                    <div className='d-flex align-items-center count-single-bx h-100'>
                                        <div className='col-5 count-bxs-left'>
                                            <span className=''>20</span>
                                        </div>
                                        <div className='col-7 count-bxs-right position-relative'>
                                            <div className='my-2'>
                                                <h2 className='m-0'>Meals for delivery</h2>
                                                <small className='text-success'>VIEW REPORTS</small>
                                            </div>
                                            <div className='position-absolute end-0 me-3'>
                                                <i className='bx bx-dots-horizontal-rounded fs-5'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-md-6 col-sm-12 padding-xs-col mb-4'>
                                    <div className='d-flex align-items-center count-single-bx h-100'>
                                        <div className='col-5 count-bxs-left'>
                                            <span className=''>91</span>
                                        </div>
                                        <div className='col-7 count-bxs-right position-relative'>
                                            <div className='my-2'>
                                                <h2 className='m-0'>Meals for pickup</h2>
                                                <small className='text-success'>VIEW REPORTS</small>
                                            </div>
                                            <div className='position-absolute end-0 me-3'>
                                                <i className='bx bx-dots-horizontal-rounded fs-5'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-md-6 col-sm-12 padding-xs-col mb-4'>
                                    <div className='d-flex align-items-center count-single-bx h-100'>
                                        <div className='col-5 count-bxs-left back_danger'>
                                            <span className=''>176</span>
                                        </div>
                                        <div className='col-7 count-bxs-right position-relative'>
                                            <div className='my-2'>
                                                <h2 className='m-0'>Auto Select Meals</h2>
                                                <small className='color_danger'>VIEW REPORTS</small>
                                            </div>
                                            <div className='position-absolute end-0 me-3'>
                                                <i className='bx bx-dots-horizontal-rounded fs-5'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-md-6 col-sm-12 padding-xs-col mb-4'>
                                    <div className='d-flex align-items-center count-single-bx h-100'>
                                        <div className='col-5 count-bxs-left'>
                                            <span className=''>111</span>
                                        </div>
                                        <div className='col-7 count-bxs-right position-relative'>
                                            <div className='my-2'>
                                                <h2 className='m-0'>Chef menu</h2>
                                                <small className='text-success'>VIEW REPORTS</small>
                                            </div>
                                            <div className='position-absolute end-0 me-3'>
                                                <i className='bx bx-dots-horizontal-rounded fs-5'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-md-6 col-sm-12 padding-xs-col mb-4'>
                                    <div className='d-flex align-items-center count-single-bx h-100'>
                                        <div className='col-5 count-bxs-left'>
                                            <span className=''>9</span>
                                        </div>
                                        <div className='col-7 count-bxs-right position-relative'>
                                            <div className='my-2'>
                                                <h2 className='m-0'>Custom meal builder</h2>
                                                <small className='text-success'>VIEW REPORTS</small>
                                            </div>
                                            <div className='position-absolute end-0 me-3'>
                                                <i className='bx bx-dots-horizontal-rounded fs-5'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-md-6 col-sm-12 padding-xs-col mb-4'>
                                    <div className='d-flex align-items-center count-single-bx h-100'>
                                        <div className='col-5 count-bxs-left'>
                                            <span className=''>1</span>
                                        </div>
                                        <div className='col-7 count-bxs-right position-relative'>
                                            <div className='my-2'>
                                                <h2 className='m-0'>By the pound</h2>
                                                <small className='text-success'>VIEW REPORTS</small>
                                            </div>
                                            <div className='position-absolute end-0 me-3'>
                                                <i className='bx bx-dots-horizontal-rounded fs-5'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-md-6 col-sm-12 padding-xs-col mb-4'>
                                    <div className='d-flex align-items-center count-single-bx h-100'>
                                        <div className='col-5 count-bxs-left'>
                                            <span className=''>24</span>
                                        </div>
                                        <div className='col-7 count-bxs-right position-relative'>
                                            <div className='my-2'>
                                                <h2 className='m-0'>Menu - Meal Prep</h2>
                                                <small className='text-success'>VIEW MENU</small>
                                            </div>
                                            <div className='position-absolute end-0 me-3'>
                                                <i className='bx bx-dots-horizontal-rounded fs-5'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-md-6 col-sm-12 padding-xs-col mb-4'>
                                    <div className='d-flex align-items-center count-single-bx h-100'>
                                        <div className='col-5 count-bxs-left'>
                                            <span className=''>3</span>
                                        </div>
                                        <div className='col-7 count-bxs-right position-relative'>
                                            <div className='my-2'>
                                                <h2 className='m-0'>Menu</h2>
                                                <small className='text-success'>VIEW MENU</small>
                                            </div>
                                            <div className='position-absolute end-0 me-3'>
                                                <i className='bx bx-dots-horizontal-rounded fs-5'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-md-6 col-sm-12 padding-xs-col mb-4'>
                                    <div className='d-flex align-items-center count-single-bx h-100'>
                                        <div className='col-5 count-bxs-left'>
                                            <span className=''>8</span>
                                        </div>
                                        <div className='col-7 count-bxs-right position-relative'>
                                            <div className='my-2'>
                                                <h2 className='m-0'>Menu Wholesale</h2>
                                                <small className='text-success'>VIEW MENU</small>
                                            </div>
                                            <div className='position-absolute end-0 me-3'>
                                                <i className='bx bx-dots-horizontal-rounded fs-5'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-md-6 col-sm-12 padding-xs-col mb-4'>
                                    <div className='d-flex align-items-center count-single-bx h-100'>
                                        <div className='col-5 count-bxs-left secondary-bg-cls'>
                                            <span className=''>
                                                <img src={pieChart} className='img-fluid' width='50px' height='50px' />
                                            </span>
                                        </div>
                                        <div className='col-7 count-bxs-right position-relative'>
                                            <div className='my-2'>
                                                <h2 className='m-0'>Ordering Metrics</h2>
                                                <small className='text-success'>VIEW</small>
                                            </div>
                                            <div className='position-absolute end-0 me-3'>
                                                <i className='bx bx-dots-horizontal-rounded fs-5'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-12 mt-2 padding-xs-col'>
                                    <div className='purchase-pickup-cls font-size-13'>
                                        <i className='bx bx-error-circle fs-4'></i><br />
                                        Auto renew encountered <span className='border border-dashed rounded bg-danger p-1'>1</span> subscriptions with errors - <span className='font-size-15'>See More</span>
                                    </div>
                                </div>
                                <div className='col-12 mt-2 padding-xs-col'>
                                    <div className='purchase-pickup-cls font-size-13'>
                                        <i className='bx bx-error-circle fs-4'></i><br />
                                        You still have <span className='border border-dashed rounded bg-danger p-1'>176</span> meals that have not been selected from customers on subscriptions. - <span className='font-size-15'>View Report</span>
                                    </div>
                                </div>
                                <div className='col-12 mt-5 padding-xs-col'>
                                    <div className='d-flex flex-wrap count-bxs-bottom'>
                                        {
                                            kitchenStatus && kitchenStatus?.is_open ?
                                                <div className='col-2 fns-production-bx ms-0' onClick={() => setStatusUpdateModal(true)}>
                                                    <i className='fas fa-box'></i>
                                                    <span>CLOSE MEAL SELECTIONS</span>
                                                </div> :
                                                <div className='col-2 reopen-bx ms-0' onClick={() => setStatusUpdateModal(true)}>
                                                    <i className='bx bxs-lock-open-alt'></i>
                                                    <span>REOPEN</span>
                                                </div>
                                        }
                                        <div className='col-2 meal-auto-bx'>
                                            <i className='bx bx-restaurant'></i>
                                            <span>MEALS AUTO-SELECTED</span>
                                        </div>
                                        <div className='col-2 reports-bx'>
                                            <i className='fas fa-receipt'></i>
                                            <span>REPORTS MAR 20, 2024</span>
                                        </div>
                                        <div className='col-2 fns-production-bx'>
                                            <i className='bx bx-check fw-bold'></i>
                                            <span>FINISH PRODUCTION</span>
                                        </div>
                                        <div className='col-2 root-plnr-bx'>
                                            <i className='bx bxs-truck'></i>
                                            <span>ROOT PLANNER</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-12 padding-xs-col mt-5'>
                                    <button type="button" className="btn new_button_square_big" onClick={() => setOpenHowToModal({ show: true, title: `How to Open/Close a Delivery Date`, link: 'https://www.youtube.com/embed/UB3c9vbICJ4?si=YB9gRkyKSySfTYdd' })}>
                                        <i className="fas fa-question-circle me-2"></i>
                                        How to Open/Close a Delivery Date
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-sm-12">
                            <div className="d-flex justify-content-center date-calendar-main">
                                <div className='w-100 mx-5'>
                                    <Calendar
                                        className='w-100'
                                        mapDays={handleFetchMapDays}
                                        onChange={handleSelect}
                                        onMonthChange={handleSelect}
                                        onYearChange={handleSelect}
                                        value={new Date(`${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`)}
                                    />
                                    <div className="d-flex mt-2">
                                        <div className="me-2">
                                            <span className="calendar-day-cust current-day-cls"></span>Current Day
                                        </div>
                                        <div className="me-2">
                                            <span className="calendar-day-cust open-day-cls"></span>Open Dates
                                        </div>
                                        <div className="me-2">
                                            <span className="calendar-day-cust progress-day-cls"></span>In Progress
                                        </div>
                                        <div className="me-2">
                                            <span className="calendar-day-cust finish-day-cls"></span>Finished
                                        </div>
                                        <div>
                                            <span className="calendar-day-cust none-day-cls"></span>No Menus
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='server-status-main spacer_top d-flex justify-content-center mx-5'>
                                <div className='card_table col-12'>
                                    <div className='card_body'>
                                        <div>
                                            <h3 className='font-size-18 d-inline'>Server Status</h3>
                                            <span className='red-yllw-tag ms-2'>Needs Upgrade</span>
                                            <p className='font-size-11 mt-1'>
                                                Your server is reaching max memory capacity. <br />We recommend upgrading your server to the next tier.
                                            </p>
                                            <div className='d-flex flex-wrap mt-4'>
                                                <div className='col-6 px-3'>
                                                    Memory 82.61%
                                                    <div style={containerStyles} className='mb-3'>
                                                        <div style={{ ...fillerStyles, backgroundColor: 'rgb(254 100 131)', width: `${Math.ceil(82.61)}%` }}>
                                                            <span style={labelStyles}></span>
                                                        </div>
                                                    </div>
                                                    <div className='position-relative'>
                                                        <div className="position-absolute top-50 start-50 translate-middle mt-2">
                                                            <p className='m-0' style={{ color: 'rgb(254 100 131)' }}>82.61%</p>
                                                        </div>
                                                        <Doughnut data={dataMemory} />
                                                    </div>
                                                </div>
                                                <div className='col-6 px-3'>
                                                    Disk usage 44.56%
                                                    <div style={containerStyles} className='mb-3'>
                                                        <div style={{ ...fillerStyles, backgroundColor: 'rgb(28 99 242)', width: `${Math.ceil(44.56)}%` }}>
                                                            <span style={labelStyles}></span>
                                                        </div>
                                                    </div>
                                                    <div className='position-relative'>
                                                        <div className="position-absolute top-50 start-50 translate-middle mt-2">
                                                            <p className='m-0' style={{ color: 'rgb(28 99 242)' }}>44.56%</p>
                                                        </div>
                                                        <Doughnut data={dataDiskUsage} />
                                                    </div>
                                                </div>
                                                <div className='col-12 mt-4 px-3'>
                                                    <button className='btn secondary-bg-cls'>
                                                        Update Server
                                                        <i className='bx bx-server ms-1 align-middle fs-4'></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='col-12 padding-xs-col'>
                            <div className="card_table spacer_bottom spacer_top pt-0">
                                <div className="row border-bottom align-items-center">
                                    <div className="col-md-6 col-12">
                                        <h2 className='font-size-14'>Checkouts for <span className='font-size-20 text-info'>Mar 20, 2024</span></h2>
                                    </div>
                                </div>
                                <div className="dataTables_wrapper form-inline dt-bootstrap no-footer">
                                    <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                                </div>
                            </div>
                        </div>
                        <div className='col-12 padding-xs-col'>
                            <div className="card_table pt-0">
                                <div className="row border-bottom align-items-center">
                                    <div className="col-md-6 col-12">
                                        <h2 className='font-size-14'>Subscriptions renewing today</h2>
                                    </div>
                                </div>
                                <div className="dataTables_wrapper form-inline dt-bootstrap no-footer">
                                    <DataTable data={dataSubscriptions} options={optionsSubscriptions} tableCallBack={tableCallBackSubscriptions} columns={columnsSubscriptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {openHowToModal.show && <HowToModal data={openHowToModal} close={setOpenHowToModal} />}

            <Modal isOpen={statusUpdateModal} centered className="modal modal-sm how-to-main position-relative modal-not-centered">
                <ModalBody className='text-center'>
                    <h1 className='mb-1 fw-bold font-size-22'>Are you sure?</h1>
                    <p>You want to change status to {kitchenStatus?.is_open ? 'Reopen' : 'Close meal selections'}</p>
                    <div className='mt-2'>
                        <button className='btn btn-danger font-size-16 me-2' onClick={() => setStatusUpdateModal(false)}>
                            No
                        </button>
                        <button className='btn btn-success font-size-16' onClick={() => handleUpdateKitchenStatus(kitchenStatus?.is_open ? '0' : '1')}>
                            Yes
                        </button>
                    </div>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
};

export default Dashboard;
