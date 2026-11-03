import React, { useContext, useEffect, useState } from 'react';
import Topbar from '../../../pages/common/Topbar';
import Landing from '../../../pages/common/Landing';
import TitleHeader from '../../components/TitleHeader';
import { Nav, NavItem, TabContent, TabPane, Tooltip } from 'reactstrap';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import Slider from 'react-slick';
import { Context } from '../../../context/GeneralContext';
import { API_PATH_USER } from '../../../const';
import { PostApi } from '../../../services/ApiService';
import Placeholder from '../../../admin/assets/images/placeholder.png';
import { FixedDecimal } from '../../../helpers/func_helper';

export default function CurrentMenuDetails() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const context = useContext(Context);
    const [menuDetailsFinal, setMenuDetailsFinal] = useState({
        mealDetails: [],
        mealCategories: [],
        mealMacros: { default: [], other: null },
        portionPrices: [],
        imagesDetail: [],
    });
    const [selectedDate, setSelectedDate] = useState(null);
    const [activeTab, setActiveTab] = useState("1");
    const [isCollapse, setIsCollapse] = useState(false);
    const [isDrp, setIsDrp] = useState(false);
    const [nav1, setNav1] = useState(null);
    const [nav2, setNav2] = useState(null);
    const [menuDetailsData, setMenuDetailsData] = useState(null);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const currentdate = `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`;

    useEffect(() => {
        const handleClick = (event) => {
            if (!event.target.closest('#date-button-drp')) {
                setIsDrp(false);
            }
        };
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    useEffect(() => {
        if (id) GetMealsDetailsById();
    }, [id])

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
        if (selectedDate) navigate(`/currentmenu/${id}?dd=${currentdate}`);
    }, [currentdate]);

    useEffect(() => {
        if (!selectedDate && context?.selected_location) GetDatesOneTimeOrder();
    }, [context?.selected_location, selectedDate]);

    useEffect(() => {
        if (menuDetailsData) {
            const { meal_categories, meal_detail, meal_macros, portion_prices, images_detail } = menuDetailsData;
            const resultDefault = meal_macros?.filter((f) => f.is_default === 1);
            const resultOther = meal_macros
                ?.filter((f) => f.is_default !== 1)
                ?.reduce((acc, obj) => {
                    const key = obj.portion_size_name;
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    acc[key].push(obj);
                    return acc;
                }, {});
            let imagesArr = images_detail?.map((f) => f.image_name);

            let cartMeal = context.cartData.data?.[currentdate]?.meals?.filter((f) => f.ingredient_id === meal_detail?.[0]?.ingredient_id);

            setMenuDetailsFinal({
                imagesDetail: [meal_detail?.[0]?.ingredient_image, ...imagesArr],
                mealCategories: meal_categories,
                mealMacros: { other: resultOther, default: resultDefault },
                portionPrices: portion_prices?.map((f) => {
                    let find = cartMeal?.find((c) => f.portion_size_id === c?.portion_size_id);
                    return ({ ...f, quantity: find ? find.quantity : 0 });
                }),
                mealDetails: meal_detail?.[0],
            })

        }
    }, [menuDetailsData, selectedDate])

    const mainSettings = {
        arrows: false,
        dots: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        className: 'no-dots',
        ref: (slider) => (setNav1(slider)),
        asNavFor: nav2
    }

    const navSettings = {
        arrows: false,
        dots: false,
        speed: 500,
        slidesToScroll: 1,
        focusOnSelect: true,
        ref: (slider) => (setNav2(slider)),
        asNavFor: nav1,
    }

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

    const GetMealsDetailsById = async () => {
        const response = await PostApi(API_PATH_USER.GetMealsDetailsById, { ingredient_id: id });
        if (response.statusCode === 200) {
            setMenuDetailsData(response.data);
        }
    }

    const handleChangeQuantity = (item, index, btnType) => {
        let tempData = [...menuDetailsFinal.portionPrices];
        let obj = { ...item };
        if (btnType === 'increment') { obj.quantity = obj.quantity + 1; }
        else { obj.quantity = obj.quantity - 1; }
        tempData.splice(index, 1, obj);

        SetCartData(menuDetailsFinal, obj, btnType)
        setMenuDetailsFinal((prevState) => ({ ...prevState, portionPrices: tempData }));
    }

    const SetCartData = (data, item, btnType) => {
        let cart = { ...context.cartData };
        let cartdata = { ...cart.data };
        let currentdata = { ...cartdata[currentdate] };
        let meals = [...currentdata.meals ?? []];

        let obj = {
            ingredient_id: data.mealDetails.ingredient_id,
            ingredient_name: data.mealDetails.display_name,
            portion_size_id: item.portion_size_id,
            portion_size_name: item.portion_size_name,
            is_default: item.is_default,
            price: item.price,
            quantity: item.quantity
        };

        let findIndex = meals.findIndex(f => f.ingredient_id === obj.ingredient_id && f.portion_size_id === obj.portion_size_id);

        if (btnType === 'increment') {
            if (findIndex !== -1) {
                meals[findIndex].quantity += 1;
            } else {
                meals.push(obj);
            }
        } else {
            if (findIndex !== -1 && meals[findIndex].quantity > 1) {
                meals[findIndex].quantity -= 1;
            } else if (findIndex !== -1) {
                meals.splice(findIndex, 1);
            }
        }

        currentdata.meals = meals;
        currentdata.date = selectedDate;
        cartdata[currentdate] = currentdata;

        if ((!currentdata.packs || currentdata.packs?.length === 0) && (!currentdata.meals || currentdata.meals?.length === 0)) {
            delete cartdata[currentdate]
        }

        cart.data = cartdata;

        let totalItemsAllDates = 0;
        let totalPriceAllDates = 0;

        Object.keys(cart.data).forEach(date => {
            const mealsForDate = cart.data[date].meals ?? [];
            totalItemsAllDates += mealsForDate.reduce((acc, meal) => acc + meal.quantity, 0);
            totalPriceAllDates += mealsForDate.reduce((acc, meal) => acc + (Number(meal.price) * meal.quantity), 0);

            const packsForDate = cart.data[date].packs ?? [];
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

    const toggle = (key) => {
        setTooltipOpen(tooltipOpen === key ? '' : key);
    };

    return (
        <div className="meals-by-unit-main currentmenu-details">
            <Topbar />
            <Landing>
                <TitleHeader title={menuDetailsFinal.mealDetails?.display_name} />
                <div className="page-content-wrapper">
                    <div className="container-fluid">
                        <div className="container-user">
                            <div className="row spacer_top equal">
                                <div className="col-md-6 col-sm-12 ps-0">
                                    <div className="currentmenu-details_item-gallery h-100">
                                        <div className='marginBottom'>
                                            <Slider {...mainSettings}>
                                                {menuDetailsFinal.imagesDetail?.map((f, index) => {
                                                    return (
                                                        <img className="recipe-image-card" key={index} src={f} onError={(e) => e.target.src = Placeholder} />
                                                    )
                                                })}
                                            </Slider>
                                        </div>

                                        <div className='recipe-img-slider m-0'>
                                            <Slider {...{ slidesToShow: (menuDetailsFinal.imagesDetail?.length > 4 ? 4 : menuDetailsFinal.imagesDetail?.length), ...navSettings }} className=''>
                                                {menuDetailsFinal.imagesDetail?.map((f, index) => {
                                                    return (
                                                        <img key={index} src={f} onError={(e) => e.target.src = Placeholder} />
                                                    )
                                                })}
                                            </Slider>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6 col-sm-12 text-center text-md-start mt-3 mt-md-0">
                                    <div className="currentmenu-details_item-title mb-3">
                                        <h1 className="my-0 font-size-28">{menuDetailsFinal.mealDetails?.display_name}</h1>
                                    </div>

                                    <div className="currentmenu-details_item-categories mb-3 justify-content-start justify-content-md-center">
                                        {
                                            menuDetailsFinal.mealCategories?.map((item, i) => (
                                                <React.Fragment key={`${i}-${item.meal_category_name}`}>
                                                    <div id={`Tooltip-${item.meal_category_name?.replaceAll(' ', '_')}`} className="col-12">
                                                        <span className="tagLetters tooltip2 small categorymeal_entree" style={{ backgroundColor: item.bg_color ?? '', color: item.text_color ?? '' }}>
                                                            {item.meal_category_name?.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <Tooltip
                                                        isOpen={tooltipOpen === item.meal_category_name}
                                                        placement={'right'}
                                                        target={`Tooltip-${item.meal_category_name?.replaceAll(' ', '_')}`}
                                                        toggle={() => toggle(item.meal_category_name)}
                                                    >
                                                        {item.meal_category_name}
                                                    </Tooltip>
                                                </React.Fragment>
                                            ))
                                        }
                                    </div>
                                    <div className="currentmenu-details_item-description mb-3">
                                        {menuDetailsFinal.mealDetails?.meal_description}
                                    </div>
                                    <div className="currentmenu-details_item-portions mb-3">
                                        <p className="m-0">
                                            <b>Available sizes:</b>
                                        </p>
                                        <span>{menuDetailsFinal.portionPrices?.map((item) => item.portion_size_name)?.join(', ')}</span>
                                    </div>

                                    <div className="sprwt_academy_help_card spacer_top mb-3 back_admin" onClick={() => setIsCollapse(!isCollapse)}>
                                        <div className="header_title text-start">
                                            <span className="material-icons me-2">
                                                <i className='bx bxs-plus-circle'></i>
                                            </span>
                                            <div>
                                                <div className="help_title">Add meals to your shopping cart</div>
                                                <div className="help_description">Order as À la Cart</div>
                                            </div>
                                            <span className="material-icons ms-auto">
                                                <i className='bx bx-chevron-down'></i>
                                            </span>
                                        </div>
                                    </div>

                                    <div className={isCollapse ? '' : 'collapse'}>
                                        <div className="currentmenu-details_item-mealsbyunit">
                                            <div className="currentmenu-details_item-mealsbyunit_pickdate w-100 position-relative">
                                                <div className="currentmenu-details_item-mealsbyunit_pickdate-title">
                                                    <h2 className="my-4">When would you like to receive your order?</h2>
                                                </div>
                                                <div className={`position-relative ${isDrp ? 'open' : ''}`}>
                                                    <button
                                                        id={'date-button-drp'}
                                                        className="btn button_go_wrapper button_go_wrapper-small primary-bg-cls dropdown-toggle dateControl mx-auto mx-md-0"
                                                        type="button"
                                                        onClick={() => setIsDrp(!isDrp)}
                                                    >
                                                        <span className="date_wrapper">{selectedDate?.shortName} {selectedDate?.date}, {selectedDate?.year} </span>
                                                        <i className="fas fa-chevron-down"></i>
                                                    </button>

                                                    <div className="dropdown-menu">
                                                        <ul className="date_select-dropdown__allDelivery-wrapper px-0">
                                                            <li className="date_select-dropdown__month-wrapper">
                                                                {context.datesArray
                                                                    ?.filter((value, index, self) =>
                                                                        index === self.findIndex((t) => (
                                                                            t.month === value.month && t.year === value.year
                                                                        ))
                                                                    )
                                                                    ?.map((monthItem) => {
                                                                        const monthYearKey = `${monthItem.month}-${monthItem.year}`;
                                                                        return (
                                                                            <React.Fragment key={monthYearKey}>
                                                                                <div className="date_select-dropdown__month-text">{monthItem.name} {monthItem.year}</div>
                                                                                <ul className="date_select-dropdown__day-wrapper px-0">
                                                                                    {
                                                                                        context.datesArray?.map((item) => (
                                                                                            <li
                                                                                                key={item.id}
                                                                                                className={`date_select-dropdown__day-text ${selectedDate?.id === item.id ? 'active' : ''}`}
                                                                                                onClick={(e) => { e.stopPropagation(); setSelectedDate(item); setIsDrp(false); }}
                                                                                            >
                                                                                                {item.day} {item.date} {item.name} {item.year}
                                                                                            </li>
                                                                                        ))
                                                                                    }
                                                                                </ul>
                                                                            </React.Fragment>
                                                                        );
                                                                    })
                                                                }
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="currentmenu-details_item-mealsbyunit">
                                                <div className="currentmenu-details_item-mealsbyunit_portions">
                                                    <div className="currentmenu-details_item-mealsbyunit_portions-title">
                                                        <h2 className="mb-3">Place your order:</h2>
                                                    </div>
                                                    <div className="currentmenu-details_item-mealsbyunit_portions-wrapper">
                                                        {
                                                            menuDetailsFinal.portionPrices?.map((item, index) => {
                                                                return (
                                                                    <div className="currentmenu-details_item-mealsbyunit_portions-item" key={item.portion_size_id}>
                                                                        <div className="col-md-12 col-sm-12  tag-container">
                                                                            <p className="tag my-1">{item.portion_size_name} | ${item.price}</p>
                                                                        </div>
                                                                        <div className="currentmenu-details_item-mealsbyunit_portions-item_counters">
                                                                            <div className="selector input_wrapper">
                                                                                <button type="button" className={`input-number-decrement primary-color-cls ${item.quantity === 0 ? 'disabled' : ''}`} onClick={() => handleChangeQuantity(item, index, 'decrement')}>
                                                                                    <i className="fas fa-minus"></i>
                                                                                </button>
                                                                                <input className="input-number quantity mealQuantity mealQuantityModal_1 mealQuantity_43 mealQuantity_43_0" type="number" value={item.quantity} readOnly />
                                                                                <button type="button" className="input-number-increment primary-color-cls" onClick={() => handleChangeQuantity(item, index, 'increment')}>
                                                                                    <i className="fas fa-plus"></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="currentmenu-details_item-tabs mt-5">
                                <Nav className="nav-new flex-column flex-md-row meal-nav-tabs" tabs>
                                    {
                                        menuDetailsFinal.mealDetails?.ingredients !== "" &&
                                        <NavItem className={`nav-item ${activeTab === "1" ? 'active' : ''}`}>
                                            <NavLink className="" onClick={() => setActiveTab("1")}>
                                                Ingredients
                                            </NavLink>
                                        </NavItem>
                                    }
                                    <NavItem className={`nav-item ${activeTab === "2" ? 'active' : ''}`}>
                                        <NavLink className="" onClick={() => setActiveTab("2")}>
                                            Allergens
                                        </NavLink>
                                    </NavItem>
                                    <NavItem className={`nav-item ${activeTab === "3" ? 'active' : ''}`}>
                                        <NavLink className="" onClick={() => setActiveTab("3")}>
                                            Macros
                                        </NavLink>
                                    </NavItem>
                                    <NavItem className={`nav-item ${activeTab === "4" ? 'active' : ''}`}>
                                        <NavLink className="" onClick={() => setActiveTab("4")}>
                                            Instructions
                                        </NavLink>
                                    </NavItem>
                                </Nav>

                                <TabContent className="" activeTab={activeTab}>
                                    {menuDetailsFinal.mealDetails?.ingredients !== "" &&
                                        <TabPane className="" tabId="1">
                                            <p className="ingredients">
                                                {menuDetailsFinal.mealDetails?.ingredients}
                                            </p>
                                        </TabPane>
                                    }

                                    <TabPane className="" tabId="2">
                                        {menuDetailsFinal.mealDetails?.allergens ?
                                            menuDetailsFinal.mealDetails?.allergens?.split(',')?.map((alrgn) => {
                                                let name = alrgn?.split(':')?.[1]
                                                return name;
                                            })?.join(', ') :
                                            'None'
                                        }
                                    </TabPane>

                                    <TabPane className="currentmenu-details_item-tabs-macros" tabId="3">
                                        <div className="meal-view calories_aside justify-content-center justify-content-md-start">
                                            <div className="portion-wrapper">
                                                <span className="mb-2">
                                                    <b>Regular portion</b>
                                                </span>
                                                <ul>
                                                    {
                                                        menuDetailsFinal.mealMacros.default?.map((item, index) => {
                                                            return (
                                                                <li key={index}>
                                                                    <span>{item.macro_name}:</span>
                                                                    <span>
                                                                        <b>{FixedDecimal(item.quantity)}{item.macro_name !== "Calories" && item.suffix}</b>
                                                                        {
                                                                            item.macro_name === "Calories" &&
                                                                            <span className="icon icon-calories ms-1">
                                                                                <i className="fas fa-fire"></i>
                                                                            </span>
                                                                        }
                                                                    </span>
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                            {menuDetailsFinal.mealMacros.other && Object.keys(menuDetailsFinal.mealMacros.other)?.map((name, index) => {
                                                return (
                                                    <div className="portion-wrapper" key={index}>
                                                        <span>
                                                            <b>{name} portion</b>
                                                        </span>
                                                        <ul>
                                                            {menuDetailsFinal.mealMacros.other[name]?.map((item) => {
                                                                return (
                                                                    <li key={item.macro_id}>
                                                                        <span>{item.macro_name}:</span>
                                                                        <span>
                                                                            <b>{FixedDecimal(item.quantity)}{item.macro_name !== "Calories" && item.suffix}</b>
                                                                            {
                                                                                item.macro_name === "Calories" &&
                                                                                <span className="icon icon-calories ms-1">
                                                                                    <i className="fas fa-fire"></i>
                                                                                </span>
                                                                            }
                                                                        </span>
                                                                    </li>
                                                                )
                                                            })}
                                                        </ul>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </TabPane>

                                    <TabPane className="" tabId="4">
                                        {menuDetailsFinal.mealDetails?.meal_heating_instruction && <div className="col-12">
                                            <p>
                                                <b>Heating Instructions: </b>
                                                {menuDetailsFinal.mealDetails?.meal_heating_instruction}
                                            </p>
                                        </div>}
                                        {menuDetailsFinal.mealDetails?.meal_packaging_instruction && <div className="col-12">
                                            <p>
                                                <b>Packaging Instructions: </b>
                                                {menuDetailsFinal.mealDetails?.meal_packaging_instruction}
                                            </p>
                                        </div>}
                                        {menuDetailsFinal.mealDetails?.cooking_instructions && <div className="col-12">
                                            <p>
                                                <b>Cooking Instructions: </b>
                                                {menuDetailsFinal.mealDetails?.cooking_instructions}
                                            </p>
                                        </div>}
                                        {/* <p className="instructions">Enter in microwave heat at 2 minutes at 70 percent</p> */}
                                    </TabPane>
                                </TabContent>
                            </div>
                        </div>
                    </div>
                </div>
            </Landing>
        </div>
    );
}
