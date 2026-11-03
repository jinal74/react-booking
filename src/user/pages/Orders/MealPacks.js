import React, { useContext, useEffect, useState } from 'react';
import SelectDateTable from '../../components/SelectDateTable';
import HowToModal from '../../../pages/ModalsCommon/HowToModal';
import { Tooltip } from 'reactstrap';
import Topbar from '../../../pages/common/Topbar';
import Landing from '../../../pages/common/Landing';
import TitleHeader from '../../components/TitleHeader';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Makeid } from '../../../helpers/func_helper';
import Modals from './Modals';
import { Context } from '../../../context/GeneralContext';
import { PostApi } from '../../../services/ApiService';
import { API_PATH_USER } from '../../../const';
import Placeholder from '../../../admin/assets/images/placeholder.png';
import { API_PATH } from '../../../admin/constants/const';
import MacroGraph from '../../components/MacroGraph';

export default function MealPacks() {
    const context = useContext(Context);
    const location = useLocation();
    const navigate = useNavigate();
    const [selectPackModal, setSelectPackModal] = useState({ show: false, data: null });
    const [seeMoreMacros, setSeeMoreMacros] = useState({ show: false, data: null });
    const [openSelectMealsModal, setOpenSelectMealsModal] = useState({ show: false, data: null });
    const [beforeFinishingModal, setBeforeFinishingModal] = useState(false);
    const [openHowToModal, setOpenHowToModal] = useState({ show: false, link: '', title: '' });
    const [mealPacksData, setMealPacksData] = useState([]);
    const [macrosData, setMacrosData] = useState({ portionData: [], macros: [] });
    const [mealPacks, setMealPacks] = useState([]);
    const [tooltipOpen, setTooltipOpen] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);

    let currentdate = `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`;

    useEffect(() => {
        if (location.search) {
            let query = new URLSearchParams(location.search);
            let find = context.datesArray?.find((f) => query.get('dd') === `${f?.year}-${f?.month}-${f?.date}`);
            setSelectedDate(find);
        } else {
            setSelectedDate(context.datesArray?.[0])
        }
    }, [location, context.datesArray]);

    useEffect(() => {
        if (location.search && selectedDate) navigate(`/packs?dd=${currentdate}`);
    }, [currentdate]);

    useEffect(() => {
        currentdate = `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`;
        if (context.cartData.data?.[currentdate]?.packs?.length > 0) setMealPacks(context.cartData.data?.[currentdate]?.packs);
        else {
            setMealPacks([
                {
                    position: 1,
                    id: Makeid(12),
                    meal_pack_id: '',
                    totalPrice: 0,
                    price: 0,
                    quantity: 1,
                    meals: null,
                    macros: macrosData
                },
            ])
        }
    }, [context.cartData, selectedDate, macrosData]);

    useEffect(() => {
        GetAllMealPacksToOrder();
        GetMacrosData();
    }, []);

    useEffect(() => {
        if (!selectedDate && context?.selected_location) GetDatesOneTimeOrder();
    }, [context?.selected_location, selectedDate])

    const GetDatesOneTimeOrder = async () => {
        const response = await PostApi(API_PATH_USER.GetDatesOneTimeOrder, { kitchen_location_id: context?.selected_location.kitchen_location_id });
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

    const GetMacrosData = async () => {
        const response = await PostApi(API_PATH.getIngredientMacros);
        if (response.statusCode === 200) {
            let data = response.data ?? [];
            setMacrosData({ portionData: [], macros: data });
        }
    };

    const GetAllMealPacksToOrder = async () => {
        const response = await PostApi(API_PATH_USER.GetAllMealPacksToOrder);
        if (response.statusCode === 200) {
            setMealPacksData(response.data);
        } else {
            setMealPacksData([]);
        }
    };

    const toggle = (key) => {
        setTooltipOpen(tooltipOpen == key ? '' : key);
    };

    const handleAddMealPack = () => {
        let tempData = [...mealPacks];
        let obj = {
            position: !isNaN(tempData[tempData.length - 1]?.position + 1) ? (tempData[tempData.length - 1]?.position + 1) : 1,
            id: Makeid(12),
            meal_pack_id: '',
            totalPrice: 0,
            price: 0,
            quantity: 1,
            meals: null,
            macros: macrosData
        };
        tempData.push(obj);
        setMealPacks(tempData);
    };

    const handleDelete = (item, index) => {
        let tempData = [...mealPacks];
        tempData.splice(index, 1);
        setMealPacks(tempData);
        if (context.cartData.data?.[currentdate]?.packs?.find((f) => f.id === item.id)) {
            SetCartData(tempData);
        }
    };

    const handleSelectPack = (item, index, pack) => {
        let tempData = [...mealPacks];
        let obj = JSON.parse(JSON.stringify({ ...item, ...pack }));
        obj.totalPrice = pack.selling_price;
        obj.price = pack.selling_price;

        const categories = pack.number_of_meals_per_category?.split(',') ?? [];
        let position = 1;
        let mappedApiResponse = null;

        if (categories?.length > 0) {
            mappedApiResponse = categories.reduce((acc, meal) => {
                const parts = meal?.split(':');
                const [id, name, quantity] = parts;
                for (let i = 0; i < quantity; i++) {
                    (acc[id] = acc[id] || []).push({
                        id: id,
                        name: name,
                        ingredient_id: '',
                        ingredient_name: '',
                        is_new: '',
                        ingredient_image: '',
                        position: position,
                        is_default: 0,
                        portion_size_id: "",
                        portion_size_name: "",
                        price: 0,
                        macro_values: ""
                    });
                    position += 1
                }
                return acc;
            }, {});
        } else {
            mappedApiResponse = {
                "0": Array.from({ length: pack.number_of_meals }, (_, i) => i + 1).reduce((acc) => {
                    acc.push({
                        id: "0",
                        name: "",
                        ingredient_id: '',
                        ingredient_name: '',
                        is_new: '',
                        ingredient_image: '',
                        position: position,
                        is_default: 0,
                        portion_size_id: "",
                        portion_size_name: "",
                        price: 0,
                        macro_values: ""
                    });
                    position += 1
                    return acc;
                }, [])
            };
        }

        obj.meals = mappedApiResponse;
        tempData.splice(index, 1, obj);
        setMealPacks(tempData);
        SetCartData(tempData);
        setSelectPackModal({ show: false, data: null });
    };

    const handleRemoveMeal = (mealItem, i, item, index) => {
        let tempData = [...mealPacks];
        let obj = JSON.parse(JSON.stringify(item));
        let mealData = JSON.parse(JSON.stringify(obj.meals));
        let meal = JSON.parse(JSON.stringify(mealItem));
        meal.ingredient_id = '';
        meal.ingredient_name = '';
        meal.ingredient_image = '';
        meal.portion_size_id = "";
        meal.portion_size_name = "";
        meal.is_default = 0;
        meal.macro_values = "";
        meal.price = 0;

        mealData[meal.id].splice(i, 1, meal);

        const macroSums = {};

        mealData[meal.id].forEach(meal => {
            meal.macro_values?.split(';').forEach(pair => {
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
        });

        obj.macros.macros.forEach(macro => {
            macro.total = macroSums[macro.macro_id] ? macroSums[macro.macro_id].toFixed(macro.round_decimal) : "0";
        });

        obj.totalPrice = Number(obj.totalPrice) - mealItem.price;
        obj.meals = mealData;

        tempData.splice(index, 1, obj);
        setMealPacks(tempData);
        SetCartData(tempData);
    }

    const handleClearAll = (item, index) => {
        let tempData = [...mealPacks];
        let obj = JSON.parse(JSON.stringify(item));

        Object.keys(obj.meals)?.forEach((meal) =>
            obj.meals[meal] = obj.meals[meal]?.map((f) => ({
                ...f,
                ingredient_id: '',
                ingredient_name: '',
                ingredient_image: '',
                portion_size_id: "",
                portion_size_name: "",
                is_default: 0,
                price: 0,
                macro_values: ""
            }))
        )

        obj.macros.macros.forEach(macro => {
            macro.total = 0;
        });
        obj.totalPrice = obj.price;

        tempData.splice(index, 1, obj);
        SetCartData(tempData);
        setMealPacks(tempData);
    }

    const handleSelectMeal = ({ item, index }, type) => {
        let tempData = JSON.parse(JSON.stringify(mealPacks));
        let obj = JSON.parse(JSON.stringify(item));
        let price = 0;

        Object.keys(item.meals ?? {}).forEach((mealKey) => {
            price += item.meals[mealKey].reduce((acc, mealItem) => acc + Number(mealItem.price), 0);
        });
        obj.totalPrice = ((Number(obj.price) || 0) + price);

        tempData.splice(index, 1, obj);
        setMealPacks(tempData);
        SetCartData(tempData);

        if (AllItemsHaveIngredientId(item)) {
            setOpenSelectMealsModal({ show: false, data: null });
            setBeforeFinishingModal(true);
        }
    }

    const AllItemsHaveIngredientId = (item) => {
        for (const [key, value] of Object.entries(item.meals)) {
            const allHaveIngredientId = value.every(item => item.ingredient_id !== "");
            if (!allHaveIngredientId) {
                return false;
            }
        }
        return true;
    }

    const handleChangeQuantity = (item, index, btnType) => {
        let tempData = [...mealPacks];
        let obj = JSON.parse(JSON.stringify(item));
        if (btnType === 'increment') obj.quantity = obj.quantity + 1;
        else obj.quantity = obj.quantity - 1;

        tempData.splice(index, 1, obj);
        setMealPacks(tempData);
        SetCartData(tempData);
        setSelectPackModal({ show: false, data: null });
    };

    const GetRandomMeals = async (item, index) => {
        if (AllItemsHaveIngredientId(item)) setBeforeFinishingModal(true);
        else {
            const response = await PostApi(API_PATH_USER.GetRandomMeals, {
                meal_pack_id: item.meal_pack_id,
                meal_menu_date: `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`,
                kitchen_location_id: context?.selected_location.kitchen_location_id
            });

            if (response.statusCode === 200) {
                let tempData = JSON.parse(JSON.stringify(mealPacks));
                const mappedApiResponse = response.data.flat();
                const macroSums = {};

                let updatedItem = JSON.parse(JSON.stringify(item));
                Object.keys(updatedItem.meals)?.forEach((f) =>
                    updatedItem.meals[f].forEach((meal, i) => {
                        if (mappedApiResponse && mappedApiResponse.length > 0 && meal.ingredient_id === "") {
                            const ingredientIndex = meal.position - 1;
                            const ingredient = mappedApiResponse[ingredientIndex % mappedApiResponse.length];

                            ingredient.macro_values?.split(';').forEach(pair => {
                                const [macroId, valueStr] = pair?.split(':');
                                macroSums[macroId] = (macroSums[macroId] || 0) + parseFloat(valueStr);
                            });

                            Object.assign(meal, {
                                ingredient_id: ingredient.ingredient_id,
                                ingredient_name: ingredient.display_name,
                                is_new: ingredient.is_new,
                                ingredient_image: ingredient.ingredient_image,
                                price: ingredient.extra_price,
                                portion_size_id: ingredient.portion_size_id,
                                portion_size_name: ingredient.portion_size_name,
                                is_default: ingredient.is_default_portion_size,
                                macro_values: ingredient.macro_values
                            });
                        }
                    })
                );

                updatedItem.macros.macros.forEach(macro => {
                    macro.total = macroSums[macro.macro_id] ? macroSums[macro.macro_id].toFixed(macro.round_decimal) : "0";
                });

                let totalPrice = 0;
                Object.keys(updatedItem.meals ?? {}).forEach((mealKey) => {
                    totalPrice += updatedItem.meals[mealKey].reduce((acc, mealItem) => acc + Number(mealItem.price), 0);
                });
                updatedItem.totalPrice = ((Number(updatedItem.price) || 0) + totalPrice).toFixed(2);

                const index = tempData.findIndex(pack => pack.id === updatedItem.id);
                if (index !== -1) {
                    tempData[index] = updatedItem;
                }

                setMealPacks(tempData);
                SetCartData(tempData);
                if (AllItemsHaveIngredientId(updatedItem)) setBeforeFinishingModal(true);
            }
        }
    };

    const SetCartData = (data) => {
        let cart = { ...context.cartData };
        let cartdata = { ...cart.data };
        let currentdata = { ...cartdata[currentdate] };

        Object.assign(currentdata, {
            packs: data,
            date: selectedDate
        });
        cartdata[currentdate] = currentdata;

        if ((!currentdata.meals || currentdata.meals?.length === 0) && (!currentdata.packs || currentdata.packs?.length === 0)) {
            delete cartdata[currentdate]
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
    }

    function findFirstIdWithEmptyIngredientId(data) {
        for (const [key, value] of Object.entries(data)) {
            const hasEmptyIngredientId = value.some(item => item.ingredient_id === "");
            if (hasEmptyIngredientId) {
                return key;
            }
        }
        return null;
    }

    return (
        <div className="meal-packs-main meals-by-unit-main">
            <Topbar />
            <Landing>
                <TitleHeader title="Meal Packs" state={setOpenHowToModal} link="https://www.youtube.com/embed/d6mPVqHKrQ4" />
                <div className="container-fluid">
                    <div className="container-user">
                        <div className="container_datesmeals">
                            <div className="row">
                                <div className="col-12">
                                    <h3 className="top_order_titles font-size-18">1. Select a Date</h3>
                                </div>
                            </div>
                            <SelectDateTable state={{ selectedDate, setSelectedDate }} />
                        </div>

                        <div className="base_wrapper spacer-top">
                            {mealPacks?.map((item, index) => {
                                return (
                                    <div className="wrap-packs" key={item.id}>
                                        <div className="wrap-title">
                                            <div className="row align-items-center">
                                                <div className="col-6">
                                                    <span className="h3 mt-3 text-white font-size-24">Meal Pack #{item.position} </span>
                                                    <div className="d-inline-block align-bottom">
                                                        <div className="selector input-wrapper text-center">
                                                            <button type="button" disabled={item.quantity === 1} className={`input-number-decrement bg-white ${item.quantity === 1 ? 'disabled' : ''}`} onClick={(e) => handleChangeQuantity(item, index, 'decrement')}>
                                                                –
                                                            </button>
                                                            <input className="input-number p-0" type="number" readOnly value={item.quantity} />
                                                            <button type="button" className="input-number-increment  bg-white" onClick={(e) => handleChangeQuantity(item, index, 'increment')}>
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div id="Tooltip-quantity" className="d-inline-flex">
                                                        <i className="bx -help-circle text-dark fs-4 cursor-pointer px-1"></i>
                                                    </div>
                                                    <Tooltip
                                                        isOpen={tooltipOpen === 'Tooltip-quantity'}
                                                        placement={'right'}
                                                        target="Tooltip-quantity"
                                                        toggle={() => toggle('Tooltip-quantity')}
                                                    >
                                                        Quantity for this pack
                                                    </Tooltip>
                                                </div>
                                                <div className="col-6 text-end">
                                                    <button className="btn back_danger" onClick={() => handleDelete(item, index)}>
                                                        <i className="bx bx-trash mx-1"></i>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="wrap-body px-3">
                                            <div>
                                                <h3 className="font-size-18">2. Choose your meal pack</h3>
                                            </div>
                                            {item.meal_pack_id !== '' ? (
                                                <div className="row">
                                                    <div className="col-12 col-md-5 my-2">
                                                        <div
                                                            className="modal_pack_card"
                                                            onClick={() =>
                                                                setSelectPackModal({ show: true, data: { item, index, array: mealPacksData } })
                                                            }
                                                        >
                                                            <div className="horizontal-card">
                                                                <div className="horizontal-card-image">
                                                                    <img
                                                                        width="100%"
                                                                        height="100%"
                                                                        src={item.meal_pack_image ?? Placeholder}
                                                                        alt={item.meal_pack_name}
                                                                        title={item.meal_pack_name}
                                                                        onError={(e) => (e.target.src = Placeholder)}
                                                                    />
                                                                </div>
                                                                <div className="horizontal-card-details w-100">
                                                                    <div className="badge square_badge">
                                                                        <span className="">
                                                                            <i className="fas fa-tags hidden"></i>${item.price}
                                                                        </span>
                                                                    </div>
                                                                    <div className="card_title mt-1 font-size-22 fw-normal">
                                                                        {item.meal_pack_name}
                                                                    </div>
                                                                    {
                                                                        item.is_default_portion !== 1 &&
                                                                        <div className="d-flex portion-border-left mt-1 primary-color-cls">
                                                                            {item.portion_size_name}
                                                                        </div>
                                                                    }
                                                                    <button className="btn primary-bg-cls pack-change-btn py-1" type="button">
                                                                        <i className="fas fa-pencil-alt me-1 font-size-11"></i>
                                                                        Change
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="row">
                                                    {mealPacksData?.map((pack) => {
                                                        return (
                                                            <div
                                                                className="col-12 col-md-4 my-2"
                                                                key={pack.meal_pack_id}
                                                                onClick={() => handleSelectPack(item, index, pack)}
                                                            >
                                                                <div className="modal_pack_card">
                                                                    <div className="horizontal-card">
                                                                        <div className="horizontal-card-image">
                                                                            <img
                                                                                width="100%"
                                                                                height="100%"
                                                                                src={pack.meal_pack_image ?? Placeholder}
                                                                                alt={pack.meal_pack_name}
                                                                                title={pack.meal_pack_name}
                                                                                onError={(e) => (e.target.src = Placeholder)}
                                                                            />
                                                                        </div>
                                                                        <div className="horizontal-card-details w-100">
                                                                            <div className="badge square_badge">
                                                                                <span className="">
                                                                                    <i className="fas fa-tags hidden me-1"></i>${pack.selling_price}
                                                                                </span>
                                                                            </div>
                                                                            <div className="card_title mt-1">{pack.meal_pack_name}</div>
                                                                            {
                                                                                pack.is_default_portion !== 1 &&
                                                                                <div className="d-flex portion-border-left mt-1 primary-color-cls">
                                                                                    {pack.portion_size_name}
                                                                                </div>
                                                                            }
                                                                            <div className="card_description mt-1">{pack.meal_pack_description}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {item.meal_pack_id !== '' && (
                                                <>
                                                    <div>
                                                        <h3 className="font-size-18">3. Select your meals below or choose random.</h3>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-12 col-md-4 my-2">
                                                            <button
                                                                className="w-100 new_button_square_big primary-bg-cls"
                                                                onClick={() => {
                                                                    if (AllItemsHaveIngredientId(item)) setBeforeFinishingModal(true);
                                                                    else setOpenSelectMealsModal({ show: true, data: { item, index }, meal_pack_category_id: findFirstIdWithEmptyIngredientId(item.meals) });
                                                                }}
                                                            >
                                                                <i className="fas fa-object-group me-1"></i>
                                                                Manually select meals
                                                            </button>
                                                        </div>
                                                        <div className="col-12 col-md-4 my-2">
                                                            <button
                                                                className="w-100 new_button_square_big bg-dark"
                                                                onClick={() => GetRandomMeals(item, index)}
                                                            >
                                                                <i className="fa fa-random me-1"></i>
                                                                Randomly select meals
                                                            </button>
                                                        </div>
                                                        <div className="col-12 col-md-4 clear-selection my-2">
                                                            <button className="w-100 new_button_square_big bg-transparent border-dark text-dark" onClick={() => handleClearAll(item, index)}>
                                                                <i className="fas fa-eraser me-1"></i>
                                                                Clear all selection
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-lg-8 col-12">
                                                            <div className="row">
                                                                {Object.keys(item.meals)?.map((f) => item.meals[f]?.map((meal, i) => {
                                                                    return (
                                                                        <div
                                                                            className="col-12 col-lg-6 my-1"
                                                                            key={i}
                                                                            onClick={() => setOpenSelectMealsModal({ show: true, data: { item, index, meal, i }, meal_pack_category_id: findFirstIdWithEmptyIngredientId(item.meals) ?? meal.id })}
                                                                        >
                                                                            {meal.ingredient_id !== '' ? (
                                                                                <div className="card-food">
                                                                                    <div className="food-img">
                                                                                        <img
                                                                                            width="100%"
                                                                                            height="100%"
                                                                                            src={meal.ingredient_image ?? Placeholder}
                                                                                            alt={meal.ingredient_name}
                                                                                            onError={(e) => e.target.src = Placeholder}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="food-info">
                                                                                        <div className="food-name ellipsis">{meal.ingredient_name}</div>
                                                                                        <div className="tags">
                                                                                            {meal.price > 0 && <span className="clean-badge bg-warning"><i className="fas fa-tags"></i>+${meal.price}
                                                                                            </span>}
                                                                                            {meal.is_new === 1 && <span className="clean-badge">New Item</span>}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="del-ingredient position-absolute top-0 start-100 translate-middle" onClick={(e) => { e.stopPropagation(); handleRemoveMeal(meal, i, item, index); }}>
                                                                                        <i className="far fa-trash-alt"></i>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="selectMealBox text-center">
                                                                                    <i className="fas fa-plus-circle me-1"></i>
                                                                                    Select {meal.name}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }))}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4 col-12 my-4">
                                                            <MacroGraph setSeeMoreMacros={setSeeMoreMacros} macrosData={item.macros} />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="row justify-content-between">
                            <div className="col-lg-2 col-md-3 col-sm-12 px-0">
                                <button className="w-100 btn primary-bg-cls my-2" type="button" onClick={handleAddMealPack}>
                                    <i className="fa fa-plus-circle me-2 fs-5 align-middle" aria-hidden="true"></i>
                                    Add another pack
                                </button>
                            </div>
                            <div className="col-lg-2 col-md-3 col-sm-12 text-end px-0">
                                <Link className="w-100 btn primary-bg-cls my-2" to="/cart">
                                    <i className="fas fa-shopping-basket me-2 fs-5 align-middle"></i>
                                    Continue to Cart
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </Landing>

            {openHowToModal.show && <HowToModal data={openHowToModal} close={setOpenHowToModal} />}
            {(seeMoreMacros.show || selectPackModal.show || openSelectMealsModal.show || beforeFinishingModal) && (
                <Modals
                    states={{
                        seeMoreMacros,
                        selectPackModal,
                        openSelectMealsModal,
                        selectedDate,
                        beforeFinishingModal,
                        setBeforeFinishingModal,
                        setOpenSelectMealsModal,
                        setSelectPackModal,
                        setSeeMoreMacros,
                    }}
                    functions={{
                        handleSelectPack,
                        handleSelectMeal,
                        handleAddMealPack
                    }}
                />
            )}
        </div>
    );
}
