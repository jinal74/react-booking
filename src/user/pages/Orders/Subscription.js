import React, { useContext, useEffect, useState } from 'react';
import Topbar from '../../../pages/common/Topbar';
import Landing from '../../../pages/common/Landing';
import TitleHeader from '../../components/TitleHeader';
import HowToModal from '../../../pages/ModalsCommon/HowToModal';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SelectDateTable from '../../components/SelectDateTable';
import { Context } from '../../../context/GeneralContext';
import { PostApi } from '../../../services/ApiService';
import { API_PATH_USER } from '../../../const';
import { FixedDecimal } from '../../../helpers/func_helper';
import { API_PATH, daysOfWeek } from '../../../admin/constants/const';

export default function Subscription() {
    const context = useContext(Context);
    const location = useLocation();
    const navigate = useNavigate();
    const [openHowToModal, setOpenHowToModal] = useState({ show: false, link: '', title: '' });
    const [selectedDate, setSelectedDate] = useState(null);
    const [toggleOverview, setToggleOverview] = useState(true);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState({
        quantity: 0,
        autoRenew: 0,
        portionSizeId: "",
        portionSizeName: "",
        subscriptionPlanWeek: "",
        subscriptionPlanId: "",
        subscriptionPlanName: "",
        daysPerWeek: "",
        mealsPerDay: "",
        billing_renew_day: "",
        price: "",
        item: null
    });
    const [allportionSizes, setAllPortionSizes] = useState([]);
    const [portionSizes, setPortionSizes] = useState([]);
    const [weekOptions, setWeekOptions] = useState({ all: [], filtered: [] });
    const [filteredPlans, setFilteredPlans] = useState({ all: [], filtered: [] });
    const [daysPerWeek, setDaysPerWeek] = useState({ all: [], filtered: [] });
    const [mealsPerDay, setMealsPerDay] = useState({ all: [], filtered: [] });

    let currentdate = `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`;

    useEffect(() => {
        GetAllPortionSizes();
    }, [])

    useEffect(() => {
        if (location.search && location.search !== "") {
            let query = new URLSearchParams(location.search);
            let find = context.datesArray?.find((f) => query.get('dd') === `${f?.year}-${f?.month}-${f?.date}`);
            setSelectedDate(find);
        } else {
            let find = context.cartData?.data && Object.keys(context.cartData?.data)?.find((date) => context.cartData?.data[date]?.subscription);
            if (find) {
                let date = context.cartData?.data?.[find]?.date ?? context.datesArray?.[0];
                setSelectedDate(date);
            } else {
                setSelectedDate(context.datesArray?.[0]);
            }
        }
    }, [location, context.datesArray, context.cartData?.data]);

    useEffect(() => {
        if (location.search && selectedDate) navigate(`/subscription?dd=${currentdate}`);
    }, [currentdate]);

    useEffect(() => {
        if (context?.selected_location) {
            GetAllSubscriptionPlans();
        }
    }, [context?.selected_location])

    useEffect(() => {
        const sizesSet = new Set();
        const weeksSet = new Set();
        const daysPerWeekSet = new Set();
        const mealsPerDaySet = new Set();
        const plansSet = new Set();

        let weeksFiltered = [];
        let daysPerWeekFiltered = [];
        let mealsPerDayFiltered = [];
        let plansFiltered = [];

        subscriptionPlans.forEach(plan => {
            sizesSet.add(plan.portion_size_id);
            weeksSet.add(plan.numbers_of_weeks);
            daysPerWeekSet.add(plan.days_per_week);
            mealsPerDaySet.add(plan.meals_per_day);

            if (plan.portion_size_id === selectedPlanDetails?.portionSizeId) {
                weeksFiltered.push(plan.numbers_of_weeks);

                if (plan.numbers_of_weeks.toString() === selectedPlanDetails?.subscriptionPlanWeek?.toString()) {
                    plansSet.add(plan.plan_name);
                    plansFiltered.push(plan.plan_name);

                    if (plan.plan_name === selectedPlanDetails?.subscriptionPlanName) {
                        daysPerWeekFiltered.push(plan.days_per_week);

                        if (plan.days_per_week === selectedPlanDetails?.daysPerWeek) {
                            mealsPerDayFiltered.push(plan.meals_per_day);
                        }
                    }
                }
            }
        });

        if (allportionSizes?.length > 0) {
            setPortionSizes(allportionSizes.filter(size => sizesSet.has(size.portion_size_id)));
        }

        setWeekOptions({ all: [...weeksSet], filtered: [...new Set(weeksFiltered)] });
        setFilteredPlans({ all: [...plansSet], filtered: [...new Set(plansFiltered)] });
        setDaysPerWeek({ all: [...daysPerWeekSet], filtered: [...new Set(daysPerWeekFiltered)] });
        setMealsPerDay({ all: [...mealsPerDaySet], filtered: [...new Set(mealsPerDayFiltered)] });
    }, [selectedPlanDetails, subscriptionPlans, allportionSizes]);

    useEffect(() => {
        let date = context.cartData.data && Object.keys(context.cartData.data)?.find((f) => context.cartData.data?.[f]?.subscription)
        if (context.cartData?.data?.[date]?.subscription) {
            setSelectedPlanDetails(context.cartData?.data?.[date].subscription);
        }
    }, [context.cartData?.data, currentdate, selectedDate])

    useEffect(() => {
        if (context?.selected_location && (selectedPlanDetails?.subscriptionPlanId && selectedPlanDetails?.subscriptionPlanId !== "")) { GetDatesSubscriptionPlans(); }
    }, [context?.selected_location, selectedPlanDetails?.subscriptionPlanId])

    const GetDatesSubscriptionPlans = async () => {
        const response = await PostApi(API_PATH_USER.GetDatesSubscriptionPlans, {
            subscription_plan_id: selectedPlanDetails?.subscriptionPlanId,
            kitchen_location_id: context?.selected_location.kitchen_location_id
        });
        if (response.statusCode === 200) {
            let data = response.data[0] ?? [];

            let dates = data.map((f) => {
                let date = new Date(f.order_date);
                return ({
                    id: `${date.getFullYear()}${(date.getMonth() + 1)}${date.getDate()}`,
                    date: date.getDate().toString().padStart(2, '0'),
                    month: (date.getMonth() + 1).toString().padStart(2, '0'),
                    name: date.toLocaleString('default', { month: 'long' }),
                    shortName: date.toLocaleString('default', { month: 'short' }),
                    day: date.toLocaleString('en-us', { weekday: 'short' }),
                    dayFullName: date.toLocaleString('en-us', { weekday: 'long' }),
                    year: date.getFullYear(),
                })
            });
            context.setDatesArray(dates);
        }
    };

    const GetAllSubscriptionPlans = async () => {
        const response = await PostApi(API_PATH_USER.GetAllSubscriptionPlans, {
            kitchen_location_id: context?.selected_location?.kitchen_location_id
        });
        if (response.statusCode === 200) {
            let data = response.data ?? [];
            setSubscriptionPlans(data);
        }
    }

    const GetAllPortionSizes = async () => {
        const response = await PostApi(API_PATH.getActivePortionSize);
        if (response.statusCode === 200) {
            let data = response.data ?? [];
            setAllPortionSizes(data);
        }
    }

    const handleSelect = (value, key, portion_name) => {
        let newData = { ...selectedPlanDetails, [key]: value };

        const resetFields = (fields) => {
            fields.forEach(field => {
                newData[field] = '';
            });
            newData.item = null;
        };

        switch (key) {
            case 'autoRenew':
                resetFields(['portionSizeId', 'portionSizeName', 'subscriptionPlanWeek', 'subscriptionPlanId', 'subscriptionPlanName', 'daysPerWeek', 'mealsPerDay', 'billing_renew_day', 'price']);
                break;
            case 'portionSizeId':
                newData['portionSizeName'] = portion_name;
                resetFields(['subscriptionPlanWeek', 'subscriptionPlanId', 'subscriptionPlanName', 'daysPerWeek', 'mealsPerDay', 'billing_renew_day', 'price']);
                break;
            case 'subscriptionPlanWeek':
                resetFields(['subscriptionPlanId', 'subscriptionPlanName', 'daysPerWeek', 'mealsPerDay', 'billing_renew_day', 'price']);
                break;
            case 'daysPerWeek':
                resetFields(['mealsPerDay', 'price']);
                break;
            case 'subscriptionPlanName':
                const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                const foundPlan = subscriptionPlans?.find(f => f.plan_name === value);
                Object.assign(newData, {
                    subscriptionPlanId: foundPlan?.subscription_plan_id || '',
                    daysPerWeek: '',
                    mealsPerDay: '',
                    billing_renew_day: weekDays[foundPlan?.billing_renew_day] || selectedDate?.dayFullName,
                    price: '',
                });
                break;
            case 'mealsPerDay':
                const item = subscriptionPlans?.find(plan => plan.portion_size_id === newData.portionSizeId && plan.numbers_of_weeks === newData.subscriptionPlanWeek && plan.plan_name === newData.subscriptionPlanName && plan.days_per_week === newData.daysPerWeek && plan.meals_per_day === value);
                Object.assign(newData, {
                    quantity: 1,
                    price: item?.price || '',
                    item: item || null,
                });

                SetCartData(newData);
                break;
            default:
                break;
        }

        setSelectedPlanDetails(newData);
    };

    const handleSetDate = (selecteddate) => {
        if (context.cartData.data?.[currentdate]?.subscription) {
            let cart = { ...context.cartData };
            let cartdata = { ...cart.data };
            let currentdata = { ...cartdata[`${selecteddate?.year}-${selecteddate?.month}-${selecteddate?.date}`] };

            Object.assign(currentdata, {
                subscription: cartdata[currentdate].subscription,
                date: selecteddate
            });
            delete cartdata[currentdate];
            cartdata[`${selecteddate?.year}-${selecteddate?.month}-${selecteddate?.date}`] = currentdata;

            if ((!currentdata.meals || currentdata.meals?.length === 0) && (!currentdata.packs || currentdata.packs?.length === 0) && (!currentdata.subscription)) {
                delete cartdata[`${selecteddate?.year}-${selecteddate?.month}-${selecteddate?.date}`]
            }

            cart.data = cartdata;

            let totalItemsAllDates = 0;
            let totalPriceAllDates = 0;

            Object.keys(cart.data).forEach(date => {
                const mealsForDate = cart.data[date]?.meals ?? [];
                totalItemsAllDates += mealsForDate.reduce((acc, meal) => acc + meal.quantity, 0);
                totalPriceAllDates += mealsForDate.reduce((acc, meal) => acc + (Number(meal.price) * meal.quantity), 0);

                const packsForDate = cart.data[date]?.packs ?? [];
                totalItemsAllDates += packsForDate.reduce((acc, pack) => acc + pack.quantity, 0);
                totalPriceAllDates += packsForDate.reduce((acc, pack) => acc + (Number(pack.totalPrice) * pack.quantity), 0);

                const subscriptionMealsForDate = (cart.data[date]?.subscriptionMeals && Object.values(cart.data[date]?.subscriptionMeals)?.flat()) ?? [];
                totalItemsAllDates += subscriptionMealsForDate.filter((f) => f.ingredient_id !== "")?.length;
                totalPriceAllDates += subscriptionMealsForDate.reduce((acc, meal) => acc + Number(meal.price), 0);

                const subscriptionForDate = cart.data[date].subscription;
                if (subscriptionForDate) {
                    totalItemsAllDates += 1;
                    totalPriceAllDates += Number(cart.data[date].subscription.price);
                }
            });

            if (cart?.giftcards) {
                totalItemsAllDates += 1;
                totalPriceAllDates += cart.giftcards.value;
            }

            context.setCartData({
                ...cart,
                totalItems: totalItemsAllDates,
                subTotal: totalPriceAllDates,
            });
        }

        setSelectedDate(selecteddate)
    }

    function generateCustomDeliveryDates(cartData, data) {
        const result = [];
        let currentDate = new Date(`${cartData.date?.year}-${cartData.date?.month}-${cartData.date?.date}`);
        let endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + 7 * data.numbers_of_weeks);

        while (currentDate < endDate) {
            const deliveryKey = `del_for_days_on_${daysOfWeek[currentDate.getDay()]}`;

            if (data[deliveryKey] > 0) {
                result.push({
                    id: `${currentDate.getFullYear()}${currentDate.getMonth() + 1}${currentDate.getDate()}`,
                    date: currentDate.getDate().toString().padStart(2, '0'),
                    month: (currentDate.getMonth() + 1).toString().padStart(2, '0'),
                    name: currentDate.toLocaleString('default', { month: 'long' }),
                    shortName: currentDate.toLocaleString('default', { month: 'short' }),
                    day: currentDate.toLocaleString('en-us', { weekday: 'short' }),
                    dayFullName: currentDate.toLocaleString('en-us', { weekday: 'long' }),
                    year: currentDate.getFullYear(),
                    meals: data[deliveryKey] * data.meals_per_day,
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return result;
    }

    const SetCartData = (data) => {
        let cart = { ...context.cartData };
        let cartdata = { ...cart.data };
        let currentdata = { ...cartdata[currentdate] };

        if (data) {
            Object.assign(currentdata, {
                subscription: data,
                date: selectedDate
            });

            let dateArray = generateCustomDeliveryDates(currentdata, data.item);
            context.setSubscriptionDatesArray(dateArray);
        } else {
            delete currentdata.subscription;
            context.setSubscriptionDatesArray([]);
            context.setDatesArray([]);
        }

        cartdata[currentdate] = currentdata;

        if (cartdata) {
            Object.keys(cartdata).forEach(date => {
                if (cartdata[date].subscriptionMeals) {
                    delete cartdata[date].subscriptionMeals;
                }
                if ((!cartdata[date].meals || cartdata[date].meals?.length === 0) && (!cartdata[date].packs || cartdata[date].packs?.length === 0) && (!cartdata[date].subscription) && (!cartdata[date].subscriptionMeals)) {
                    delete cartdata[date]
                }
            });
        }

        cart.data = cartdata;

        let totalItemsAllDates = 0;
        let totalPriceAllDates = 0;

        Object.keys(cart.data).forEach(date => {
            const mealsForDate = cart.data[date]?.meals ?? [];
            totalItemsAllDates += mealsForDate.reduce((acc, meal) => acc + meal.quantity, 0);
            totalPriceAllDates += mealsForDate.reduce((acc, meal) => acc + (Number(meal.price) * meal.quantity), 0);

            const packsForDate = cart.data[date]?.packs ?? [];
            totalItemsAllDates += packsForDate.reduce((acc, pack) => acc + pack.quantity, 0);
            totalPriceAllDates += packsForDate.reduce((acc, pack) => acc + (Number(pack.totalPrice) * pack.quantity), 0);

            const subscriptionMealsForDate = (cart.data[date]?.subscriptionMeals && Object.values(cart.data[date]?.subscriptionMeals)?.flat()) ?? [];
            totalItemsAllDates += subscriptionMealsForDate.filter((f) => f.ingredient_id !== "")?.length;
            totalPriceAllDates += subscriptionMealsForDate.reduce((acc, meal) => acc + Number(meal.price), 0);

            const subscriptionForDate = cart.data[date].subscription;
            if (subscriptionForDate) {
                totalItemsAllDates += 1;
                totalPriceAllDates += Number(cart.data[date].subscription.price);
            }
        });

        if (cart?.giftcards) {
            totalItemsAllDates += 1;
            totalPriceAllDates += cart.giftcards.value;
        }

        context.setCartData({
            ...cart,
            totalItems: totalItemsAllDates,
            subTotal: totalPriceAllDates,
        });
    }

    const handleStartOver = () => {
        let data = {
            ...selectedPlanDetails,
            portionSizeId: "",
            portionSizeName: "",
            subscriptionPlanWeek: "",
            subscriptionPlanId: "",
            subscriptionPlanName: "",
            daysPerWeek: "",
            mealsPerDay: "",
            billing_renew_day: "",
            price: "",
            item: null
        }
        setSelectedPlanDetails(data);
        SetCartData(null);
    }

    return (
        <div className="choose_subscriptions">
            <Topbar />
            <Landing>
                <TitleHeader
                    title="Subscription Creation"
                    state={setOpenHowToModal}
                    link="https://www.youtube.com/embed/BzgEqOZIjgw?controls=0"
                />
                <div className="container-fluid">
                    <div className="container-user">
                        <div className="row">
                            <div className="col-md-12 col-sm-12 spacer-top">
                                <div className="subs_meals_warning">
                                    <div className="warning_wrapper col-1">
                                        <span>
                                            <i className="fas fa-exclamation-triangle text-warning"></i>
                                        </span>
                                    </div>
                                    <div className="warning_text_box">
                                        <span>
                                            Meals are selected after you confirm your subscription plan and checkout. Once payment is verified
                                            you can click Meal Plans and select your meals for the following delivery days. Under your profile
                                            you can modify your subscription plan, skip a delivery date, and view additional info regarding
                                            your subscription plan.
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12  col-md-6 col-lg-8 ">
                                <div className="row">
                                    <div className="col-12">
                                        <div>
                                            <h3 className="title_section">1. Please select your renewal preferences </h3>
                                            <hr className="title_underline" />
                                        </div>
                                    </div>
                                    <div className="col-12 paddingBottom paddingTop">
                                        <div className={`btn-selector ${selectedPlanDetails?.autoRenew === 0 ? 'active' : ''}`} onClick={() => handleSelect(0, 'autoRenew')}>
                                            Manual Renewal
                                        </div>
                                        <div className={`btn-selector ${selectedPlanDetails?.autoRenew === 1 ? 'active' : ''}`} onClick={() => handleSelect(1, 'autoRenew')}>
                                            Automatic Renewal
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12 ">
                                        <div>
                                            <h3 className="title_section">2. Choose your Portion Size </h3>
                                            <hr className="title_underline" />
                                        </div>
                                    </div>
                                    <div className="col-12 paddingBottom paddingTop">
                                        {
                                            portionSizes?.map((portion, i) => (
                                                <div className={`btn-selector ${portion?.portion_size_id === selectedPlanDetails?.portionSizeId ? 'active' : ''}`} key={i} onClick={() => handleSelect(portion?.portion_size_id, 'portionSizeId', portion?.portion_size_name)}>
                                                    {portion?.portion_size_name}
                                                </div>
                                            ))
                                        }
                                    </div>

                                    <div className="col-12">
                                        <div>
                                            <h3 className="title_section">3. Choose your Billing Renewal Cycle </h3>
                                            <hr className="title_underline" />
                                        </div>
                                    </div>
                                    <div className="col-12 paddingBottom paddingTop">
                                        {
                                            weekOptions.all?.map((week, i) => (
                                                <div className={`btn-selector ${week === selectedPlanDetails?.subscriptionPlanWeek ? 'active' : ''} ${(weekOptions.filtered?.includes(week) && selectedPlanDetails?.portionSizeId !== "") ? '' : 'disable'}`} key={i} onClick={() => handleSelect(week, 'subscriptionPlanWeek')}>
                                                    {week} week{week > 1 ? 's' : ''}
                                                </div>
                                            ))
                                        }
                                    </div>

                                    <div className="col-12">
                                        <div>
                                            <h3 className="title_section">4. Choose your plan </h3>
                                            <hr className="title_underline" />
                                        </div>
                                    </div>
                                    <div className="col-12 paddingBottom paddingTop">
                                        {
                                            filteredPlans.all?.map((plan, i) => (
                                                <div className={`btn-selector ${plan === selectedPlanDetails?.subscriptionPlanName ? 'active' : ''} ${(filteredPlans.filtered?.includes(plan) && selectedPlanDetails?.subscriptionPlanWeek !== "") ? '' : 'disable'}`} key={i} onClick={() => handleSelect(plan, 'subscriptionPlanName')}>
                                                    {plan}
                                                </div>
                                            ))
                                        }
                                    </div>

                                    <div className="col-12">
                                        <div>
                                            <h3 className="title_section">5. How many days per week do you want food? </h3>
                                            <hr className="title_underline" />
                                        </div>
                                    </div>
                                    <div className="col-12 paddingBottom paddingTop">
                                        {
                                            daysPerWeek.all?.map((daysperweek, i) => (
                                                <div type="button" className={`btn-selector ${daysperweek === selectedPlanDetails?.daysPerWeek ? 'active' : ''} ${(daysPerWeek.filtered?.includes(daysperweek) && selectedPlanDetails?.subscriptionPlanName !== "") ? '' : 'disable'}`} key={i} onClick={() => handleSelect(daysperweek, 'daysPerWeek')}>
                                                    {daysperweek} Days per Week
                                                </div>
                                            ))
                                        }
                                    </div>

                                    <div className="col-12">
                                        <div>
                                            <h3 className="title_section">6. How many meals per day? </h3>
                                            <hr className="title_underline" />
                                        </div>
                                    </div>
                                    <div className="col-12 paddingBottom paddingTop">
                                        {
                                            mealsPerDay.all?.map((mealsperday, i) => (
                                                <div type="button" className={`btn-selector ${mealsperday === selectedPlanDetails?.mealsPerDay ? 'active' : ''} ${(mealsPerDay.filtered?.includes(mealsperday) && selectedPlanDetails?.daysPerWeek !== "") ? '' : 'disable'}`} key={i} onClick={() => handleSelect(mealsperday, 'mealsPerDay')}>
                                                    {mealsperday} Meal{mealsperday > 1 ? 's' : ''}
                                                </div>
                                            ))
                                        }
                                    </div>

                                    <div className="col-12">
                                        <div>
                                            <h3 className="title_section">7. Choose your starting delivery date </h3>
                                            <hr className="title_underline" />
                                        </div>
                                    </div>
                                    <div className="col-12 paddingBottom paddingTop divDeliveryDates">
                                        <div className='spacer_bottom'>
                                            <SelectDateTable state={{ selectedDate, setSelectedDate: (date) => handleSetDate(date) }} isOrderDay={false} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-6 col-lg-4 sticky_graph_subscription h-100">
                                <div className="clearfix card_resume">
                                    <div className="card_resume_wrapper pb-0">
                                        <div className="padding-xs-col card_resume_title pb-2 d-flex">
                                            <div className="cursor-pointer flex-grow-1" onClick={() => setToggleOverview(!toggleOverview)}>
                                                Overview<i className="fas fa-angle-down ms-2"></i>
                                                <hr className="title_underline" />
                                            </div>
                                            <button type="button" className="new_button_square_small btn primary-bg-cls m-0" onClick={handleStartOver}>
                                                Start Over
                                            </button>
                                        </div>
                                        {
                                            toggleOverview &&
                                            <div className="">
                                                {
                                                    selectedPlanDetails?.portionSizeId !== "" &&
                                                    <div className="padding-xs-col dashedline_resume">
                                                        <div className="marging_resume_line">
                                                            <div className="row">
                                                                <div className="col-md-6 col-sm-12 text-start text_resume_line">Portion Size</div>
                                                                <div className="col-md-6 col-sm-12 text-end text_resume_line fw-bold text-sm-end text-start">
                                                                    <span className="">{allportionSizes?.find(portion => portion.portion_size_id === selectedPlanDetails?.portionSizeId)?.portion_size_name || ""}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                                {
                                                    selectedPlanDetails?.subscriptionPlanWeek !== "" &&
                                                    <div className="padding-xs-col dashedline_resume">
                                                        <div className="marging_resume_line">
                                                            <div className="row">
                                                                <div className="col-md-6 col-sm-12 text-start text_resume_line">Billing Renewal Cycle</div>
                                                                <div className="col-md-6 col-sm-12 text-end text_resume_line fw-bold text-sm-end text-start">
                                                                    <span className="">{selectedPlanDetails?.subscriptionPlanWeek} Weeks</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                                {
                                                    selectedPlanDetails?.subscriptionPlanName !== "" &&
                                                    <>
                                                        <div className="padding-xs-col dashedline_resume">
                                                            <div className="marging_resume_line">
                                                                <div className="row">
                                                                    <div className="col-md-6 col-sm-12 text-start text_resume_line">Renews every</div>
                                                                    <div className="col-md-6 col-sm-12 text-end text_resume_line fw-bold text-sm-end text-start">
                                                                        <span className="">{selectedPlanDetails?.billing_renew_day}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="padding-xs-col dashedline_resume">
                                                            <div className="marging_resume_line">
                                                                <div className="row">
                                                                    <div className="col-md-6 col-sm-12 text-start text_resume_line">Billing Plan</div>
                                                                    <div className="col-md-6 col-sm-12 text-end text_resume_line fw-bold text-sm-end text-start">
                                                                        <span className="">{selectedPlanDetails?.subscriptionPlanName}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                }
                                                {
                                                    selectedPlanDetails?.daysPerWeek !== "" &&
                                                    <div className="padding-xs-col dashedline_resume">
                                                        <div className="marging_resume_line">
                                                            <div className="row">
                                                                <div className="col-md-6 col-sm-12 text-start text_resume_line">Days per week</div>
                                                                <div className="col-md-6 col-sm-12 text-end text_resume_line fw-bold text-sm-end text-start">
                                                                    <span className="">{selectedPlanDetails?.daysPerWeek} Days per Week</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                                {
                                                    selectedPlanDetails?.mealsPerDay !== "" &&
                                                    <>
                                                        <div className="padding-xs-col dashedline_resume">
                                                            <div className="marging_resume_line">
                                                                <div className="row">
                                                                    <div className="col-md-6 col-sm-12 text-start text_resume_line">Meals per day</div>
                                                                    <div className="col-md-6 col-sm-12 text-end text_resume_line fw-bold text-sm-end text-start">
                                                                        <span className="">{selectedPlanDetails?.mealsPerDay} Meals</span>
                                                                    </div>
                                                                    <div className="col-6 text-start text_resume_line">Price per meal</div>
                                                                    <div className="col-6 text-end text_resume_line fw-bold text-sm-end text-start">
                                                                        <span className="">${FixedDecimal
                                                                            (selectedPlanDetails?.price / (selectedPlanDetails?.mealsPerDay * selectedPlanDetails?.daysPerWeek))}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="padding-xs-col dashedline_resume">
                                                            <div className="marging_resume_line">
                                                                <div className="row">
                                                                    <div className="col-md-6 col-sm-12 text-start text_resume_line">Total Meals per Week</div>
                                                                    <div className="col-md-6 col-sm-12 text-end text_resume_line fw-bold text-sm-end text-start">
                                                                        <span className="">{selectedPlanDetails?.mealsPerDay * selectedPlanDetails?.daysPerWeek}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="padding-xs-col">
                                                            <div className="row marging_resume_line">
                                                                <div className="col-md-6 col-sm-12 text-start text_resume_line">Starting on</div>
                                                                <div className="col-md-6 col-sm-12 text-end text_resume_line fw-bold text-sm-end text-start">
                                                                    <span className="">{`${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                }
                                            </div>
                                        }
                                    </div>
                                    {
                                        selectedPlanDetails?.price !== "" ?
                                            <div className="mt-3 padding-xs-col card_resume_total">
                                                <div className="py-3">
                                                    <div className="row">
                                                        <div className="col-6 text-start text_resume_line fw-bold">Sub-Total</div>
                                                        <div className="col-6 text-end text_resume_line fw-bold">
                                                            <span className="">${selectedPlanDetails?.price}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div> :
                                            <div className="mt-3 padding-xs-col card_resume_total">
                                                <div className="py-3">
                                                    <div className="row">
                                                        <div className="col-6 text-start text_resume_line fw-bold">Starting at</div>
                                                        <div className="col-6 text-end text_resume_line fw-bold">
                                                            <span className=""></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="">
                            <Link to="/meals">
                                <button className="new_button_square_big btn-outlined-primary me-2">
                                    <i className="fas fa-utensils me-1"></i>
                                    Select your meals
                                </button>
                            </Link>
                            <Link to="/cart">
                                <button className="new_button_square_big primary-bg-cls">
                                    <i className="fas fa-shopping-basket me-1"></i>
                                    Go to cart
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Landing>

            {openHowToModal.show && <HowToModal data={openHowToModal} close={setOpenHowToModal} />}
        </div>
    );
}
