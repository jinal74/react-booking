import React, { useContext, useEffect, useState } from 'react';
import UserMenu from '.';
import TitleHeader from '../../components/TitleHeader';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MacroGraph from '../../components/MacroGraph';
import { PostApi } from '../../../services/ApiService';
import { API_PATH_USER } from '../../../const';
import { Context } from '../../../context/GeneralContext';
import { API_PATH, daysOfWeek } from '../../../admin/constants/const';
import HowToModal from '../../../pages/ModalsCommon/HowToModal';
import ModalsSubscriptionMeals from './ModalsSubscriptionMeals';
import Placeholder from '../../../admin/assets/images/placeholder.png';

export default function SelectMeals() {
    const context = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedDate, setSelectedDate] = useState(null);
    const [planSummary, setPlanSummary] = useState(false);
    const [showmacros, setShowMacros] = useState(false);
    const [macrosData, setMacrosData] = useState({ macros: [], portionData: [] });
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [datesArray, setDatesArray] = useState([]);
    const [meals, setMeals] = useState(null);
    const [seeMoreMacros, setSeeMoreMacros] = useState({ show: false, data: null });
    const [openSelectMealsModal, setOpenSelectMealsModal] = useState({ show: false, data: null });
    const [beforeFinishingModal, setBeforeFinishingModal] = useState(false);
    const [openHowToModal, setOpenHowToModal] = useState({ show: false, link: '', title: '' });

    let currentdate = `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`;

    useEffect(() => {
        GetMacrosData();
    }, []);

    useEffect(() => {
        if (location.search) {
            let query = new URLSearchParams(location.search);
            let find = datesArray?.find((f) => query.get('dd') === `${f?.year}-${f?.month}-${f?.date}`);
            setSelectedDate(find);
        } else {
            setSelectedDate(datesArray?.[0]);
        }
    }, [location, datesArray]);

    useEffect(() => {
        if (selectedDate && subscription) {
            navigate(`/meals?dd=${currentdate}`);
            if (context.cartData.data?.[currentdate]?.subscriptionMeals && subscriptionData) {
                SetMacrosData(context.cartData.data?.[currentdate]?.subscriptionMeals);
                setMeals(context.cartData.data?.[currentdate]?.subscriptionMeals);
            } else {
                GetSubscriptionPricePlanById(subscription);
            }
        }
    }, [selectedDate, currentdate, subscription, context.cartData.data]);

    useEffect(() => {
        let planData = null;
        if (context.cartData.data) {
            Object.keys(context.cartData.data)?.forEach((f) => {
                if (context.cartData.data?.[f]?.subscription) planData = context.cartData.data?.[f];
            });
        }
        if (planData) {
            setSubscription(planData);
            if (context.subscriptionDatesArray) {
                setDatesArray(context.subscriptionDatesArray);
            } else {
                let firstKey = Object.keys(context.cartData.data)[0];
                Object.keys(context.cartData.data)?.forEach((f) => {
                    if (context.cartData.data?.[f]?.subscription) firstKey = f;
                });
                let dateArray = generateCustomDeliveryDates(context.cartData.data[firstKey], planData.subscription.item);
                context.setSubscriptionDatesArray(dateArray);
                setDatesArray(dateArray);
            }
        } else {
            navigate('/subscription');
        }
    }, [context.cartData.data]);

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

    const GetMacrosData = async () => {
        const response = await PostApi(API_PATH.getIngredientMacros);
        if (response.statusCode === 200) {
            let data = response.data ?? [];
            setMacrosData({ portionData: [], macros: data });
        }
    };

    const GetSubscriptionPricePlanById = async (data) => {
        const response = await PostApi(API_PATH_USER.GetSubscriptionPricePlanById, {
            subscription_price_plan_id: data?.subscription?.item.subscription_price_plan_id,
        });
        if (response.statusCode === 200) {
            setSubscriptionData(response.data?.[0]);

            let query = new URLSearchParams(location.search);
            let date = query.get('dd');
            if (context.cartData.data?.[currentdate]?.subscriptionMeals) {
                SetMacrosData(context.cartData.data?.[currentdate]?.subscriptionMeals);
                setMeals(context.cartData.data?.[currentdate]?.subscriptionMeals);
            } else {
                const categories = response.data?.[0]?.number_of_meals_per_category?.split(',') ?? [];
                let position = 1;
                let mappedApiResponse = null;

                if (categories?.length > 0) {
                    mappedApiResponse = categories.reduce((acc, meal) => {
                        const parts = meal?.split(':');
                        const [id, name, quantity] = parts;
                        for (
                            let i = 0;
                            i <
                            quantity *
                            response.data?.[0]?.[
                            `del_for_days_on_${(selectedDate ? selectedDate : data.date)?.dayFullName?.toLowerCase()}`
                            ];
                            i++
                        ) {
                            (acc[id] = acc[id] || []).push({
                                id: id,
                                name: name,
                                ingredient_id: '',
                                ingredient_name: '',
                                is_new: '',
                                ingredient_image: '',
                                position: position,
                                is_default: 0,
                                portion_size_id: '',
                                portion_size_name: '',
                                price: 0,
                                macro_values: '',
                            });
                            position += 1;
                        }
                        return acc;
                    }, {});
                } else {
                    mappedApiResponse = {
                        0: Array.from({ length: selectedDate?.meals }, (_, i) => i + 1).reduce((acc) => {
                            acc.push({
                                id: '0',
                                name: '',
                                ingredient_id: '',
                                ingredient_name: '',
                                is_new: '',
                                ingredient_image: '',
                                position: position,
                                is_default: 0,
                                portion_size_id: '',
                                portion_size_name: '',
                                price: 0,
                                macro_values: '',
                            });
                            position += 1;
                            return acc;
                        }, []),
                    };
                }

                let find = datesArray?.find((f) => date === `${f?.year}-${f?.month}-${f?.date}`);
                SetCartData(mappedApiResponse, find);
                SetMacrosData(mappedApiResponse);
            }
        }
    };

    const GetSubscriptionRandomMeals = async () => {
        const response = await PostApi(API_PATH_USER.GetSubscriptionRandomMeals, {
            meal_menu_date: currentdate,
            kitchen_location_id: context?.selected_location?.kitchen_location_id,
            subscription_price_plan_id: subscriptionData?.subscription_price_plan_id,
            subscription_plan_id: subscriptionData?.subscription_plan_id,
        });
        if (response.statusCode === 200) {
            let data = response.data?.flat() ?? [];

            let updatedItem = JSON.parse(JSON.stringify(meals));
            Object.keys(updatedItem)?.forEach((f) =>
                updatedItem[f].forEach((meal, i) => {
                    if (data && data.length > 0 && meal.ingredient_id === '') {
                        const ingredientIndex = meal.position - 1;
                        const ingredient = data[ingredientIndex % data.length];

                        Object.assign(meal, {
                            ingredient_id: ingredient.ingredient_id,
                            ingredient_name: ingredient.display_name,
                            is_new: ingredient.is_new,
                            ingredient_image: ingredient.ingredient_image,
                            price: ingredient.extra_price,
                            portion_size_id: ingredient.portion_size_id,
                            portion_size_name: ingredient.portion_size_name,
                            is_default: ingredient.is_default_portion_size,
                            macro_values: ingredient.macro_values,
                        });
                    }
                })
            );

            SetMacrosData(updatedItem);
            SetCartData(updatedItem);

            if (AllItemsHaveIngredientId(updatedItem)) setBeforeFinishingModal(true);
        }
    };

    const AnyOneItemsHaveIngredientId = () => {
        if (meals) {
            for (const [key, value] of Object.entries(meals)) {
                const anyOneHaveIngredientId = value.some((item) => item.ingredient_id !== '' && item.extra !== 1);
                if (anyOneHaveIngredientId) {
                    return true;
                }
            }
            return false;
        }
    };

    const AllItemsHaveIngredientId = (item) => {
        if (meals) {
            for (const [key, value] of Object.entries(item || meals)) {
                const allHaveIngredientId = value.every((item) => item.ingredient_id !== '' && item.extra !== 1);
                if (!allHaveIngredientId) {
                    return false;
                }
            }
            return true;
        }
    };

    function findFirstIdWithEmptyIngredientId() {
        if (meals) {
            for (const [key, value] of Object.entries(meals)) {
                const hasEmptyIngredientId = value.some((item) => item.ingredient_id === '' && item.extra !== 1);
                if (hasEmptyIngredientId) {
                    return key;
                }
            }
            return null;
        }
    }

    const handleSelectMeal = (data) => {
        SetMacrosData(data);
        SetCartData(data);

        if (AllItemsHaveIngredientId(data)) {
            setOpenSelectMealsModal({ show: false, data: null });
            setBeforeFinishingModal(true);
        } else {
            setOpenSelectMealsModal((prevState) => ({
                ...prevState,
                data: data,
                ...(prevState.meal_pack_category_id && { meal_pack_category_id: findFirstIdWithEmptyIngredientId(data) }),
            }));
        }
    };

    const handleRemoveMeal = (item, type) => {
        let tempMacros = [...macrosData?.macros];
        let mealData = JSON.parse(JSON.stringify(meals));
        let mealItem = JSON.parse(JSON.stringify(mealData[type ?? item.id]));
        let meal = JSON.parse(JSON.stringify(item));
        let index = mealData[type ?? item.id]?.findIndex((f) => f.ingredient_id === item.ingredient_id);

        Object.assign(meal, {
            ingredient_id: '',
            ingredient_name: '',
            ingredient_image: '',
            portion_size_id: '',
            portion_size_name: '',
            is_default: 0,
            macro_values: '',
            price: 0,
        });

        if (type === 'extra') {
            mealItem.splice(index, 1);
        } else {
            mealItem.splice(index, 1, meal);
        }
        mealData[type ?? item.id] = mealItem;

        SetMacrosData(mealData);
        SetCartData(mealData);
        setMacrosData({ ...macrosData, macros: tempMacros });
    };

    const handleClearAll = () => {
        let obj = JSON.parse(JSON.stringify(meals));

        Object.keys(obj)?.forEach((meal) => {
            if (meal !== 'extra') {
                obj[meal] = obj[meal]?.map((f) => ({
                    ...f,
                    ingredient_id: '',
                    ingredient_name: '',
                    ingredient_image: '',
                    portion_size_id: '',
                    portion_size_name: '',
                    is_default: 0,
                    price: 0,
                    macro_values: '',
                }));
            } else {
                delete obj.extra;
            }
        });

        SetMacrosData(obj);
        SetCartData(obj);
    };

    const SetMacrosData = (data) => {
        if (macrosData?.macros?.length > 0) {
            const macroSums = {};
            let tempMacros = [...macrosData?.macros];

            let updatedItem = JSON.parse(JSON.stringify(data));
            Object.keys(updatedItem)?.forEach((f) =>
                updatedItem[f].forEach((meal, i) => {
                    meal.macro_values?.split(';').forEach((pair) => {
                        if (pair?.split(':')?.length === 3) {
                            const [portionId, macroId, valueStr] = pair?.split(':');
                            if (portionId === meal.portion_size_id) {
                                macroSums[macroId] = (macroSums[macroId] || 0) + parseFloat(valueStr);
                            }
                        } else {
                            const [macroId, valueStr] = pair?.split(':');
                            macroSums[macroId] = (macroSums[macroId] || 0) + parseFloat(valueStr);
                        }
                    });
                })
            );

            tempMacros?.forEach((macro) => {
                macro.total = macroSums[macro.macro_id] ? macroSums[macro.macro_id].toFixed(macro.round_decimal) : '0';
            });
            setMacrosData({ ...macrosData, macros: tempMacros });
        }
    };

    const SetCartData = (data, date = selectedDate) => {
        let current = `${date?.year}-${date?.month}-${date?.date}`;
        if (date) {
            let cart = { ...context.cartData };
            let cartdata = { ...cart.data };
            let currentdata = { ...cartdata[current] };

            Object.assign(currentdata, {
                subscriptionMeals: data,
                date,
            });
            cartdata[current] = currentdata;

            if (
                (!currentdata.meals || currentdata.meals?.length === 0) &&
                (!currentdata.packs || currentdata.packs?.length === 0) &&
                !currentdata.subscriptionMeals
            ) {
                delete cartdata[current];
            }

            cart.data = cartdata;

            let totalItemsAllDates = 0;
            let totalPriceAllDates = 0;

            Object.keys(cart.data).forEach((date) => {
                const mealsForDate = cart.data[date]?.meals ?? [];
                totalItemsAllDates += mealsForDate.reduce((acc, meal) => acc + meal.quantity, 0);
                totalPriceAllDates += mealsForDate.reduce((acc, meal) => acc + Number(meal.price) * meal.quantity, 0);

                const packsForDate = cart.data[date]?.packs ?? [];
                totalItemsAllDates += packsForDate.reduce((acc, pack) => acc + pack.quantity, 0);
                totalPriceAllDates += packsForDate.reduce((acc, pack) => acc + Number(pack.totalPrice) * pack.quantity, 0);

                const subscriptionMealsForDate =
                    (cart.data[date]?.subscriptionMeals && Object.values(cart.data[date]?.subscriptionMeals)?.flat()) ?? [];
                totalItemsAllDates += subscriptionMealsForDate.filter((f) => f.ingredient_id !== '')?.length;
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
    };

    const handleChangeDate = (item) => {
        setSelectedDate(item);

        if (context.cartData.data?.[`${item?.year}-${item?.month}-${item?.date}`]?.subscriptionMeals) {
            SetMacrosData(context.cartData.data?.[`${item?.year}-${item?.month}-${item?.date}`]?.subscriptionMeals);
            setMeals(context.cartData.data?.[`${item?.year}-${item?.month}-${item?.date}`]?.subscriptionMeals);
        } else {
            const categories = subscriptionData?.number_of_meals_per_category?.split(',') ?? [];
            let position = 1;
            let mappedApiResponse = null;

            if (categories?.length > 0) {
                mappedApiResponse = categories.reduce((acc, meal) => {
                    const parts = meal?.split(':');
                    const [id, name, quantity] = parts;
                    for (
                        let i = 0;
                        i < quantity * subscriptionData?.[`del_for_days_on_${item?.dayFullName?.toLowerCase()}`];
                        i++
                    ) {
                        (acc[id] = acc[id] || []).push({
                            id: id,
                            name: name,
                            ingredient_id: '',
                            ingredient_name: '',
                            is_new: '',
                            ingredient_image: '',
                            position: position,
                            is_default: 0,
                            portion_size_id: '',
                            portion_size_name: '',
                            price: 0,
                            macro_values: '',
                        });
                        position += 1;
                    }
                    return acc;
                }, {});
            } else {
                mappedApiResponse = {
                    0: Array.from({ length: selectedDate?.meals }, (_, i) => i + 1).reduce((acc) => {
                        acc.push({
                            id: '0',
                            name: '',
                            ingredient_id: '',
                            ingredient_name: '',
                            is_new: '',
                            ingredient_image: '',
                            position: position,
                            is_default: 0,
                            portion_size_id: '',
                            portion_size_name: '',
                            price: 0,
                            macro_values: '',
                        });
                        position += 1;
                        return acc;
                    }, []),
                };
            }

            SetCartData(mappedApiResponse, item);
            SetMacrosData(mappedApiResponse);
        }
    };

    const handleNextOrderDate = () => {
        let index = datesArray?.findIndex((f) => f.id === selectedDate.id);
        if (datesArray.length !== index + 1) handleChangeDate(datesArray[index + 1]);
    };

    let mealsNotSelected =
        meals &&
        Object.values(meals)
            ?.flat()
            ?.filter((f) => f.ingredient_id === '')?.length;

    return (
        <React.Fragment>
            <UserMenu>
                <TitleHeader title="Weekly Subscription" link="https://www.youtube.com/embed/gDMGVUABHNw" container={true} />
                <div className="responsive-container-admin select-meals-main">
                    <div className="clean-alert alert--warning mt-5">
                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                        <span className="fw-bold">Warning</span>
                        <br />
                        Please select your meals for your upcoming delivery/pickup order. You can either manually select your meals
                        or have your meals randomly selected based on your saved preferences on your profile. Please make sure to
                        complete the checkout process in order to confirm your meal selection. If you do not select any meals by the
                        cutoff date a random selection will be chosen for you. All checkouts are final.
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <div className="card_table p-0 overflow-hidden">
                                {AnyOneItemsHaveIngredientId() && (
                                    <div className="card_footer p-4">
                                        <div className="d-flex">
                                            <button
                                                className="new_button_square_big primary-bg-cls my-0 me-2"
                                                onClick={() => {
                                                    if (AllItemsHaveIngredientId()) setBeforeFinishingModal(true);
                                                    else
                                                        setOpenSelectMealsModal({
                                                            show: true,
                                                            data: meals,
                                                            subscription_plan_id: subscriptionData?.subscription_plan_id,
                                                            meal_pack_category_id: findFirstIdWithEmptyIngredientId(),
                                                        });
                                                }}
                                            >
                                                <i className="fas fa-hand-pointer me-1"></i>
                                                Manually select meals
                                            </button>
                                            <button
                                                className="new_button_square_big primary-bg-cls my-0"
                                                onClick={GetSubscriptionRandomMeals}
                                            >
                                                <i className="fa fa-random me-1"></i>
                                                Randomly select meals
                                            </button>
                                            <button
                                                className="new_button_square_big btn-outlined-primary my-0 ms-auto"
                                                onClick={handleClearAll}
                                            >
                                                <i className="fas fa-eraser me-1"></i>
                                                Clear all selection
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="card_body p-3">
                                    {AnyOneItemsHaveIngredientId() ? (
                                        <div className="">
                                            <div className="fw-bold font-size-18 mb-2">
                                                Meals Selection
                                                {mealsNotSelected > 0 && (
                                                    <span className="clean-badge bg-info text-white ms-2">
                                                        {mealsNotSelected} meals left to choose
                                                    </span>
                                                )}
                                            </div>
                                            <div className="base_wrapper row align-items-center ">
                                                {meals &&
                                                    Object.values(meals)
                                                        ?.flat()
                                                        ?.map((meal, i) => {
                                                            return (
                                                                meal.ingredient_id !== '' &&
                                                                meal.extra !== 1 && (
                                                                    <div className="col-lg-4 col-md-6 col-sm-12 p-2" key={i}>
                                                                        <div
                                                                            className="card-food"
                                                                            onClick={() =>
                                                                                setOpenSelectMealsModal({
                                                                                    show: true,
                                                                                    data: meals,
                                                                                    subscription_plan_id: subscriptionData?.subscription_plan_id,
                                                                                    meal_pack_category_id: findFirstIdWithEmptyIngredientId() ?? meal.id,
                                                                                    meal,
                                                                                })
                                                                            }
                                                                        >
                                                                            <div className="food-img">
                                                                                <img
                                                                                    width="100%"
                                                                                    height="100%"
                                                                                    src={meal.ingredient_image ?? Placeholder}
                                                                                    alt={meal.ingredient_name}
                                                                                    onError={(e) => {
                                                                                        e.target.src = Placeholder;
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <div className="food-info">
                                                                                <div className="food-name ellipsis">{meal.ingredient_name}</div>
                                                                                <div className="tags">
                                                                                    {meal.price > 0 && (
                                                                                        <span className="clean-badge bg-warning">
                                                                                            <i className="fas fa-tags"></i>+${meal.price}
                                                                                        </span>
                                                                                    )}
                                                                                    {meal.is_new === 1 && <span className="clean-badge">New Item</span>}
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                className="del-ingredient position-absolute top-0 start-100 translate-middle"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleRemoveMeal(meal);
                                                                                }}
                                                                            >
                                                                                <i className="far fa-trash-alt"></i>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            );
                                                        })}
                                                {mealsNotSelected > 0 && (
                                                    <div
                                                        className="col-lg-4 col-md-6 col-sm-12 p-2"
                                                        onClick={() =>
                                                            setOpenSelectMealsModal({
                                                                show: true,
                                                                data: meals,
                                                                subscription_plan_id: subscriptionData?.subscription_plan_id,
                                                                meal_pack_category_id: findFirstIdWithEmptyIngredientId(),
                                                            })
                                                        }
                                                    >
                                                        <div className="card-info">
                                                            <i className="fas fa-info-circle me-2"></i>
                                                            {mealsNotSelected} meals left to choose
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="extrameals mt-4">
                                                <div className="fw-bold font-size-18">
                                                    Extra Meals
                                                    <button
                                                        className="new_button_square_big primary-bg-cls p-2 ms-2"
                                                        onClick={() => setOpenSelectMealsModal({ show: true, data: meals })}
                                                    >
                                                        <i className="fa fa-plus-circle"></i> Add Extra Meal
                                                    </button>
                                                </div>
                                                <div className="base_wrapper row align-items-center ">
                                                    {meals &&
                                                        Object.values(meals)
                                                            ?.flat()
                                                            ?.map((meal, i) => {
                                                                return (
                                                                    meal.extra === 1 && (
                                                                        <div className="col-lg-4 col-md-6 col-sm-12 p-2" key={i}>
                                                                            <div
                                                                                className="card-food"
                                                                                onClick={() => setOpenSelectMealsModal({ show: true, data: meals })}
                                                                            >
                                                                                <div className="food-img">
                                                                                    <img
                                                                                        width="100%"
                                                                                        height="100%"
                                                                                        src={meal.ingredient_image ?? Placeholder}
                                                                                        alt={meal.ingredient_name}
                                                                                        onError={(e) => {
                                                                                            e.target.src = Placeholder;
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                                <div className="food-info">
                                                                                    <div className="food-name ellipsis">{meal.ingredient_name}</div>
                                                                                    <div className="tags">
                                                                                        {meal.price > 0 && (
                                                                                            <span className="clean-badge bg-warning">
                                                                                                <i className="fas fa-tags"></i>+${meal.price}
                                                                                            </span>
                                                                                        )}
                                                                                        {meal.is_new === 1 && <span className="clean-badge">New Item</span>}
                                                                                    </div>
                                                                                </div>
                                                                                <button
                                                                                    type="button"
                                                                                    className="del-ingredient position-absolute top-0 start-100 translate-middle"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleRemoveMeal(meal, 'extra');
                                                                                    }}
                                                                                >
                                                                                    <i className="far fa-trash-alt"></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                );
                                                            })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-5">
                                            <div className="text-center">
                                                <div className="mb-2 font-size-26">
                                                    Order for{' '}
                                                    <b>
                                                        {selectedDate?.dayFullName}, {selectedDate?.name} {selectedDate?.date}, {selectedDate?.year}
                                                    </b>
                                                </div>
                                                <div className="mb-2 font-size-18 fw-bold">{selectedDate?.meals} meals left to choose</div>
                                            </div>
                                            <div className="text-center">
                                                <button
                                                    className="new_button_square_big primary-bg-cls me-2"
                                                    onClick={() => {
                                                        if (AllItemsHaveIngredientId()) setBeforeFinishingModal(true);
                                                        else
                                                            setOpenSelectMealsModal({
                                                                show: true,
                                                                data: meals,
                                                                subscription_plan_id: subscriptionData?.subscription_plan_id,
                                                                meal_pack_category_id: findFirstIdWithEmptyIngredientId(),
                                                            });
                                                    }}
                                                >
                                                    <i className="fas fa-hand-pointer me-1"></i>
                                                    Manually select meals
                                                </button>
                                                <button
                                                    className="new_button_square_big primary-bg-cls ms-2"
                                                    onClick={GetSubscriptionRandomMeals}
                                                >
                                                    <i className="fa fa-random me-1"></i>
                                                    Randomly select meals
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="card_footer p-4"></div>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="card_table p-0 overflow-hidden">
                                <div className="card_body p-3">
                                    <div className="font-size-18">Upcoming Deliveries</div>
                                    <div className="wholesaleDates mt-2">
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
                                                            <div className="subscriptions badge square_badge_small">{item.meals} meals</div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className={`card_table shadow-lg p-0 overflow-hidden ${planSummary ? 'closed' : ''}`}>
                                    <div
                                        className="d-flex align-items-center font-size-18 p-3"
                                        onClick={() => setPlanSummary(!planSummary)}
                                    >
                                        <div className="col-1">
                                            <i className="fas fa-angle-down me-2 toggle-icon"></i>
                                        </div>
                                        <div className="col-5">Click for Plan Summary</div>
                                        <div className="col-6 text-end">
                                            <Link to="/subscription" className="new_button_square_small btn btn-primary m-0">
                                                Change Plan
                                            </Link>
                                        </div>
                                    </div>
                                    {planSummary && (
                                        <div className="card_body p-3">
                                            <div>
                                                <table className="w-100 table table-striped">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <b className="me-2">Billing Plan</b>
                                                            </td>
                                                            <td>{subscriptionData?.plan_name}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <b className="me-2">Billing Renewal Cycle</b>
                                                            </td>
                                                            <td>{subscriptionData?.numbers_of_weeks}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <b className="me-2">Days per week</b>
                                                            </td>
                                                            <td>{subscriptionData?.days_per_week}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <b className="me-2">Meals per day</b>
                                                            </td>
                                                            <td>{subscriptionData?.meals_per_day}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`card_table p-0 overflow-hidden mt-3 ${showmacros ? 'closed' : ''}`}>
                                <div className="d-flex align-items-center font-size-18 p-3" onClick={() => setShowMacros(!showmacros)}>
                                    <div className="col-1">
                                        <i className="fas fa-angle-down me-2 toggle-icon"></i>
                                    </div>
                                    <div className="col-9">Macros Information</div>
                                    <div className="col-2 text-end">
                                        <i className="fas fa-fire me-1 text-danger"></i>
                                    </div>
                                </div>
                                {showmacros && (
                                    <div className="card_body p-3">
                                        <MacroGraph setSeeMoreMacros={setSeeMoreMacros} macrosData={macrosData} noShadow={true} />
                                    </div>
                                )}
                            </div>
                            <div className="mt-3">
                                <Link to="/cart">
                                    <button className="new_button_square_big btn-outlined-primary me-2 w-100 py-3">
                                        <i className="fas fa-shopping-basket me-1"></i>
                                        Confirm meal selections
                                    </button>
                                </Link>
                                {datesArray.length !== datesArray?.findIndex((f) => f.id === selectedDate?.id) + 1 && (
                                    <button
                                        className="new_button_square_big primary-bg-cls w-100 py-3"
                                        onClick={() => handleNextOrderDate()}
                                    >
                                        Choose Meals for Next Order Date
                                        <i className="fas fa-arrow-right ms-1"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </UserMenu>
            {openHowToModal.show && <HowToModal data={openHowToModal} close={setOpenHowToModal} />}
            {(seeMoreMacros.show || openSelectMealsModal.show || beforeFinishingModal) && (
                <ModalsSubscriptionMeals
                    states={{
                        seeMoreMacros,
                        openSelectMealsModal,
                        selectedDate,
                        beforeFinishingModal,
                        setBeforeFinishingModal,
                        setOpenSelectMealsModal,
                        setSeeMoreMacros,
                    }}
                    functions={{
                        handleSelectMeal,
                    }}
                />
            )}
        </React.Fragment>
    );
}
