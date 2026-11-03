import React, { useCallback, useContext, useEffect, useState } from 'react';
import Landing from '../../../pages/common/Landing';
import Topbar from '../../../pages/common/Topbar';
import TitleHeader from '../../components/TitleHeader';
import SelectDateTable from '../../components/SelectDateTable';
import MealDetailsModal from '../../../pages/ModalsCommon/MealDetailsModal';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, ModalFooter, Offcanvas, OffcanvasBody } from 'reactstrap';
import HowToModal from '../../../pages/ModalsCommon/HowToModal';
import MacroGraph from '../../components/MacroGraph';
import { Context } from '../../../context/GeneralContext';
import { PostApi } from '../../../services/ApiService';
import { API_PATH_USER } from '../../../const';
import { API_PATH } from '../../../admin/constants/const';
import Placeholder from '../../../admin/assets/images/placeholder.png';
import emptyData from '../../../assets/images/emptyData.svg';
import { useLocation, useNavigate } from 'react-router-dom';

export default function MealsByUnit() {
    const context = useContext(Context);
    const location = useLocation();
    const navigate = useNavigate();
    const [openModalByUnit, setOpenModalByUnit] = useState({ show: false, id: '' });
    const [seeMoreMacros, setSeeMoreMacros] = useState(false);
    const [openHowToModal, setOpenHowToModal] = useState({ show: false, link: '', title: '' });
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [toggle_drp, set_toggle_drp] = useState(false);
    const [macrosData, setMacrosData] = useState({ portionData: [], macros: [] });
    const [selectedDate, setSelectedDate] = useState(null);
    const [meals, setMeals] = useState([]);
    const [height, setHeight] = useState('0px');
    const [timer, setTimer] = useState(null);
    const [filterTags, setFilterTags] = useState([{ label: 'My Diet Preferences', value: 1, field_name: 'show_my_diet_preference' }]);
    const [mealCategories, setMealCategories] = useState([]);
    const [tempFilter, setTempFilter] = useState({
        show_custom_only: 0,
        show_premium_only: 0,
        with_my_allergens: 0,
        with_my_dislikes: 0,
        show_my_diet_preference: 1,
        meal_category_ids: [],
    })
    const [options, setOptions] = useState({
        search_name: "",
        meal_category_ids: [],
        sort_by: "display_name",
        is_ascending: 1,
        show_custom_only: 0,
        show_premium_only: 0,
        with_my_allergens: 0,
        with_my_dislikes: 0,
        show_my_diet_preference: 1
    });

    const currentdate = `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`;

    const sortList = [
        { label: 'Sort Alphabeticaly A-Z', value: { sort_by: "display_name", is_ascending: 1 } },
        { label: 'Sort Alphabeticaly Z-A', value: { sort_by: "display_name", is_ascending: 0 } },
        { label: 'Sort by higher Price', value: { sort_by: "regular_meal_prep_price", is_ascending: 0 } },
        { label: 'Sort by lower Price', value: { sort_by: "regular_meal_prep_price", is_ascending: 1 } },
    ]

    useEffect(() => {
        GetMealCategories();
        GetMacrosData();
    }, [])

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
        if (location.search && selectedDate) navigate(`/mealsbyunit?dd=${currentdate}`);
    }, [currentdate]);

    useEffect(() => {
        if (selectedDate && context?.selected_location) GetAllMealMenuDetailsToOrder();
        if (!selectedDate && context?.selected_location) GetDatesOneTimeOrder();
    }, [context?.selected_location, selectedDate])

    useEffect(() => {
        var stickyGraph = document.querySelector('.meals-menu-portion');
        if (stickyGraph) {
            var heightTemp = stickyGraph.getBoundingClientRect().height;
            if (heightTemp >= 325) setHeight(heightTemp + 'px');
            else setHeight('auto');
        }
    }, [meals]);

    const StickyGraph = useCallback(({ macrosData }) => {
        return (
            <div style={{ height: height }}>
                <div className="sticky_graph py-3">
                    <MacroGraph setSeeMoreMacros={setSeeMoreMacros} macrosData={macrosData} />
                </div>
            </div>
        );
    }, [height]);

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

    const GetMealCategories = async () => {
        const response = await PostApi(API_PATH.getMealCategories, { type: 'all' });
        if (response.statusCode === 200) {
            const result = response.data.data_result?.reduce((acc, obj) => {
                const key = obj.meal_category_group_name;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);
                return acc;
            }, {});
            setMealCategories(result);
        }
    };

    const GetAllMealMenuDetailsToOrder = async (optionProp) => {
        let option = optionProp ?? options;
        let data = {
            meal_menu_date: `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`,
            kitchen_location_id: context?.selected_location.kitchen_location_id,
            ...option
        }

        const response = await PostApi(API_PATH_USER.GetAllMealMenuDetailsToOrder, data);
        if (response.statusCode === 200) {
            setMeals(response.data);
        } else {
            setMeals([]);
        }
        setOptions(option);
    }

    const handleButtonClick = () => {
        const element = document.getElementById('uncategorized');
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth'
            });
        }
    };

    const handleSearchChange = (filed_value) => {
        let tmp_option = { ...options, search_name: filed_value };
        setOptions(tmp_option);
        if (timer) {
            clearTimeout(timer);
            setTimer(null);
        }
        setTimer(
            setTimeout(() => {
                GetAllMealMenuDetailsToOrder(tmp_option);
            }, 1000)
        );
    };

    const handleFilterChange = (e, type) => {
        let tempObj = { ...tempFilter };
        if (type === 'meal_category_ids') {
            let idsArray = [...tempObj.meal_category_ids];
            if (!idsArray.includes(e.target.value)) {
                idsArray.push(e.target.value);
            } else {
                let index = idsArray?.findIndex((f) => f === e.target.value);
                idsArray.splice(index, 1);
            }
            tempObj[type] = idsArray;
        } else {
            tempObj[e.target.id] = e.target.checked ? 1 : 0;
        }
        setTempFilter(tempObj);
    }

    const handleRemoveFilterTag = (item) => {
        let tempObj = { ...tempFilter };
        if (item.field_name === 'meal_category_ids') {
            let idsArray = [...tempObj.meal_category_ids];
            let index = idsArray?.findIndex((f) => f === item.value);
            idsArray.splice(index, 1);
            tempObj[item.field_name] = idsArray;
        } else {
            tempObj[item.field_name] = 0;
        }
        handleApplyFilter('apply', tempObj);
    }

    const handleApplyFilter = (type, tempFilterData) => {
        let tempFilteredData = tempFilterData ?? tempFilter;
        let data = { ...options };
        let tempFilterTags = [];

        const filterMappings = [
            { key: 'with_my_allergens', label: 'With my allergens' },
            { key: 'with_my_dislikes', label: 'With my dislikes' },
            { key: 'show_my_diet_preference', label: 'My Diet Preferences', defaultValue: 1 },
            { key: 'show_premium_only', label: 'Only Premium' },
            { key: 'show_custom_only', label: 'Only Custom' },
        ];

        if (type === 'clear') {
            filterMappings.forEach(({ key, defaultValue = 0 }) => {
                data[key] = defaultValue;
                tempFilteredData[key] = defaultValue;
            });
            data['meal_category_ids'] = [];
            tempFilteredData['meal_category_ids'] = [];
            tempFilterTags = filterMappings.filter(({ key }) => data[key]).map(({ label, key }) => ({ label, value: data[key], field_name: key }));
        } else {
            tempFilterTags = filterMappings
                .filter(({ key }) => tempFilteredData[key] === 1)
                .map(({ label, key }) => ({ label, value: 1, field_name: key }));

            if (tempFilteredData.meal_category_ids?.length > 0) {
                const allCategories = Object.values(mealCategories).flat();
                tempFilteredData.meal_category_ids.forEach(id => {
                    const category = allCategories.find(cat => cat.meal_category_id === id);
                    if (category) {
                        tempFilterTags.push({
                            label: category.meal_category_name,
                            value: id,
                            field_name: 'meal_category_ids'
                        });
                    }
                });
            }
            Object.assign(data, tempFilteredData);
        }

        setTempFilter(tempFilteredData);
        setFilterTags(tempFilterTags);
        setOpenFilterModal(false);
        GetAllMealMenuDetailsToOrder(data);
    };

    const handleChangeQuantity = (e, item, index, btnType) => {
        e.stopPropagation();
        let cart = { ...context.cartData };
        let cartdata = { ...cart.data };
        let currentdata = { ...cartdata[currentdate] };
        let meals = [...currentdata.meals ?? []];
        let qnt = 0;

        let obj = {
            ingredient_id: item.ingredient_id,
            ingredient_name: item.display_name,
            portion_size_id: item.portion_size_id,
            portion_size_name: item.portion_size_name,
            is_default: item.is_default,
            price: item.regular_meal_prep_price,
            quantity: 1
        };

        let findIndex = meals.findIndex(f => f.ingredient_id === obj.ingredient_id);

        if (btnType === 'increment') {
            if (findIndex !== -1) {
                qnt = meals[findIndex].quantity + 1;
                meals[findIndex].quantity += 1;
            } else {
                qnt = 1;
                meals.push(obj);
            }
        } else {
            if (findIndex !== -1 && meals[findIndex].quantity > 1) {
                qnt = meals[findIndex].quantity - 1;
                meals[findIndex].quantity -= 1;
            } else if (findIndex !== -1) {
                qnt = 0;
                meals.splice(findIndex, 1);
            }
        }

        let meal_macros = [...macrosData.macros];
        item.macro_values?.split(';')?.forEach((f) => {
            let [id, quantity] = f?.split(':');
            let i = meal_macros?.findIndex((macro) => id === macro.macro_id);
            meal_macros[i].quantity = quantity;
            meal_macros[i].total = quantity * qnt;
        });

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

        setMacrosData({ portionData: [], macros: meal_macros });

        context.setCartData({
            ...cart,
            totalItems: totalItemsAllDates,
            subTotal: totalPriceAllDates,
        });
    }

    const handleToggle = () => set_toggle_drp(!toggle_drp);

    return (
        <div className="meals-by-unit-main one-time-order-main">
            <Topbar />
            <Landing>
                <TitleHeader title="À la Carte" state={setOpenHowToModal} link="https://www.youtube.com/embed/pDWvQHAdjoc" />
                <div className="page-content-wrapper">
                    <div className="container-fluid">
                        <div className="container-user">
                            <div className="container_datesmeals">
                                <div className="row">
                                    <div className="col-12">
                                        <h3 className="top_order_titles">2. Select a Date</h3>
                                    </div>
                                </div>
                                <SelectDateTable state={{ selectedDate, setSelectedDate }} />

                                <div className="row align-items-center">
                                    <div className="col-lg-6 col-12">
                                        <h3 className="mb-0">3. Select your meals</h3>
                                    </div>

                                    <div className="search-wrapper font-size-14 col-lg-3 col-12">
                                        <i className="bx bx-search-alt-2 fs-4"></i>
                                        <div className="form-group is-empty">
                                            <input type="text" className="form-control" placeholder="What are you craving?" value={options.search_name} onChange={(e) => handleSearchChange(e.target.value)} />
                                            <span className="material-input"></span>
                                        </div>
                                    </div>

                                    <div className="col-lg-3 col-12 sort-dropdown-main">
                                        <Dropdown isOpen={toggle_drp} toggle={handleToggle}>
                                            <DropdownToggle caret className='w-100'>
                                                <div className='d-flex align-items-center justify-content-between'>
                                                    <span>{sortList?.find((item) => item.value.is_ascending === options.is_ascending && item.value.sort_by === options.sort_by)?.label}</span>
                                                    <i className={`mdi mdi-chevron-${toggle_drp ? 'up' : 'down'} fs-4 align-middle`}></i>
                                                </div>
                                            </DropdownToggle>
                                            <DropdownMenu className='w-100'>
                                                {/* <div className='px-2 w-100 mb-1'>
                                                    <input type='text' className='form-control py-1 rounded-0' />
                                                </div> */}
                                                {
                                                    sortList?.map((item, index) => (
                                                        <DropdownItem
                                                            className={(item.value.is_ascending === options.is_ascending && item.value.sort_by === options.sort_by) ? 'active' : ''}
                                                            key={index}
                                                            onClick={() => GetAllMealMenuDetailsToOrder({ ...options, ...item.value })}
                                                        >
                                                            {item.label}
                                                        </DropdownItem>
                                                    ))
                                                }
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                </div>

                                <div className="row border-bottom" id="uncategorized">
                                    <div className="col-12 mb-3 mt-2">
                                        <button
                                            type="button"
                                            className="ms-0 me-2 my-2 btn new_button_square_small primary-bg-cls"
                                            onClick={() => setOpenFilterModal(true)}
                                        >
                                            Edit Preferences
                                            <i className="ms-2 fas fa-plus"></i>
                                        </button>
                                        <span>
                                            {
                                                filterTags?.map((item, index) => (
                                                    <span className="btn new_button_square_small primary-border-cls primary-color-cls me-2 my-2" key={index}>
                                                        {item.label}
                                                        <i className="ms-2 fas fa-times" onClick={() => handleRemoveFilterTag(item)}></i>
                                                    </span>
                                                ))
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div className={`row mt-3 ${options.with_my_allergens === 1 || options.with_my_dislikes === 1 ? '' : 'd-none'}`}>
                                    <div className="col-12 pe-0">
                                        <p className="square_badge back_danger">
                                            You are now seeing "All Meals" regardless of your saved preferences. This means some meals shown
                                            can contain your Allergens or dislike. Please be aware of ingredients when you confirm your
                                            selections.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <div className="row">
                                        <div className="col-lg-9">
                                            {
                                                meals?.length > 0 ? (
                                                    <div className="position-relative meals-menu-portion">
                                                        <div className="categories-border-alacart categories-wrapper">
                                                            <div className="categories__list scrolls scroll_horizontal_custom w-100">
                                                                <span className="current" onClick={handleButtonClick}>
                                                                    <span className="categories__item">Uncategorized</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="cards-wrapper px-2">
                                                            <div className="row">
                                                                <div className="col-12">
                                                                    <section>
                                                                        <div className="row">
                                                                            <div className="col-12 _col-ms-offset-2 categories-section-title">
                                                                                <h1 className="mt-0">Uncategorized</h1>
                                                                            </div>
                                                                        </div>
                                                                        <div className="row">
                                                                            {
                                                                                meals?.map((item, index) => {
                                                                                    let quantity = context.cartData.data?.[currentdate]?.meals?.filter((f) => f.ingredient_id === item.ingredient_id)?.reduce((acc, meal) => {
                                                                                        return acc + meal.quantity
                                                                                    }, 0)

                                                                                    return (
                                                                                        <div
                                                                                            key={item.ingredient_id}
                                                                                            className="col-lg-6 col-12 pe-0 mealSelector"
                                                                                            onClick={() =>
                                                                                                setOpenModalByUnit({ show: true, id: item.ingredient_id })
                                                                                            }
                                                                                        >
                                                                                            <div className="meal_wrapper by_unit_wrapper">
                                                                                                {
                                                                                                    item.is_contain_allergies === 1 &&
                                                                                                    <div className="allergen_warning">
                                                                                                        <i title="Contains Allergens" className="fas fa-exclamation-triangle text-warning"></i>
                                                                                                    </div>
                                                                                                }
                                                                                                <div className="horizontal-card">
                                                                                                    <div className="horizontal-card-image">
                                                                                                        <span className="clean-badge primary-bg-cls more-info">+ info</span>
                                                                                                        <img
                                                                                                            width="100%"
                                                                                                            height="100%"
                                                                                                            src={item.ingredient_image ?? Placeholder}
                                                                                                            alt={item.display_name}
                                                                                                            title={item.display_name}
                                                                                                            onError={e => { e.target.src = Placeholder }}
                                                                                                        />
                                                                                                    </div>

                                                                                                    <div className="horizontal-card-details w-100">
                                                                                                        <div className="">
                                                                                                            <span className="badge square_badge">
                                                                                                                <span className="">
                                                                                                                    <i className="fas fa-tags"></i> {`$${item.regular_meal_prep_price} ${item.highest_upgrade_price ? ("- $" + item.highest_upgrade_price) : ''}`}
                                                                                                                </span>
                                                                                                            </span>
                                                                                                            {
                                                                                                                item.is_chef_fav === 1 &&
                                                                                                                <span className="square_badge badge back_danger">
                                                                                                                    <span className="">Chef's Favorite</span>
                                                                                                                </span>
                                                                                                            }
                                                                                                            {
                                                                                                                item.is_new === 1 &&
                                                                                                                <span className="square_badge badge">
                                                                                                                    <span className="">New Item</span>
                                                                                                                </span>
                                                                                                            }
                                                                                                        </div>

                                                                                                        <h1 className="mt-2 mb-1 ellipsis">
                                                                                                            {item.display_name}
                                                                                                        </h1>

                                                                                                        {/* <div className="alertQuantity">Please increase the quantity!</div> */}

                                                                                                        <div className="calories">
                                                                                                            <span className="select_portion_inc ms-2">
                                                                                                                {item.highest_upgrade_price ?
                                                                                                                    <button
                                                                                                                        className="btn new_button_square_small primary-bg-cls"
                                                                                                                        type="button"
                                                                                                                    >
                                                                                                                        Select Portion Size
                                                                                                                        {
                                                                                                                            quantity > 0 &&
                                                                                                                            <span className="circle-badge wrapTotalMealBadge wrapTotalMealBadge_43">
                                                                                                                                <span className="item totalMealBadge_43">{quantity}</span>
                                                                                                                            </span>
                                                                                                                        }
                                                                                                                    </button> :
                                                                                                                    <div className="selector input-wrapper text-center">
                                                                                                                        <button type="button" className={`input-number-decrement primary-color-cls ${(quantity ?? 0) === 0 ? 'disabled' : ''}`} onClick={(e) => handleChangeQuantity(e, item, index, 'decrement')}>
                                                                                                                            –
                                                                                                                        </button>
                                                                                                                        <input className="input-number" type="number" readOnly value={quantity ?? 0} />
                                                                                                                        <button type="button" className="input-number-increment primary-color-cls" onClick={(e) => handleChangeQuantity(e, item, index, 'increment')}>
                                                                                                                            +
                                                                                                                        </button>
                                                                                                                    </div>
                                                                                                                }
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                })
                                                                            }
                                                                        </div>
                                                                    </section>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="row meals-menu-portion">
                                                        <div className="col-xs-12 spacer-top text-center">
                                                            <div className="text-center">
                                                                <img loading="lazy" src={emptyData} alt="No meals available. Try to change the preferences on the menu." title="No meals available. Try to change the preferences on the menu." />
                                                                <p>No meals available. Try to change the preferences on the menu.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>

                                        <div className="col-lg-3">
                                            <StickyGraph macrosData={macrosData} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Landing>

            <MealDetailsModal data={openModalByUnit} close={setOpenModalByUnit} GetMacrosDetails={(portionData, macros) => setMacrosData({ portionData, macros })} selectedDate={selectedDate} />
            {openHowToModal.show && <HowToModal data={openHowToModal} close={setOpenHowToModal} />}

            <Modal isOpen={seeMoreMacros} centered className="modal modal-not-centered">
                <ModalBody className='p-0'>
                    <MacroGraph isModal={true} macrosData={macrosData} noShadow={true} />
                </ModalBody>
                <ModalFooter className='p-0 upld-mls-btn overflow-hidden'>
                    <button className='w-100 font-size-16' onClick={() => setSeeMoreMacros(false)}>
                        Close
                    </button>
                </ModalFooter>
            </Modal>

            <Offcanvas direction="end" isOpen={openFilterModal} className="offcanvas-filter">
                <div className="closeSidebar cursor-pointer" onClick={() => setOpenFilterModal(false)}>
                    <span className="fa-stack fa-lg">
                        <i className="fa fa-circle fa-stack-2x"></i>
                        <i className="fas fa-angle-right fa-stack-1x fa-inverse"></i>
                    </span>
                </div>
                <OffcanvasBody className='p-0'>
                    <ul className="sidebar-nav">
                        <li className="sidebar-brand">Filter preferences</li>
                        <div className="newSidebarScroll" style={{ height: 'calc(100vh - 20vh)', overflowY: 'scroll' }}>
                            <li>
                                <ul className="nav nav-stacked" onChange={handleFilterChange}>
                                    <li className="nav-item indent-0">
                                        <div className="form-check form-switch form-switch-md">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="with_my_allergens"
                                                defaultChecked={tempFilter.with_my_allergens === 1}
                                            />
                                            <label className='d-flex form-check-label' htmlFor="with_my_allergens">
                                                Show meals with my allergens
                                            </label>
                                        </div>
                                    </li>
                                    <li className="nav-item indent-0">
                                        <div className="form-check form-switch form-switch-md">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="with_my_dislikes"
                                                defaultChecked={tempFilter.with_my_dislikes === 1}
                                            />
                                            <label className='d-flex form-check-label' htmlFor="with_my_dislikes">
                                                Show meals with my dislikes
                                            </label>
                                        </div>
                                    </li>
                                    <li className="nav-item indent-0">
                                        <div className="form-check form-switch form-switch-md">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="show_my_diet_preference"
                                                defaultChecked={tempFilter.show_my_diet_preference === 1}
                                            />
                                            <label className='d-flex form-check-label' htmlFor="show_my_diet_preference">
                                                Show my Diet Preferences
                                            </label>
                                        </div>
                                    </li>
                                    <li className="nav-item indent-0">
                                        <div className="form-check form-switch form-switch-md">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="show_premium_only"
                                                defaultChecked={tempFilter.show_premium_only === 1}
                                            />
                                            <label className='d-flex form-check-label' htmlFor="show_premium_only">
                                                Show Only Premium Meals
                                            </label>
                                        </div>
                                    </li>
                                    <li className="nav-item indent-0">
                                        <div className="form-check form-switch form-switch-md">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="show_custom_only"
                                                defaultChecked={tempFilter.show_custom_only === 1}
                                            />
                                            <label className='d-flex form-check-label' htmlFor="show_custom_only">
                                                Show Only Custom Meals
                                            </label>
                                        </div>
                                    </li>
                                </ul>
                            </li>
                            {Object.keys(mealCategories)?.map((name, index) => (
                                <React.Fragment key={index}>
                                    <li className="sidebar-sub">{name}</li>
                                    <li>
                                        <ul className="nav nav-stacked category-meals-menu d-block">
                                            {mealCategories[name]?.map((item) => (
                                                <li className="nav-item" key={item.meal_category_id}>
                                                    <div className="">
                                                        <p className="boxes categorymeal_entree">
                                                            <input
                                                                type="checkbox"
                                                                className="categorymeal categorymeal-3 categorymealid-1"
                                                                value={item.meal_category_id}
                                                                id={item.meal_category_id}
                                                                onChange={(e) => handleFilterChange(e, 'meal_category_ids')}
                                                                defaultChecked={options.meal_category_ids?.includes(item.meal_category_id)}
                                                            />
                                                            <label htmlFor={item.meal_category_id}>{item.meal_category_name}</label>
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                </React.Fragment>
                            ))}
                        </div>
                    </ul>
                    <ul className="nav nav-sidebar logout_sidebar_button">
                        <li className="w-50 pull-left d-inline-block" onClick={() => handleApplyFilter('apply')}>
                            <a className="btn new_button_square_big_sidebar primary-bg-cls mb-0 indent-0 w-100" type="button">
                                Apply Filters
                            </a>
                        </li>
                        <li className="w-50 pull-right d-inline-block">
                            <a className="btn new_button_square_big_outline_sidebar bg-white mb-0 indent-0 w-100" type="button" onClick={() => handleApplyFilter('clear')}>
                                Clear
                            </a>
                        </li>
                    </ul>
                </OffcanvasBody>
            </Offcanvas>
        </div>
    );
}
