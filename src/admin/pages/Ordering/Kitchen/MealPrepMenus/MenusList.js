import React, { useContext, useEffect, useState } from 'react';
import DataTable from '../../../Tables/CustDataTable';
import Placeholder from '../../../../assets/images/placeholder.png';
import { Rating } from 'react-simple-star-rating';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH, daysOfWeek } from '../../../../constants/const';
import MealsListModal from './MealsListModal';
import { Calendar } from 'react-multi-date-picker';
import { SettingsStore } from '../../../../context/SettingsContext';
import Loader from '../../../../Loader/Loader';

export default function MenusList() {
    const currentDate = new Date();
    const context = useContext(SettingsStore);
    const selectedLocation = context.selected_location;

    const [selectedDate, setSelectedDate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [dateRangeMenus, setDateRangeMenus] = useState([]);
    const [showMealsModal, setShowMealsModal] = useState(false);
    const [cloneMealsModal, setCloneMealsModal] = useState(false);
    const [options, setOptions] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'display_name',
        order: 0,
    });

    const columns = [
        {
            name: '',
            column: 'ingredient_image',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div>
                            <img
                                src={data[i].ingredient_image ?? Placeholder}
                                className="object-fit-cover border rounded"
                                height="45"
                                width="45"
                                onError={(e) => (e.target.src = Placeholder)}
                            />
                        </div>
                    );
                },
            },
        },
        {
            name: 'Meals',
            column: 'display_name',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    let mealcategories = data[i].meal_category_names !== '' ? data[i].meal_category_names?.split(',') : [];
                    return (
                        <div>
                            <div className="d-flex align-items-center">
                                <p className="fw-medium mb-0 me-2">{data[i].display_name}</p>
                                {data[i]?.should_show_ratings == 1 && (
                                    <span>
                                        <Rating
                                            size={25}
                                            initialValue={Number(data[i].rate ?? 0) / 5}
                                            readonly
                                            allowFraction
                                            iconsCount={1}
                                            fillClassName="text-warning"
                                            onClick={function noRefCheck() { }}
                                        />
                                        <bdi>{data[i].rate ?? 0}/5</bdi> (0)
                                    </span>
                                )}
                            </div>
                            <div className="d-flex align-items-center py-1">
                                <div className="circle-18">
                                    {mealcategories?.map((f, i) => (
                                        <span className="text-light bg-dark" title={f} key={i}>
                                            {f.charAt(0)}
                                        </span>
                                    ))}
                                </div>
                                {data[i]?.is_new == 1 && <span className="cursor-pointer meal-recipe-tag">New Item</span>}
                            </div>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Orders',
            column: 'number_of_orders',
            options: {
                sort: true,
            },
        },
        {
            name: '',
            column: 'id',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="">
                            <i className="bx bxs-trash me-2 text-danger fs-4"></i>
                        </div>
                    );
                },
            },
        },
    ];

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
        if (selectedDate && selectedLocation && (!showMealsModal || !cloneMealsModal)) GetDateRangeMenu();
    }, [selectedDate?.month, selectedDate?.year, showMealsModal, selectedLocation, cloneMealsModal]);

    useEffect(() => {
        if (selectedDate && selectedLocation && (!showMealsModal || !cloneMealsModal)) GetAllMealRecipes(options);
    }, [selectedDate, showMealsModal, selectedLocation, cloneMealsModal]);

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

    const GetAllMealRecipes = async (option) => {
        setIsLoading(true);
        const response = await PostApi(API_PATH.getMenusList, {
            sort_by: option.sort,
            is_ascending: option.order,
            offset: option.page + 1,
            limit: option.sizePerPage,
            kitchen_location_id: selectedLocation?.kitchen_location_id,
            meal_menu_date: `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`,
            search_text: option.search,
        });
        if (response.statusCode === 200) {
            setData(response.data?.data_result ?? []);
            setOptions({ ...option, totalCount: response.data?.data_count });
        } else {
            setData([]);
            setOptions({ ...option, totalCount: 0 });
        }
        setIsLoading(false);
    };

    const tableCallBack = (option) => {
        GetAllMealRecipes(option);
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

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <h4 className="mb-sm-0 font-size-18 col-6">
                            Meal Prep menu for
                            <bdi className="text-success">
                                {' '}
                                {selectedDate?.short_name} {selectedDate?.date}, {selectedDate?.year}
                            </bdi>{' '}
                            for
                            <bdi className="text-info"> {selectedLocation?.kitchen_loc_name}</bdi>
                            <bdi className="fw-light"> #1234</bdi>
                        </h4>
                        <div className="page-title-box d-flex flex-wrap mt-4">
                            <div className="col-md-6 col-12">
                                <button type="button" className="btn btn-dark" onClick={() => setShowMealsModal(true)}>
                                    Select Meals For this day
                                </button>
                                <button type="button" className="btn btn-dark ms-2" onClick={() => setCloneMealsModal(true)}>
                                    <span>Clone this Menu</span>
                                </button>
                                <div className="bg-warning rounded-3 p-3 text-warning mt-5 mb-3 mb-md-0 me-5 bg-opacity-10">
                                    Selected Meals{' '}
                                    <bdi className="bg-warning text-white rounded-pill px-2 ms-1">{options.totalCount}</bdi>
                                </div>
                            </div>
                            <div className="col-md-6 col-12">
                                <div className="d-flex justify-content-md-end date-calendar-main">
                                    <div>
                                        <Calendar
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
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        {isLoading ? (
                            <Loader />
                        ) : (
                            <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                        )}
                    </div>
                </div>
            </div>

            {(showMealsModal || cloneMealsModal) && (
                <MealsListModal
                    states={{
                        selectedDate,
                        showMealsModal,
                        setShowMealsModal,
                        cloneMealsModal,
                        setCloneMealsModal,
                    }}
                />
            )}
        </React.Fragment>
    );
}
