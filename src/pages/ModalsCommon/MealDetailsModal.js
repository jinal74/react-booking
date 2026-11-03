import React, { useContext, useEffect, useState } from 'react';
import { Modal, ModalBody, Tooltip } from 'reactstrap';
import { PostApi } from '../../services/ApiService';
import { API_PATH_USER } from '../../const';
import Placeholder from '../../admin/assets/images/placeholder.png';
import { FixedDecimal } from '../../helpers/func_helper';
import Slider from 'react-slick';
import { Context } from '../../context/GeneralContext';

export default function MealDetailsModal({ data, close, GetMacrosDetails, info, selectedDate }) {
    const context = useContext(Context);
    const [menuDetailsFinal, setMenuDetailsFinal] = useState({
        mealDetails: [],
        mealCategories: [],
        mealMacros: { default: [], other: null },
        portionPrices: [],
        imagesDetail: [],
    });
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [togglePortions, setTogglePortions] = useState(false);
    const [menuDetailsData, setMenuDetailsData] = useState(null);
    const [nav1, setNav1] = useState(null);
    const [nav2, setNav2] = useState(null);

    const currentdate = `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`;

    useEffect(() => {
        if (data.id) GetMealsDetailsById();
    }, [data.id])

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
    }, [menuDetailsData])

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

    const GetMealsDetailsById = async () => {
        const response = await PostApi(API_PATH_USER.GetMealsDetailsById, { ingredient_id: data.id });
        if (response.statusCode === 200) {
            setMenuDetailsData(response.data);
        }
    }

    const toggle = (key) => {
        setTooltipOpen(tooltipOpen === key ? '' : key);
    };

    const handleChangeQuantity = (item, index, btnType) => {
        let tempData = [...menuDetailsFinal.portionPrices];
        let obj = { ...item };
        if (btnType === 'increment') { obj.quantity = obj.quantity + 1; }
        else { obj.quantity = obj.quantity - 1; }
        tempData.splice(index, 1, obj);

        if (GetMacrosDetails) { GetMacrosDetails(tempData, menuDetailsData.meal_macros); }
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

    return (
        <div className="">
            <Modal isOpen={data.show} centered className="modal modal-lg meal-details-main position-relative">
                <button
                    type="button"
                    onClick={() => {
                        close({ show: false, id: '' });
                    }}
                    className="close end-0"
                    data-dismiss="modal"
                    aria-label="Close"
                >
                    <i className='mdi mdi-close'></i>
                </button>
                <ModalBody className='p-0'>
                    <div className="meal-details-mdl">
                        <div className="d-flex flex-wrap">
                            <div className="col-12 col-md-6">
                                <div className="half-img-cls">
                                    <Slider {...mainSettings}>
                                        {menuDetailsFinal.imagesDetail?.map((f, index) => {
                                            return (
                                                <img key={index} className="recipe-image-card" src={f} onError={(e) => e.target.src = Placeholder} />
                                            )
                                        })}
                                    </Slider>

                                    {
                                        menuDetailsFinal.imagesDetail?.length > 1 &&
                                        <div className='recipe-img-slider'>
                                            <Slider {...{ slidesToShow: (menuDetailsFinal.imagesDetail?.length > 4 ? 4 : menuDetailsFinal.imagesDetail?.length), ...navSettings }}>
                                                {menuDetailsFinal.imagesDetail?.map((f, index) => {
                                                    return (
                                                        <img key={index} src={f} onError={(e) => e.target.src = Placeholder} />
                                                    )
                                                })}
                                            </Slider>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="col-12 col-md-6 px-3">
                                <div className="fixed-content-sm">
                                    <div className="d-flex border-bottom">
                                        <div className="col-md-12 col-sm-12">
                                            <h2>{menuDetailsFinal.mealDetails?.display_name}</h2>
                                            <p className="mb-0">
                                                {menuDetailsFinal.mealDetails?.meal_description}
                                            </p>
                                            <div className="tag-container d-flex align-items-center flex-wrap col-12 ps-0">
                                                <div>
                                                    {menuDetailsFinal.mealDetails?.is_new == 1 &&
                                                        <span className="meal-recipe-tag ms-0 py-1 me-1" style={{ backgroundColor: '#ff8400' }}>New Item</span>
                                                    }
                                                    {menuDetailsFinal.mealDetails?.is_chef_fav == 1 &&
                                                        <span className="meal-recipe-tag ms-0 py-1 me-1" style={{ backgroundColor: '#f70000' }}>Chef's Favorite</span>
                                                    }
                                                    {
                                                        menuDetailsFinal.mealCategories?.map((item, i) => (
                                                            <React.Fragment key={`${i}-${item.meal_category_name}`}>
                                                                <span
                                                                    id={`Tooltip-${item.meal_category_name?.replaceAll(' ', '_')}`}
                                                                    style={{ backgroundColor: item.bg_color ?? '', color: item.text_color ?? '' }}
                                                                    className="tagLetters"
                                                                >
                                                                    {item.meal_category_name?.charAt(0)}
                                                                </span>
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
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        !info &&
                                        <div className="d-flex">
                                            <div className="portions-wrapper col-sm-12 text-center">
                                                <b>Available Portions</b>
                                                {
                                                    menuDetailsFinal.portionPrices?.map((item, index) => {
                                                        return (
                                                            <div className="regular-wrapper" key={item.portion_size_id}>
                                                                <div className="col-sm-12 tag-container mb-0">
                                                                    <div className="col-sm-12 text-center">
                                                                        <p className="tag">{item.portion_size_name} | ${item.price} </p>
                                                                    </div>
                                                                    <div className="col-sm-12">
                                                                        <div className="selector input-wrapper text-center">
                                                                            <button type="button" className={`input-number-decrement primary-color-cls ${item.quantity === 0 ? 'disabled' : ''}`} onClick={() => handleChangeQuantity(item, index, 'decrement')}>
                                                                                –
                                                                            </button>
                                                                            <input className="input-number" type="number" readOnly value={item.quantity} />
                                                                            <button type="button" className="input-number-increment primary-color-cls" onClick={() => handleChangeQuantity(item, index, 'increment')}>
                                                                                +
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    }
                                    <div className="row border-bottom">
                                        <div className="col-md-12 col-sm-12">
                                            <div className="d-flex bg-light d-block rounded px-2 mt-2">
                                                <div className="col-md-6 col-sm-6">
                                                    <p className="text-uppercase my-2">
                                                        <b>Total Calories</b>
                                                    </p>
                                                </div>
                                                <div className="col-md-6 col-sm-6 text-end">
                                                    <p className="pull-right my-2">
                                                        <i className="fas fa-fire"></i> <b>{FixedDecimal(menuDetailsFinal.mealMacros.default?.find((f) => f.macro_name === "Calories")?.quantity)}</b> Calories
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="row mt-1">
                                                {
                                                    menuDetailsFinal.mealMacros.default?.map((item, index) => {
                                                        if (item.macro_name !== "Calories") return (
                                                            <div className="col-md-3 col-sm-3 text-center" key={item.macro_id}>
                                                                <b>{FixedDecimal(item.quantity)} {item.suffix}</b>
                                                                <p className="text-center text-uppercase font-size-10">
                                                                    {item.macro_name}
                                                                </p>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                        {
                                            (menuDetailsFinal.mealMacros.other && Object.keys(menuDetailsFinal.mealMacros.other)?.length > 0) &&
                                            <div className="col-md-12 col-sm-12">
                                                <div className="see_more my-4 cursor-pointer bg-light d-block rounded py-1 px-2 my-3" onClick={() => setTogglePortions(!togglePortions)}>
                                                    <span className='d-flex align-items-center justify-content-between'>
                                                        <bdi>See All Portions Macros</bdi>
                                                        <span className="px-2">
                                                            <i className={`fas fa-angle-down ${togglePortions ? 'fa-rotate-180' : ''}`}></i>
                                                        </span>
                                                    </span>
                                                </div>
                                                {Object.keys(menuDetailsFinal.mealMacros.other)?.map((name, index) => {
                                                    let cal = menuDetailsFinal.mealMacros.other[name]?.find((f) => f.macro_name === "Calories")
                                                    return (
                                                        <div className={`see_more_content mb-3 ${togglePortions ? 'd-block' : 'd-none'}`} key={index}>
                                                            <div className="row">
                                                                <div className="col-md-12 col-sm-12 ">
                                                                    <b className="primary-color-cls">{name}</b>
                                                                </div>
                                                            </div>

                                                            <div className="d-flex bg-light d-block rounded px-2 mt-2">
                                                                <div className="col-md-6 col-sm-6">
                                                                    <p className="text-uppercase my-2">
                                                                        <b>Total Calories</b>
                                                                    </p>
                                                                </div>
                                                                <div className="col-md-6 col-sm-6 text-end">
                                                                    <p className="pull-right my-2">
                                                                        <i className="fas fa-fire"></i> <b>{FixedDecimal(cal.quantity)}</b> Calories
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="row mt-1">
                                                                {menuDetailsFinal.mealMacros.other[name]?.map((item) => {
                                                                    if (item.macro_name !== "Calories") return (
                                                                        <div className="col-md-3 col-sm-3 text-center" key={item.macro_id}>
                                                                            <b>{FixedDecimal(item.quantity)} {item.suffix}</b>
                                                                            <p className="text-center text-uppercase font-size-10">
                                                                                {item.macro_name}
                                                                            </p>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        }
                                    </div>
                                    <div className="row border-bottom">
                                        <div className="col-md-12 col-sm-12 col-xs-12">
                                            <p>
                                                <b className='d-block'>Ingredients:&nbsp;</b>
                                                {menuDetailsFinal.mealDetails?.ingredients}
                                            </p>
                                            <div className="row border-bottom">
                                                <div className="col-md-12 col-sm-12 col-xs-12">
                                                    <p className="allergens mb-2">
                                                        <b className='d-block'>Allergens:&nbsp;</b>
                                                        {menuDetailsFinal.mealDetails?.allergens ?
                                                            menuDetailsFinal.mealDetails?.allergens?.split(',')?.map((alrgn) => {
                                                                let name = alrgn?.split(':')?.[1]
                                                                return name;
                                                            })?.join(', ') :
                                                            'None'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="row border-bottom">
                                                {menuDetailsFinal.mealDetails?.meal_heating_instruction && <div className="col-md-12 col-sm-12 col-xs-12">
                                                    <p>
                                                        <b className='d-block'>Heating Instructions</b>
                                                        {menuDetailsFinal.mealDetails?.meal_heating_instruction}
                                                    </p>
                                                </div>}
                                                {menuDetailsFinal.mealDetails?.meal_packaging_instruction && <div className="col-md-12 col-sm-12 col-xs-12">
                                                    <p>
                                                        <b className='d-block'>Packaging Instructions</b>
                                                        {menuDetailsFinal.mealDetails?.meal_packaging_instruction}
                                                    </p>
                                                </div>}
                                                {menuDetailsFinal.mealDetails?.cooking_instructions && <div className="col-md-12 col-sm-12 col-xs-12">
                                                    <p>
                                                        <b className='d-block'>Cooking Instructions</b>
                                                        {menuDetailsFinal.mealDetails?.cooking_instructions}
                                                    </p>
                                                </div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </div >
    );
}
