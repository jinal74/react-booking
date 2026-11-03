import React, { useContext, useEffect, useState } from 'react';
import MacroGraph from '../../components/MacroGraph';
import { PostApi } from '../../../services/ApiService';
import { API_PATH_USER } from '../../../const';
import { Context } from '../../../context/GeneralContext';
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Offcanvas,
    OffcanvasBody,
} from 'reactstrap';
import { API_PATH } from '../../../admin/constants/const';
import MealDetailsModal from '../../../pages/ModalsCommon/MealDetailsModal';
import Placeholder from '../../../admin/assets/images/placeholder.png';
import SuccessGif from '../../../assets/images/doneSuccessfully.GIF';
import FoodLoader from '../../../assets/images/foodLoader.gif';
import { FixedDecimal } from '../../../helpers/func_helper';
import emptyData from '../../../assets/images/emptyData.svg';

export default function ModalsSubscriptionMeals({ states, functions }) {
    const context = useContext(Context);
    const [openModalByUnit, setOpenModalByUnit] = useState({ show: false, id: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [allMealsSelectedModal, setAllMealsSelectedModal] = useState(false);
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [selectMeal, setselectMeal] = useState({ show: false, meal: null, is_disabled: true });
    const [toggle_drp, set_toggle_drp] = useState(false);
    const [meals, setMeals] = useState([]);
    const [timer, setTimer] = useState(null);
    const [portionSizes, setPortionSizes] = useState([]);
    const [mealCategories, setMealCategories] = useState([]);
    const [meal_pack_category_id, set_meal_pack_category_id] = useState(null);
    const [meal_pack_data, set_meal_pack_data] = useState();
    const [selectedAllergens, setSelectedAllergens] = useState([]);
    const [selectedDislikes, setSelectedDislikes] = useState([]);
    const [options, setOptions] = useState({
        search_name: '',
        meal_category_ids: [],
        sort_by: 'display_name',
        is_ascending: 1,
        show_custom_only: 0,
        show_premium_only: 0,
        with_my_allergens: 0,
        with_my_dislikes: 0,
        show_my_diet_preference: 1,
    });
    const [filterTags, setFilterTags] = useState([
        { label: 'My Diet Preferences', value: 1, field_name: 'show_my_diet_preference' },
    ]);
    const [tempFilter, setTempFilter] = useState({
        show_custom_only: 0,
        show_premium_only: 0,
        with_my_allergens: 0,
        with_my_dislikes: 0,
        show_my_diet_preference: 1,
        meal_category_ids: [],
    });

    const sortList = [
        { label: 'Sort Alphabeticaly A-Z', value: { sort_by: 'display_name', is_ascending: 1 } },
        { label: 'Sort Alphabeticaly Z-A', value: { sort_by: 'display_name', is_ascending: 0 } },
        { label: 'Sort by higher Price', value: { sort_by: 'regular_meal_prep_price', is_ascending: 0 } },
        { label: 'Sort by lower Price', value: { sort_by: 'regular_meal_prep_price', is_ascending: 1 } },
    ];

    useEffect(() => {
        set_meal_pack_data(states.openSelectMealsModal?.data);
        set_meal_pack_category_id(states.openSelectMealsModal?.meal_pack_category_id);
    }, [states.openSelectMealsModal?.data, states.openSelectMealsModal?.meal_pack_category_id]);

    useEffect(() => {
        GetMealCategories();
        GetAllergenPreferences();
        GetDislikePreferences();
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (
                states.selectedDate &&
                context?.selected_location &&
                meal_pack_category_id &&
                meal_pack_data &&
                states.openSelectMealsModal?.subscription_plan_id
            ) {
                GetMealsForMealPacks();
            }
            if (states.selectedDate && context?.selected_location && !meal_pack_category_id && meal_pack_data) {
                GetAllMealMenuDetailsToOrder();
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [
        context?.selected_location,
        states.selectedDate,
        meal_pack_category_id,
        meal_pack_data,
        states.openSelectMealsModal?.subscription_plan_id,
    ]);

    const GetAllergenPreferences = async () => {
        const response = await PostApi(API_PATH_USER.GetAllergenPreferences);
        if (response.statusCode === 200) {
            let allergenRes = response.data[0]?.allergens?.split(',') ?? [];
            let arr = allergenRes?.map((f) => f.split(':')?.[1]);
            setSelectedAllergens(arr);
        }
    };

    const GetDislikePreferences = async () => {
        const response = await PostApi(API_PATH_USER.GetDislikePreferences);
        if (response.statusCode === 200) {
            let dislikeRes = response.data[0].allergenDislike?.split(',') ?? [];
            let arr = dislikeRes?.map((f) => f.split(':')?.[1]);
            setSelectedDislikes(arr);
        }
    };

    const GetMealsForMealPacks = async (optionProp) => {
        let option = optionProp ?? options;
        let data = {
            meal_menu_date: `${states.selectedDate?.year}-${states.selectedDate?.month}-${states.selectedDate?.date}`,
            kitchen_location_id: context?.selected_location.kitchen_location_id,
            meal_pack_category_id: meal_pack_category_id,
            subscription_plan_id: states.openSelectMealsModal?.subscription_plan_id,
            ...option,
        };

        const response = await PostApi(API_PATH_USER.GetMealsForMealPacks, data);
        if (response.statusCode === 200) {
            setMeals(response.data);
        } else {
            setMeals([]);
        }
        setOptions(option);
    };

    const GetAllMealMenuDetailsToOrder = async (optionProp) => {
        let option = optionProp ?? options;
        let data = {
            meal_menu_date: `${states.selectedDate?.year}-${states.selectedDate?.month}-${states.selectedDate?.date}`,
            kitchen_location_id: context?.selected_location.kitchen_location_id,
            ...option,
        };

        const response = await PostApi(API_PATH_USER.GetAllMealMenuDetailsToOrder, data);
        if (response.statusCode === 200) {
            setMeals(response.data);
        } else {
            setMeals([]);
        }
        setOptions(option);
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

    const handleSearchChange = (filed_value) => {
        let tmp_option = { ...options, search_name: filed_value };
        setOptions(tmp_option);
        if (timer) {
            clearTimeout(timer);
            setTimer(null);
        }
        setTimer(
            setTimeout(() => {
                GetMealsForMealPacks(tmp_option);
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
    };

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
    };

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
            tempFilterTags = filterMappings
                .filter(({ key }) => data[key])
                .map(({ label, key }) => ({ label, value: data[key], field_name: key }));
        } else {
            tempFilterTags = filterMappings
                .filter(({ key }) => tempFilteredData[key] === 1)
                .map(({ label, key }) => ({ label, value: 1, field_name: key }));

            if (tempFilteredData.meal_category_ids?.length > 0) {
                const allCategories = Object.values(mealCategories).flat();
                tempFilteredData.meal_category_ids.forEach((id) => {
                    const category = allCategories.find((cat) => cat.meal_category_id === id);
                    if (category) {
                        tempFilterTags.push({
                            label: category.meal_category_name,
                            value: id,
                            field_name: 'meal_category_ids',
                        });
                    }
                });
            }
            Object.assign(data, tempFilteredData);
        }

        setTempFilter(tempFilteredData);
        setFilterTags(tempFilterTags);
        setOpenFilterModal(false);
        GetMealsForMealPacks(data);
    };

    const handleSelectMealPortion = (item) => {
        let tempPortionPrices = [];
        let portionPrices = item.portion_prices?.split(';');
        let upgradePrice = 0;
        portionPrices?.forEach((f) => {
            if (f?.split(',')?.[0] === item.portion_size_id) upgradePrice = f?.split(',')?.[2];
        });
        portionPrices?.forEach((portion) => {
            let [portion_size_id, portion_size_name, upgrade_price, surcharge, price] = portion?.split(',');
            let isDefault = portion_size_id === item.portion_size_id ? (item.is_default_portion_size ?? item.is_default_portion) : 0;
            if ((item.is_default_portion_size ?? item.is_default_portion) !== 1) {
                if (upgrade_price >= upgradePrice) {
                    tempPortionPrices.push({
                        portion_size_id,
                        portion_size_name,
                        price: price ?? (portion_size_id === item.portion_size_id ? surcharge : (Number(upgrade_price) + Number(surcharge))?.toFixed(2)),
                        upgrade_price,
                        surcharge,
                        is_default: isDefault,
                        quantity: 0,
                    });
                }
            } else {
                tempPortionPrices.push({
                    portion_size_id,
                    portion_size_name,
                    price: price ?? (portion_size_id === item.portion_size_id ? surcharge : (Number(upgrade_price) + Number(surcharge))?.toFixed(2)),
                    upgrade_price,
                    surcharge,
                    is_default: isDefault,
                    quantity: 0,
                });
            }
        });
        setPortionSizes(tempPortionPrices);
        setselectMeal((prevState) => ({ ...prevState, show: true, meal: item }));
    };

    const handleChangeQuantity = (item, index, btnType) => {
        let tempData = [...portionSizes];
        let obj = JSON.parse(JSON.stringify(item));
        if (btnType === 'increment') obj.quantity = obj.quantity + 1;
        else obj.quantity = obj.quantity - 1;

        tempData.splice(index, 1, obj);
        let disable = true;
        for (let item of tempData) {
            if (item.quantity > 0) {
                disable = false;
            }
        }
        setPortionSizes(tempData);
        setselectMeal((prevState) => ({ ...prevState, is_disabled: disable }));
    };

    const handleConfirmSelection = () => {
        setIsLoading(true);
        let updatedData = { ...meal_pack_data };

        portionSizes.forEach((portion) => {
            for (let i = 0; i < portion.quantity; i++) {
                if (meal_pack_category_id) {
                    let mealIndex = updatedData?.[meal_pack_category_id]?.findIndex(
                        (meal) => meal.id === meal_pack_category_id && meal.ingredient_id === ''
                    );
                    let index = -1;
                    if (states.openSelectMealsModal?.meal)
                        index = updatedData?.[meal_pack_category_id]?.findIndex(
                            (f) => f.position === states.openSelectMealsModal?.meal?.position
                        );

                    let meal = updatedData?.[meal_pack_category_id][mealIndex !== -1 ? mealIndex : index];

                    if (mealIndex !== -1 ? meal?.ingredient_id === '' : index !== -1) {
                        meal.ingredient_id = selectMeal.meal.ingredient_id;
                        meal.ingredient_name = selectMeal.meal.display_name;
                        meal.is_new = selectMeal.meal.is_new;
                        meal.ingredient_image = selectMeal.meal.ingredient_image;
                        meal.macro_values = selectMeal.meal.macro_values;
                        meal.portion_size_id = portion.portion_size_id;
                        meal.portion_size_name = portion.portion_size_name;
                        meal.is_default = portion.is_default;
                        meal.price = portion.price;
                    }
                } else {
                    let extraArr = [...(updatedData.extra ?? [])];
                    extraArr?.push({
                        id: 'extra',
                        name: '',
                        ingredient_id: selectMeal.meal.ingredient_id,
                        ingredient_name: selectMeal.meal.display_name,
                        is_new: selectMeal.meal.is_new,
                        ingredient_image: selectMeal.meal.ingredient_image,
                        macro_values: selectMeal.meal.macro_values,
                        portion_size_id: portion.portion_size_id,
                        portion_size_name: portion.portion_size_name,
                        is_default: portion.is_default,
                        price: portion.price,
                        extra: 1,
                    });
                    updatedData['extra'] = extraArr;
                }
            }
        });

        functions.handleSelectMeal(updatedData);

        setTimeout(() => {
            setselectMeal({ show: false, meal: null, is_disabled: true });
            setPortionSizes((prevState) => prevState?.map((f) => ({ ...f, quantity: 0 })) ?? []);
            setIsLoading(false);
        }, 2000);
    };

    const handleAddSingleMeal = (item) => {
        setIsLoading(true);
        let updatedData = { ...meal_pack_data };
        if (meal_pack_category_id) {
            let mealIndex = updatedData?.[meal_pack_category_id]?.findIndex(
                (meal) => meal.id === meal_pack_category_id && meal.ingredient_id === ''
            );
            let index = -1;
            if (states.openSelectMealsModal?.meal)
                index = updatedData?.[meal_pack_category_id]?.findIndex(
                    (f) => f.position === states.openSelectMealsModal?.meal?.position
                );

            let meal = updatedData?.[meal_pack_category_id]?.[mealIndex !== -1 ? mealIndex : index];

            if (mealIndex !== -1 ? meal?.ingredient_id === '' : index !== -1) {
                meal.ingredient_id = item.ingredient_id;
                meal.ingredient_name = item.display_name;
                meal.is_new = item.is_new;
                meal.ingredient_image = item.ingredient_image;
                meal.macro_values = item.macro_values;
                meal.portion_size_id = item.portion_size_id;
                meal.portion_size_name = item.portion_size_name;
                meal.is_default = item.is_default_portion_size;
                meal.price = item.is_default_portion_size === 1 ? 0 : item.extra_low_price;
            }
        } else {
            let extraArr = [...(updatedData.extra ?? [])];
            extraArr?.push({
                id: 'extra',
                name: '',
                ingredient_id: item.ingredient_id,
                ingredient_name: item.display_name,
                is_new: item.is_new,
                ingredient_image: item.ingredient_image,
                macro_values: item.macro_values,
                portion_size_id: item.portion_size_id,
                portion_size_name: item.portion_size_name,
                is_default: item.is_default_portion,
                price: item.regular_meal_prep_price,
                extra: 1,
            });
            updatedData['extra'] = extraArr;
        }

        functions.handleSelectMeal(updatedData);

        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };

    const handleToggle = () => set_toggle_drp(!toggle_drp);

    const isAnyPortionOne =
        states.openSelectMealsModal?.meal && states.openSelectMealsModal?.meal?.ingredient_id !== ''
            ? portionSizes?.some((item) => item.quantity === 1)
            : portionSizes?.reduce((acc, item) => acc + item.quantity, 0) ===
            meal_pack_data?.[meal_pack_category_id]?.filter((f) => f.ingredient_id === '')?.length;

    return (
        <React.Fragment>
            {openModalByUnit.show && <MealDetailsModal data={openModalByUnit} close={setOpenModalByUnit} info={true} />}

            <Modal isOpen={states.seeMoreMacros.show} centered className="modal modal-not-centered">
                <ModalBody>
                    <MacroGraph isModal={true} macrosData={states.seeMoreMacros.data} noShadow={true} />
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button
                        className="w-100 font-size-16"
                        onClick={() => states.setSeeMoreMacros((prevState) => ({ ...prevState, show: false }))}
                    >
                        Close
                    </button>
                </ModalFooter>
            </Modal>

            <Modal
                isOpen={states.openSelectMealsModal?.show}
                centered
                className="modal modal-650 position-relative modal-not-centered meals-of-pack-main meals-by-unit-main"
            >
                <ModalHeader className="justify-content-center primary-bg-cls">
                    {meal_pack_category_id
                        ? `Selecting ${meal_pack_data?.[meal_pack_category_id]?.filter((f) => f.ingredient_id !== '')?.length} of ${meal_pack_data?.[meal_pack_category_id]?.length
                        } ${meal_pack_data?.[meal_pack_category_id]?.[0]?.name}`
                        : 'Select Extra Meals'}
                </ModalHeader>
                <ModalBody className="px-0 pb-0">
                    {selectMeal.show ? (
                        <div className="portions-body border-top">
                            <div className="p-3 back_content">
                                <p className="mb-3">
                                    <b>Available Portions</b>
                                </p>
                                {portionSizes?.map((item, index) => {
                                    return (
                                        <div className="mealSelector" key={item.portion_size_id}>
                                            <div className="portion-wrapper">
                                                <div className="portion-name">{item.portion_size_name}</div>
                                                <div className="portion-data">
                                                    <div className="portion-price">
                                                        {item.price > 0 ? (
                                                            <>
                                                                ${item.price}
                                                                <i className="fas fa-tags ms-2"></i>
                                                            </>
                                                        ) : (
                                                            <span className="text-muted">included</span>
                                                        )}
                                                    </div>
                                                    <div className="qtySelector qty-actions">
                                                        <button
                                                            type="button"
                                                            className={`btn primary-border-cls primary-color-cls px-2 py-1 ${item.quantity === 0 ? 'disabled' : ''
                                                                }`}
                                                            onClick={() => handleChangeQuantity(item, index, 'decrement')}
                                                        >
                                                            <i className="fas fa-minus"></i>
                                                        </button>
                                                        <input className="input-number border-0 p-0" type="number" readOnly value={item.quantity} />
                                                        <button
                                                            type="button"
                                                            className={`btn primary-border-cls primary-color-cls px-2 py-1 ${isAnyPortionOne && meal_pack_category_id ? 'disabled' : ''
                                                                }`}
                                                            onClick={() => handleChangeQuantity(item, index, 'increment')}
                                                        >
                                                            <i className="fas fa-plus"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="meals-body">
                            <div className="row align-items-center px-3">
                                <div className="search-wrapper font-size-14 col-lg-6 col-12">
                                    <i className="bx bx-search-alt-2 fs-4"></i>
                                    <div className="form-group is-empty mb-2">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="What are you craving?"
                                            value={options.search_name}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                        />
                                        <span className="material-input"></span>
                                    </div>
                                </div>

                                <div className="col-lg-6 col-12 sort-dropdown-main">
                                    <Dropdown isOpen={toggle_drp} toggle={handleToggle}>
                                        <DropdownToggle caret className="w-100">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <span>
                                                    {
                                                        sortList?.find(
                                                            (item) =>
                                                                item.value.is_ascending === options.is_ascending &&
                                                                item.value.sort_by === options.sort_by
                                                        )?.label
                                                    }
                                                </span>
                                                <i className={`mdi mdi-chevron-${toggle_drp ? 'up' : 'down'} fs-4 align-middle`}></i>
                                            </div>
                                        </DropdownToggle>
                                        <DropdownMenu className="w-100">
                                            {/* <div className='px-2 w-100 mb-1'>
                                                    <input type='text' className='form-control py-1 rounded-0' />
                                                </div> */}
                                            {sortList?.map((item, index) => (
                                                <DropdownItem
                                                    className={
                                                        item.value.is_ascending === options.is_ascending && item.value.sort_by === options.sort_by
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    key={index}
                                                    onClick={() => GetMealsForMealPacks({ ...options, ...item.value })}
                                                >
                                                    {item.label}
                                                </DropdownItem>
                                            ))}
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                            </div>

                            <div className="row border-bottom px-3">
                                <div className="col-12 mb-2">
                                    <button
                                        type="button"
                                        className="ms-0 me-2 my-2 btn new_button_square_small primary-bg-cls"
                                        onClick={() => setOpenFilterModal(true)}
                                    >
                                        Edit Preferences
                                        <i className="ms-2 fas fa-plus"></i>
                                    </button>
                                    <span>
                                        {filterTags?.map((item, index) => (
                                            <span
                                                className="btn new_button_square_small primary-border-cls primary-color-cls me-2 my-2"
                                                key={index}
                                            >
                                                {item.label}
                                                <i className="ms-2 fas fa-times" onClick={() => handleRemoveFilterTag(item)}></i>
                                            </span>
                                        ))}
                                    </span>
                                </div>
                            </div>

                            <div className="back_content py-3 px-4">
                                {(selectedAllergens?.length > 0 || selectedDislikes?.length > 0) && (
                                    <>
                                        <div>
                                            <div className="clean-alert alert--danger">
                                                {selectedAllergens?.length > 0 && (
                                                    <>
                                                        <i className="fas fa-exclamation-triangle color_danger me-2"></i>
                                                        <span className="color_danger">Your Allergens: </span> {selectedAllergens?.join(', ')}
                                                        <br />
                                                    </>
                                                )}
                                                {selectedDislikes?.length > 0 && (
                                                    <>
                                                        <i className="fas fa-exclamation-triangle color_danger me-2"></i>
                                                        <span className="color_danger">Your Dislikes:</span> {selectedDislikes?.join(', ')}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            className={`mt-3 ${options.with_my_allergens === 1 || options.with_my_dislikes === 1 ? '' : 'd-none'
                                                }`}
                                        >
                                            <div className="pe-0 clean-alert alert--danger d-flex">
                                                <i className="fas fa-exclamation-circle color_danger font-size-14 mt-1 me-2"></i>
                                                <p>
                                                    You are now seeing "All Meals" regardless of your saved preferences. This means some meals
                                                    shown can contain your Allergens or dislike. Please be aware of ingredients when you confirm
                                                    your selections.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="row">
                                    <div className="col-12">
                                        {meals?.length > 0 ? (
                                            <div className="position-relative meals-menu-portion">
                                                <div className="cards-wrapper px-2">
                                                    <div className="row">
                                                        {meals?.map((item, i) => {
                                                            let temp_mealcategories =
                                                                item.mealcategories !== '' ? item.mealcategories?.split(';') ?? [] : [];
                                                            let mealcategories = [];
                                                            for (let i = 0; i < temp_mealcategories?.length; i++) {
                                                                let [key, value] = temp_mealcategories[i]?.split(',');
                                                                mealcategories.push({ meal_category_id: key, meal_category_name: value });
                                                            }
                                                            return (
                                                                <div key={i} className="col-12 px-0 mealSelector">
                                                                    <div
                                                                        className="meal_wrapper by_unit_wrapper"
                                                                        onClick={() =>
                                                                            (meal_pack_category_id ? item.extra_high_price : item.highest_upgrade_price)
                                                                                ? handleSelectMealPortion(item)
                                                                                : handleAddSingleMeal(item)
                                                                        }
                                                                    >
                                                                        <div className="horizontal-card">
                                                                            <div className="horizontal-card-image">
                                                                                <span
                                                                                    className="clean-badge primary-bg-cls more-info"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setOpenModalByUnit({ show: true, id: item.ingredient_id });
                                                                                    }}
                                                                                >
                                                                                    + info
                                                                                </span>
                                                                                <img
                                                                                    width="100%"
                                                                                    height="100%"
                                                                                    className="border-0"
                                                                                    src={item.ingredient_image ?? Placeholder}
                                                                                    alt={item.display_name}
                                                                                    title={item.display_name}
                                                                                    onError={(e) => {
                                                                                        e.target.src = Placeholder;
                                                                                    }}
                                                                                />
                                                                                <div className="badges-position">
                                                                                    {item.is_new === 1 && (
                                                                                        <div className="square_badge badge new-item-badge">
                                                                                            <span className="">New Item</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {item.is_contain_allergies === 1 && (
                                                                                        <div className="square_badge badge allergen-badge ms-2">
                                                                                            <i
                                                                                                title="Contains Allergens"
                                                                                                className="fas fa-exclamation-triangle mb-1"
                                                                                            ></i>
                                                                                            ALERGEN
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            <div className="horizontal-card-details ellipsis">
                                                                                <div className="">
                                                                                    {meal_pack_category_id ? (
                                                                                        ((!item.extra_high_price && item.extra_low_price > 0) ||
                                                                                            item.extra_high_price) && (
                                                                                            <span className="badge square_badge">
                                                                                                <span className="">
                                                                                                    <i className="fas fa-tags"></i>
                                                                                                    {item.extra_high_price
                                                                                                        ? ` $${item.extra_low_price} - $${item.extra_high_price}`
                                                                                                        : ` + ${item.extra_low_price}`}
                                                                                                </span>
                                                                                            </span>
                                                                                        )
                                                                                    ) : (
                                                                                        <span className="badge square_badge">
                                                                                            <span className="">
                                                                                                <i className="fas fa-tags"></i>{' '}
                                                                                                {`$${item.regular_meal_prep_price} ${item.highest_upgrade_price ? '- $' + item.highest_upgrade_price : ''
                                                                                                    }`}
                                                                                            </span>
                                                                                        </span>
                                                                                    )}
                                                                                    {item.is_chef_fav === 1 && (
                                                                                        <span className="square_badge badge back_danger">
                                                                                            <span className="">Chef's Favorite</span>
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                <h1 className="mt-2 mb-1 ellipsis font-size-16">{item.display_name}</h1>
                                                                                <p className="font-size-14 fw-light d-md-block d-none">
                                                                                    {item.meal_description}
                                                                                </p>

                                                                                <div className="calories d-flex align-items-center flex-wrap">
                                                                                    <div className="meal-calories primary-color-cls">
                                                                                        <i className="fas fa-fire me-1"></i>
                                                                                        <b>{FixedDecimal(item.quantity)}</b> Calories
                                                                                    </div>
                                                                                    <div className="circle-18 ms-2 d-sm-flex d-none">
                                                                                        {mealcategories?.map((f) => (
                                                                                            <span
                                                                                                className="text-light bg-dark font-size-12"
                                                                                                title={f.meal_category_name}
                                                                                                key={f.meal_category_id}
                                                                                            >
                                                                                                {f.meal_category_name?.[0]}
                                                                                            </span>
                                                                                        ))}
                                                                                    </div>
                                                                                    <span className="select_portion_inc ms-2">
                                                                                        {(
                                                                                            meal_pack_category_id ? item.extra_high_price : item.highest_upgrade_price
                                                                                        ) ? (
                                                                                            <button
                                                                                                className="btn new_button_square_small primary-bg-cls px-2"
                                                                                                type="button"
                                                                                            >
                                                                                                <i className="fas fa-plus"></i>
                                                                                                <span className="d-md-inline d-none ms-2">Select Portion</span>
                                                                                            </button>
                                                                                        ) : (
                                                                                            <button
                                                                                                className="btn new_button_square_small primary-bg-cls px-2"
                                                                                                type="button"
                                                                                            >
                                                                                                <i className="fas fa-plus"></i>
                                                                                                <span className="d-md-inline d-none ms-2">Select</span>
                                                                                            </button>
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="row meals-menu-portion">
                                                <div className="col-xs-12 spacer-top text-center">
                                                    <div className="text-center">
                                                        <img
                                                            loading="lazy"
                                                            src={emptyData}
                                                            alt="No meals available. Try to change the preferences on the menu."
                                                            title="No meals available. Try to change the preferences on the menu."
                                                        />
                                                        <p>No meals available. Try to change the preferences on the menu.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </ModalBody>
                {isLoading && (
                    <div className="divSuccess">
                        <div className="h-100 d-flex align-items-center justify-content-center flex-column">
                            <img src={SuccessGif} height="70px" width="70px" />
                            <h2 className="text-center">Successfully selected meal!</h2>
                        </div>
                    </div>
                )}
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    {selectMeal.show ? (
                        <>
                            <button
                                className="col-6"
                                onClick={() => {
                                    setPortionSizes((prevState) => prevState?.map((f) => ({ ...f, quantity: 0 })) ?? []);
                                    setselectMeal({ show: false, meal: null, is_disabled: true });
                                }}
                            >
                                Back
                            </button>
                            <button
                                disabled={selectMeal.is_disabled}
                                className={`col-6 back-success ${selectMeal.is_disabled ? 'disabled' : ''}`}
                                onClick={() => handleConfirmSelection()}
                            >
                                Confirm selection
                            </button>
                        </>
                    ) : (
                        <button className="col-12" onClick={() => states.setOpenSelectMealsModal({ show: false, data: null })}>
                            Close
                        </button>
                    )}
                </ModalFooter>
            </Modal>

            <Modal isOpen={states.beforeFinishingModal} centered className="modal modal-650 modal-not-centered">
                <ModalHeader className="border-0 justify-content-end">
                    <button
                        type="button"
                        onClick={() => states.setBeforeFinishingModal(false)}
                        className="btn "
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <i className="far fa-times-circle font-size-24"></i>
                    </button>
                </ModalHeader>
                <ModalBody className="text-center">
                    <img src={FoodLoader} />
                    <h3 className="font-size-28 h3">BEFORE FINISHING...</h3>
                    <span className="font-size-24">Would you like to add another pack?</span>
                    <p className="font-size-12">(Sunday, Feb 18, 2024)</p>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button
                        className="col-6 border-end"
                        onClick={() => {
                            states.setBeforeFinishingModal(false);
                            setAllMealsSelectedModal(true);
                        }}
                    >
                        No
                    </button>
                    <button
                        className="col-6"
                        onClick={() => {
                            states.setBeforeFinishingModal(false);
                            functions.handleAddMealPack();
                        }}
                    >
                        Yes
                    </button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={allMealsSelectedModal} centered className="modal modal-650 modal-not-centered">
                <ModalHeader className="border-0 justify-content-end">
                    <button
                        type="button"
                        onClick={() => setAllMealsSelectedModal(false)}
                        className="btn "
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <i className="far fa-times-circle font-size-24"></i>
                    </button>
                </ModalHeader>
                <ModalBody className="text-center">
                    <img src={SuccessGif} />
                    <h3 className="font-size-28 h3">ALL MEALS SELECTED</h3>
                    <span className="font-size-24">You selected all the meals for this pack</span>
                    <p className="font-size-12">(Sunday, Feb 18, 2024)</p>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button className="w-100 font-size-16" onClick={() => setAllMealsSelectedModal(false)}>
                        Continue to Cart
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
                <OffcanvasBody className="p-0">
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
                                            <label className="d-flex form-check-label" htmlFor="with_my_allergens">
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
                                            <label className="d-flex form-check-label" htmlFor="with_my_dislikes">
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
                                            <label className="d-flex form-check-label" htmlFor="show_my_diet_preference">
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
                                            <label className="d-flex form-check-label" htmlFor="show_premium_only">
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
                                            <label className="d-flex form-check-label" htmlFor="show_custom_only">
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
                            <a
                                className="btn new_button_square_big_outline_sidebar bg-white mb-0 indent-0 w-100"
                                type="button"
                                onClick={() => handleApplyFilter('clear')}
                            >
                                Clear
                            </a>
                        </li>
                    </ul>
                </OffcanvasBody>
            </Offcanvas>
        </React.Fragment>
    );
}
