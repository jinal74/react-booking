import React, { useContext, useEffect, useState } from 'react';
import Topbar from '../../../pages/common/Topbar';
import Header from '../../../pages/common/Header';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from '../../../context/GeneralContext';
import emptyData from '../../../assets/images/emptyData.svg';
import Footer from '../../../pages/common/Footer';
import padLock from '../../../assets/images/padlock.svg';

export default function CartPage() {
    const context = useContext(Context);
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        setData(context.cartData.data);
    }, [context.cartData]);

    const handleDelete = (index, date) => {
        let cart = { ...context.cartData };
        let cartdata = { ...cart.data };
        let currentdata = { ...cartdata[date] };
        let packs = [...(currentdata.packs ?? [])];

        packs.splice(index, 1);
        currentdata.packs = packs;

        cartdata[date] = currentdata;
        if (
            (!currentdata.packs || currentdata.packs?.length === 0) &&
            (!currentdata.meals || currentdata.meals?.length === 0)
        ) {
            delete cartdata[date];
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

            const subscriptionMealsForDate = (cart.data[date]?.subscriptionMeals && Object.values(cart.data[date]?.subscriptionMeals)?.flat()) ?? [];
            totalItemsAllDates += subscriptionMealsForDate.filter((f) => f.ingredient_id !== "")?.length;
            totalPriceAllDates += subscriptionMealsForDate.reduce((acc, meal) => acc + Number(meal.price), 0);

            const subscriptionForDate = cart.data[date].subscription
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
    };

    const handleDeleteGiftCard = () => {
        let cart = JSON.parse(JSON.stringify(context.cartData));

        delete cart.giftcards;

        context.setCartData({
            ...cart,
            totalItems: context.cartData.totalItems - 1,
            subTotal: context.cartData.subTotal - context.cartData.giftcards.value,
        });
    };

    const removeCartMeal = (date, type, item, index) => {
        let cart = { ...context.cartData };
        let cartdata = { ...cart.data };
        let currentdata = { ...cartdata[date] };
        let meals = [...(currentdata.meals ?? [])];

        if (type === 'all') {
            meals = [];
        } else {
            let findIndex = meals.findIndex(
                (f) => f.ingredient_id === item.ingredient_id && f.portion_size_id === item.portion_size_id
            );
            if (findIndex !== -1 && meals[findIndex].quantity > 1) {
                meals[findIndex].quantity -= 1;
            } else if (findIndex !== -1) {
                meals.splice(findIndex, 1);
            }
        }
        currentdata.meals = meals;
        cartdata[date] = currentdata;

        if (
            (!currentdata.packs || currentdata.packs?.length === 0) &&
            (!currentdata.meals || currentdata.meals?.length === 0)
        ) {
            delete cartdata[date];
        }
        cart.data = cartdata;

        let totalItemsAllDates = 0;
        let totalPriceAllDates = 0;

        Object.keys(cart.data).forEach((date) => {
            const mealsForDate = cart.data[date].meals ?? [];
            totalItemsAllDates += mealsForDate.reduce((acc, meal) => acc + meal.quantity, 0);
            totalPriceAllDates += mealsForDate.reduce((acc, meal) => acc + Number(meal.price) * meal.quantity, 0);

            const packsForDate = cart.data[date].packs ?? [];
            totalItemsAllDates += packsForDate.reduce((acc, pack) => acc + pack.quantity, 0);
            totalPriceAllDates += packsForDate.reduce((acc, pack) => acc + Number(pack.totalPrice) * pack.quantity, 0);

            const subscriptionMealsForDate = (cart.data[date]?.subscriptionMeals && Object.values(cart.data[date]?.subscriptionMeals)?.flat()) ?? [];
            totalItemsAllDates += subscriptionMealsForDate.filter((f) => f.ingredient_id !== "")?.length;
            totalPriceAllDates += subscriptionMealsForDate.reduce((acc, meal) => acc + Number(meal.price), 0);

            const subscriptionForDate = cart.data[date].subscription
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
    };

    const removeSubscription = (date) => {
        let cart = { ...context.cartData };
        let cartdata = { ...cart.data };
        let currentdata = { ...cartdata[date] };

        delete currentdata.subscription;
        cartdata[date] = currentdata;

        if ((!currentdata.packs || currentdata.packs?.length === 0) && (!currentdata.meals || currentdata.meals?.length === 0)) {
            delete cartdata[date];
        }
        cart.data = cartdata;

        let totalItemsAllDates = 0;
        let totalPriceAllDates = 0;

        Object.keys(cart.data).forEach((date) => {
            const mealsForDate = cart.data[date].meals ?? [];
            totalItemsAllDates += mealsForDate.reduce((acc, meal) => acc + meal.quantity, 0);
            totalPriceAllDates += mealsForDate.reduce((acc, meal) => acc + Number(meal.price) * meal.quantity, 0);

            const packsForDate = cart.data[date].packs ?? [];
            totalItemsAllDates += packsForDate.reduce((acc, pack) => acc + pack.quantity, 0);
            totalPriceAllDates += packsForDate.reduce((acc, pack) => acc + Number(pack.totalPrice) * pack.quantity, 0);

            const subscriptionMealsForDate = (cart.data[date]?.subscriptionMeals && Object.values(cart.data[date]?.subscriptionMeals)?.flat()) ?? [];
            totalItemsAllDates += subscriptionMealsForDate.filter((f) => f.ingredient_id !== "")?.length;
            totalPriceAllDates += subscriptionMealsForDate.reduce((acc, meal) => acc + Number(meal.price), 0);
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
    };

    const handleDeleteWeeklySubscription = (date) => {
        let cart = { ...context.cartData };
        let cartdata = { ...cart.data };
        let currentdata = { ...cartdata[date] };

        delete currentdata.subscriptionMeals;
        cartdata[date] = currentdata;

        if ((!currentdata.packs || currentdata.packs?.length === 0) && (!currentdata.meals || currentdata.meals?.length === 0) && (!currentdata.subscription)) {
            delete cartdata[date];
        }
        cart.data = cartdata;

        let totalItemsAllDates = 0;
        let totalPriceAllDates = 0;

        Object.keys(cart.data).forEach((date) => {
            const mealsForDate = cart.data[date].meals ?? [];
            totalItemsAllDates += mealsForDate.reduce((acc, meal) => acc + meal.quantity, 0);
            totalPriceAllDates += mealsForDate.reduce((acc, meal) => acc + Number(meal.price) * meal.quantity, 0);

            const packsForDate = cart.data[date].packs ?? [];
            totalItemsAllDates += packsForDate.reduce((acc, pack) => acc + pack.quantity, 0);
            totalPriceAllDates += packsForDate.reduce((acc, pack) => acc + Number(pack.totalPrice) * pack.quantity, 0);

            const subscriptionMealsForDate = (cart.data[date]?.subscriptionMeals && Object.values(cart.data[date]?.subscriptionMeals)?.flat()) ?? [];
            totalItemsAllDates += subscriptionMealsForDate.filter((f) => f.ingredient_id !== "")?.length;
            totalPriceAllDates += subscriptionMealsForDate.reduce((acc, meal) => acc + Number(meal.price), 0);

            const subscriptionForDate = cart.data[date].subscription
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
    };

    const renderAggregatedMeals = (data) => {
        const meals = data ? Object.values(data)?.flat() : [];

        const aggregatedMeals = meals.reduce((acc, meal) => {
            const id = `${meal.ingredient_id}-${meal.portion_size_id}`;
            if (!acc[id]) {
                acc[id] = { ...meal, quantity: 1 };
            } else {
                acc[id].quantity += 1;
            }
            return acc;
        }, {});

        const aggregatedMealsArray = Object.values(aggregatedMeals);

        return aggregatedMealsArray.map(
            (meal) =>
                meal.ingredient_id !== '' && (
                    <div
                        className="bottom_line d-flex justify-content-between"
                        key={`${meal.ingredient_id}-${meal.portion_size_id}`}
                    >
                        <div className="d-flex me-auto mt-3">
                            <p className="strike_del">
                                {meal.ingredient_name}
                                {meal.is_default !== 1 && <span className="portion_tag_v2">{meal.portion_size_name}</span>}
                            </p>
                        </div>

                        <div className="d-flex ms-auto mt-3 pe-0">
                            <p className="strike_del">
                                {meal.quantity} X <b> {meal.price <= 0 ? 'Inc.' : '$' + meal.price}</b>
                            </p>
                        </div>
                    </div>
                )
        );
    };

    const AnyOneItemsHaveIngredientId = (meals) => {
        if (meals) {
            for (const [key, value] of Object.entries(meals)) {
                const anyOneHaveIngredientId = value.some(item => item.ingredient_id !== "");
                if (anyOneHaveIngredientId) {
                    return true;
                }
            }
            return false;
        }
    }

    let mealsNotSelectedForSubscription = (date) => {
        return (data ? Object.values(data?.[date].subscriptionMeals)
            ?.flat()
            ?.filter((f) => f.ingredient_id === '')?.length : '');
    }

    return (
        <React.Fragment>
            <Topbar />
            <Header />
            {(data && Object.keys(data)?.length > 0) || context.cartData.giftcards ? (
                <div className="checkout">
                    <div className="row w-100 d-flex top_holder">
                        <div className="d-flex align-items-center col-sm-6 col-md-6">
                            <span className="me-auto">
                                <Link to="/" className="forgot-pass">
                                    <i className="fas fa-long-arrow-alt-left me-1"></i>
                                    Back to Homepage
                                </Link>
                            </span>
                        </div>
                        <div className="d-flex align-items-center col-sm-6 col-md-6 mt-4">
                            <div className="ms-auto d-flex secure_wrapper">
                                <div className="img me-3">
                                    <img className=" " src={padLock} alt=" " />
                                </div>
                                <div className="safe-text">
                                    <p className="bold mb-0">SAFE AND SECURE CHECKOUT</p>
                                    <p>Stripe AES-256 encryption</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12 col-md-8">
                                <h2 className="text-start font-size-20">
                                    <strong>Confirm Your Cart</strong>{' '}
                                </h2>
                            </div>
                            <div className="col-sm-12 col-md-4">
                                <div className="button_go_wrapper">
                                    <Link className="btn w-100" to="/cart-confirm">
                                        Proceed to Checkout
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="row d-flex">
                            <div className="content-confirm w-100">
                                {context.cartData?.giftcards && (
                                    <div className="col-sm-12 col-md-12">
                                        <div className="row d-flex">
                                            <div className="col-12 mt-3 pt-3">
                                                <p className="">
                                                    <span className="cursor-pointer trash_confirm_i me-3" onClick={() => handleDeleteGiftCard()}>
                                                        <i className="far fa-trash-alt"></i>
                                                    </span>
                                                    <span className="bold strike_del">Gift Card</span>
                                                    <a className="ms-3" onClick={() => navigate('/giftcard')}>
                                                        Edit
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bottom_line d-flex justify-content-between">
                                            <div className="d-flex me-auto mt-3">
                                                <p className="bold">
                                                    Name: <i className="fas fa-long-arrow-alt-right"></i>
                                                </p>
                                                <div>
                                                    <p>{context.cartData.giftcards.name}</p>
                                                </div>
                                            </div>
                                            <div className="d-flex me-auto mt-3">
                                                <p className="bold">
                                                    Email to Send: <i className="fas fa-long-arrow-alt-right"></i>
                                                </p>
                                                <div>
                                                    <p>{context.cartData.giftcards.email}</p>
                                                </div>
                                            </div>
                                            <div className="d-flex me-auto mt-3">
                                                <p className="bold">
                                                    Phone: <i className="fas fa-long-arrow-alt-right"></i>
                                                </p>
                                                <div>
                                                    <p>{context.cartData.giftcards.phone}</p>
                                                </div>
                                            </div>
                                            <div className="d-flex me-auto mt-3">
                                                <p className="bold">
                                                    Value: <i className="fas fa-long-arrow-alt-right"></i>
                                                </p>
                                                <div>
                                                    <p>${context.cartData.giftcards.value?.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {data && Object.keys(data)?.map((date, index) => {
                                    let dateObj = data?.[date].date;
                                    {
                                        return (
                                            (data?.[date].meals?.length > 0 ||
                                                data?.[date].packs?.length > 0 ||
                                                (data?.[date].subscriptionMeals && AnyOneItemsHaveIngredientId(data?.[date].subscriptionMeals)) ||
                                                data?.[date].subscription) && (
                                                <React.Fragment key={index}>
                                                    <div className="col-sm-12 col-md-12">
                                                        <div className="title_wrap b-3 mt-5">
                                                            <b>
                                                                <h2 className="title_cart">
                                                                    <i className="far fa-clock"></i> Order for {dateObj?.dayFullName}, {dateObj?.name}{' '}
                                                                    {dateObj?.date}, {dateObj?.year}{' '}
                                                                </h2>
                                                            </b>
                                                        </div>
                                                        <div className="row d-flex">
                                                            {data?.[date].packs?.map((item, i) => {
                                                                let mealsNotSelected = Object.values(item.meals)
                                                                    ?.flat()
                                                                    ?.filter((f) => f.ingredient_id === '')?.length;
                                                                return (
                                                                    <div className="col-sm-12 col-md-12" key={i}>
                                                                        <div className="row d-flex">
                                                                            <div className="col-12 mt-3 pt-3">
                                                                                <p className="">
                                                                                    <span
                                                                                        className="cursor-pointer trash_confirm_i me-3"
                                                                                        onClick={() => handleDelete(i, date)}
                                                                                    >
                                                                                        <i className="far fa-trash-alt"></i>
                                                                                    </span>
                                                                                    <span className="bold strike_del">
                                                                                        Meal Packs - {item.quantity} packs of {item.number_of_meals} meals
                                                                                    </span>
                                                                                    <a
                                                                                        className="ms-3"
                                                                                        onClick={() =>
                                                                                            navigate(`/packs/?dd=${date}`)
                                                                                        }
                                                                                    >
                                                                                        Edit
                                                                                    </a>
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {mealsNotSelected > 0 && (
                                                                            <div className="row">
                                                                                <div className="col-12">
                                                                                    <a
                                                                                        className="btn back_danger w-100 text-start py-3"
                                                                                        onClick={() =>
                                                                                            navigate(`/packs/?dd=${date}`)
                                                                                        }
                                                                                    >
                                                                                        You still have {mealsNotSelected} meals left to choose. Click here to
                                                                                        select your meals.
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <div className="">{renderAggregatedMeals(item.meals)}</div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        {data?.[date].meals?.length > 0 && (
                                                            <div className="col-sm-12 col-md-12">
                                                                <div className="row d-flex">
                                                                    <div className="col-12 mt-3 pt-3">
                                                                        <p className="">
                                                                            <span
                                                                                className="cursor-pointer trash_confirm_i me-3"
                                                                                onClick={() => removeCartMeal(date, 'all')}
                                                                            >
                                                                                <i className="far fa-trash-alt"></i>
                                                                            </span>
                                                                            <span className="bold strike_del">À la Carte</span>
                                                                            <a
                                                                                className="ms-3"
                                                                                onClick={() =>
                                                                                    navigate(`/mealsbyunit/?dd=${date}`)
                                                                                }
                                                                            >
                                                                                Edit
                                                                            </a>
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="">
                                                                    {data?.[date].meals?.map((item, i) => (
                                                                        <div className="row d-flex" key={i}>
                                                                            <div
                                                                                className="bottom_line d-flex justify-content-between"
                                                                                key={item.ingredient_id}
                                                                            >
                                                                                <div className="d-flex me-auto mt-3">
                                                                                    <span
                                                                                        className="grey me-3 cursor-pointer"
                                                                                        onClick={() => removeCartMeal(date, 'single', item, index)}
                                                                                    >
                                                                                        <i className="far fa-times-circle"></i>
                                                                                    </span>
                                                                                    <p className="strike_del">
                                                                                        {item.ingredient_name}
                                                                                        {item.is_default !== 1 && (
                                                                                            <span className="portion_tag_v2">{item.portion_size_name}</span>
                                                                                        )}
                                                                                    </p>
                                                                                </div>

                                                                                <div className="d-flex ms-auto mt-3 pe-0">
                                                                                    <p className="strike_del">
                                                                                        {item.quantity} X <b> ${item.price}</b>
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {data?.[date].subscriptionMeals && AnyOneItemsHaveIngredientId(data?.[date].subscriptionMeals) &&
                                                            <div className="row d-flex">
                                                                <div className="col-sm-12 col-md-12">
                                                                    <div className="row d-flex">
                                                                        <div className="col-12 mt-3 pt-3">
                                                                            <p className="">
                                                                                <span
                                                                                    className="cursor-pointer trash_confirm_i me-3"
                                                                                    onClick={() => handleDeleteWeeklySubscription(date)}
                                                                                >
                                                                                    <i className="far fa-trash-alt"></i>
                                                                                </span>
                                                                                <span className="bold strike_del">
                                                                                    Weekly Subscription
                                                                                </span>
                                                                                <a
                                                                                    className="ms-3"
                                                                                    onClick={() =>
                                                                                        navigate(`/meals/?dd=${date}`)
                                                                                    }
                                                                                >
                                                                                    Edit
                                                                                </a>
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {mealsNotSelectedForSubscription(date) > 0 && (
                                                                        <div className="row">
                                                                            <div className="col-12">
                                                                                <a
                                                                                    className="btn back_danger w-100 text-start py-3"
                                                                                    onClick={() =>
                                                                                        navigate(`/meals/?dd=${date}`)
                                                                                    }
                                                                                >
                                                                                    You still have {mealsNotSelectedForSubscription(date)} meals left to choose. Click here to
                                                                                    select your meals.
                                                                                </a>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className="">
                                                                        {Object.values(data?.[date].subscriptionMeals)?.flat()?.map((meal, i) =>
                                                                            meal.ingredient_id !== '' && (
                                                                                <div
                                                                                    className="bottom_line d-flex justify-content-between"
                                                                                    key={`${meal.ingredient_id}-${meal.portion_size_id}-${i}`}
                                                                                >
                                                                                    <div className="d-flex me-auto mt-3">
                                                                                        <p className="strike_del">
                                                                                            {meal.ingredient_name}
                                                                                            {meal.is_default !== 1 && <span className="portion_tag_v2">{meal.portion_size_name}</span>}
                                                                                        </p>
                                                                                    </div>

                                                                                    <div className="d-flex ms-auto mt-3 pe-0">
                                                                                        <p className="strike_del">
                                                                                            <b> {meal.price <= 0 ? 'Inc.' : '$' + meal.price}</b>
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                    </div>
                                                                </div>
                                                            </div>}
                                                        {data?.[date].subscription && (
                                                            <div className="col-sm-12 col-md-12">
                                                                <div className="d-flex justify-content-between">
                                                                    <div className="mt-3 pt-3">
                                                                        <p className="">
                                                                            <span
                                                                                className="cursor-pointer trash_confirm_i me-3"
                                                                                onClick={() => removeSubscription(date)}
                                                                            >
                                                                                <i className="far fa-trash-alt"></i>
                                                                            </span>
                                                                            <span className="bold strike_del">Subscription Creation</span>
                                                                            <a
                                                                                className="ms-3"
                                                                                onClick={() =>
                                                                                    navigate(`/subscription/?dd=${date}`)
                                                                                }
                                                                            >
                                                                                Edit
                                                                            </a>
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-end mt-3 pt-3">
                                                                        <b>${data?.[date].subscription.price}</b>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2">
                                                                    <div className="row">
                                                                        <div className="col-md-3 col-sm-12 p-0">
                                                                            <span className="bold">Renewal preferences</span>

                                                                            <div>
                                                                                <p>{data?.[date].subscription.autoRenew === 1 ? 'Automatic ' : 'Manual '} Renewal</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="col-md-6  p-0">
                                                                            <span className="bold">Billing Plan</span>

                                                                            <div>
                                                                                <p>{data?.[date].subscription.subscriptionPlanName}</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="col-md-3 col-sm-12 p-0">
                                                                            <span className="bold">Portion Size</span>

                                                                            <div>
                                                                                <p>{data?.[date].subscription.portionSizeName}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="clearfix"></div>

                                                                        <div className="col-md-3 col-sm-12 p-0">
                                                                            <span className="bold" b="">
                                                                                Billing Renewal Cycle
                                                                            </span>

                                                                            <div>
                                                                                <p>{data?.[date].subscription.subscriptionPlanWeek} Week{data?.[date].subscription.subscriptionPlanWeek > 1 ? 's' : ''}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-3 col-sm-12 p-0">
                                                                            <span className="bold">Days per Week</span>

                                                                            <div>
                                                                                <p>{data?.[date].subscription.daysPerWeek} Days per Week</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-3 col-sm-12 p-0">
                                                                            <span className="bold">Meals per Day</span>

                                                                            <div>
                                                                                <p>{data?.[date].subscription.mealsPerDay} Meal{data?.[date].subscription.mealsPerDay > 1 ? 's' : ''}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-3 col-sm-12 p-0">
                                                                            <span className="bold">Starting Date</span>

                                                                            <div>
                                                                                <p>{date}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-12 col-sm-12 p-0 bottom_line">
                                                                            <span className="bold">Deliveries scheduled for</span>

                                                                            <div className="delivery_scheduled">
                                                                                <p>
                                                                                    {context.subscriptionDatesArray?.map((dates, i) => {
                                                                                        if (i === 0 || (i === (context.subscriptionDatesArray?.length - 1))) return (
                                                                                            <Link to={`/meals?dd=${dates.year}-${dates.month}-${dates.date}`} key={i}>
                                                                                                <span className="">
                                                                                                    {dates.day}, {dates.shortName} {dates.date}, {dates.year}<i className="fas fa-long-arrow-alt-right"></i>{' '}
                                                                                                </span>
                                                                                            </Link>
                                                                                        )
                                                                                    })}

                                                                                    {/* <a href="https://lifestylemeals.ttpfitness.com/meals?dd=2024-03-31">
                                                                                        <span className="">
                                                                                            Sun, Mar 31, 2024<i className="fas fa-long-arrow-alt-right"></i>{' '}
                                                                                        </span>
                                                                                    </a> */}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </React.Fragment>
                                            )
                                        );
                                    }
                                })}
                            </div>
                        </div>

                        <div className="row mt-5 justify-content-end">
                            <div className="col-sm-12 col-md-4">
                                <div className="button_go_wrapper">
                                    <Link className="btn w-100" to="/cart-confirm">
                                        Proceed to Checkout
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="row marginBottom marginTop">
                        <div className="col-12">
                            <div className="cart_img_wrapper">
                                <img src={emptyData} alt="" />
                                <div className="cart_empty_text">
                                    <h2>Empty Cart</h2>
                                    <p>Looks like you haven’t added anything to your cart</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </>
            )}
        </React.Fragment>
    );
}
