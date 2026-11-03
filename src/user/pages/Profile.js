import React, { useEffect, useState } from 'react';
import Topbar from '../../pages/common/Topbar';
import Landing from '../../pages/common/Landing';
import { Modal, ModalBody, ModalFooter } from 'reactstrap';
import { PostApi } from '../../services/ApiService';
import { API_PATH } from '../../admin/constants/const';
import { API_PATH_USER } from '../../const';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import AlertBanner from '../../assets/images/alert-banner.svg'

export default function Profile() {
    const [selectAllergenModal, setSelectAllergenModal] = useState(false);
    const [selectDislikeModal, setSelectDislikeModal] = useState(false);
    const [selectDietPrefModal, setSelectDietPrefModal] = useState(false);
    const [changePassModal, setChangePassModal] = useState(false);
    const [addCardModal, setAddCardModal] = useState(false);
    const [allergens, setAllergens] = useState([]);
    const [selectedAllergens, setSelectedAllergens] = useState({ temp: [], main: [] });
    const [selectedDislikes, setSelectedDislikes] = useState({ temp: [], main: [] });
    const [dislikes, setDislikes] = useState([]);
    const [timer, setTimer] = useState(null);

    useEffect(() => {
        GetAllAllergens();
        GetAllDislikes();
        GetAllergenPreferences();
        GetDislikePreferences();
    }, []);

    const GetAllAllergens = async (searchVal = '') => {
        const response = await PostApi(API_PATH.getIngredientAllergens, {
            type: 'all',
            search_name: searchVal
        });
        if (response.statusCode === 200) {
            setAllergens(response.data.data_result);
        }
    };

    const GetAllDislikes = async (searchVal = '') => {
        const response = await PostApi(API_PATH.getIngredientDislikes, {
            type: 'all',
            search_name: searchVal
        });
        if (response.statusCode === 200) {
            setDislikes(response.data.data_result);
        }
    };

    const GetAllergenPreferences = async () => {
        const response = await PostApi(API_PATH_USER.GetAllergenPreferences);
        if (response.statusCode === 200) {
            let allergenRes = response.data[0]?.allergens?.split(',') ?? [];
            let arr = allergenRes?.map((f) => f.split(':')?.[0]);
            setSelectedAllergens({ temp: arr, main: arr });
        }
    };

    const GetDislikePreferences = async () => {
        const response = await PostApi(API_PATH_USER.GetDislikePreferences);
        if (response.statusCode === 200) {
            let dislikeRes = response.data[0].allergenDislike?.split(',') ?? [];
            let arr = dislikeRes?.map((f) => f.split(':')?.[0]);
            setSelectedDislikes({ temp: arr, main: arr });
        }
    };

    const handleSelectAllergenDislike = (item, type) => {
        let tempAllergens = [...selectedAllergens.temp];
        let tempDislikes = [...selectedDislikes.temp];
        if (type === 'allergen') {
            if (!tempAllergens?.includes(item.ingredient_allergen_id)) tempAllergens.push(item.ingredient_allergen_id);
            else {
                let index = tempAllergens?.findIndex((f) => f === item.ingredient_allergen_id);
                tempAllergens.splice(index, 1);
            }
        } else {
            if (!tempDislikes?.includes(item.ingredient_dislike_id)) tempDislikes.push(item.ingredient_dislike_id);
            else {
                let index = tempDislikes?.findIndex((f) => f === item.ingredient_dislike_id);
                tempDislikes.splice(index, 1);
            }
        }
        setSelectedAllergens({ ...selectedAllergens, temp: tempAllergens });
        setSelectedDislikes({ ...selectedDislikes, temp: tempDislikes });
    };

    const handleSearch = (e, type) => {
        if (timer) {
            clearTimeout(timer);
            setTimer(null);
        }
        setTimer(
            setTimeout(() => {
                if (type === 'allergen') GetAllAllergens(e.target.value);
                else GetAllDislikes(e.target.value);
            }, 1000)
        );
    };

    const handleSaveAllergen = async () => {
        const response = await PostApi(API_PATH_USER.AddAllergenPreferences, { allergen_ids: selectedAllergens.temp });
        if (response.statusCode === 200) {
            toast.success(response.data);
            GetAllergenPreferences();
        }
        setSelectAllergenModal(false);
    };

    const handleSaveDislike = async () => {
        const response = await PostApi(API_PATH_USER.AddDislikePreferences, { dislike_ids: selectedDislikes.temp });
        if (response.statusCode === 200) {
            toast.success(response.data);
            GetDislikePreferences();
        }
        setSelectDislikeModal(false);
    };

    return (
        <React.Fragment>
            <Topbar />
            <Landing>
                <div className="profile">
                    <div className="d-flex flex-wrap back_content">
                        <div className="col-12 col-lg-2 back_sidemenu padding-xs-col">
                            <div className="d-lg-none d-block row">
                                <div>
                                    <nav role="navigation">
                                        <div className="profileSidebar">
                                            <input type="checkbox" />
                                            <div className="back_primary TriggerButton">
                                                <i className="fas fa-user-cog"></i>
                                                Edit Profile Settings
                                            </div>
                                        </div>
                                    </nav>
                                </div>
                            </div>
                            <ul className="navProfile navProfile-stacked subNav d-lg-block d-none marginBottom">
                                <li>
                                    <div className="avatar-upload">
                                        <div className="avatar-edit">
                                            <input name="image" id="image" type="file" accept="image/*;capture=camera" />
                                            <label htmlFor="image"></label>
                                        </div>
                                        <div className="avatar-preview">
                                            <div style={{ backgroundImage: "url('https://lifestylemeals.ttpfitness.com/data/users/359.jpg?md=151cf7f3ded26f7cba7897e90e7802ee')" }}></div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div className="padding-xs-col">
                                        <h2 className="mb-3">Welcome </h2>
                                    </div>

                                    <Link className="cursor" to="/profile">
                                        <small className="font-size-12">Jinal Mathukiya</small>
                                    </Link>
                                </li>

                                <li className="marginTop paddingTop spacer">
                                    <Link to="/logout">
                                        <i className="fas fa-power-off"></i>
                                        Log off
                                    </Link>
                                </li>
                                <hr />

                                <li className="active">
                                    <Link to="/profile">
                                        <span className="d-flex align-items-center">
                                            <svg className="" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                                ></path>
                                            </svg>
                                            <span className="ms-1">My Profile</span>
                                        </span>
                                    </Link>
                                    <span className="position-absolute active-menu-span"></span>
                                </li>
                                <li className="position-relative py-1">
                                    <a className="align-items-center w-100 transition-colors duration-150  hover:text-green-600 dark:hover:text-green-600 text-slate-900">
                                        <span className="d-flex align-items-center">
                                            <svg className="" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                                                ></path>
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                                                ></path>
                                            </svg>
                                            <span className="ms-1">My Subscription</span>
                                        </span>
                                    </a>
                                </li>
                                <li className="menuSubMenu menu2">
                                    <ul className="navProfile navProfile-stacked">
                                        <li className="">
                                            <Link to="/subscription">
                                                <i className="fas fa-angle-right"></i> Subscription{' '}
                                            </Link>
                                        </li>
                                        <li className="">
                                            <Link to="">
                                                <i className="fas fa-angle-right"></i> Select meals{' '}
                                            </Link>
                                        </li>
                                        <li className="">
                                            <Link to="">
                                                <i className="fas fa-angle-right"></i> Macro Tracking{' '}
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                                <li className="position-relative py-1">
                                    <a className="align-items-center w-100  transition-colors duration-150  hover:text-green-600 dark:hover:text-green-600 text-slate-900">
                                        <span className="d-flex align-items-center">
                                            <svg className="" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
                                                ></path>
                                            </svg>
                                            <span className="ms-1">My Checkouts</span>
                                        </span>
                                    </a>
                                </li>
                                <li className="menuSubMenu menu3">
                                    <ul className="navProfile navProfile-stacked">
                                        <li className="">
                                            <Link to="">
                                                <i className="fas fa-angle-right"></i> Bags{' '}
                                            </Link>
                                        </li>
                                        <li className="">
                                            <Link to="">
                                                <i className="fas fa-angle-right"></i> Checkouts{' '}
                                            </Link>
                                        </li>
                                        <li className="">
                                            <Link to="">
                                                <i className="fas fa-angle-right"></i> Digital Wallet Transactions{' '}
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div className="col-12 col-lg-10 mb-5 back_content responsive-container-admin">
                            <div className="row pt-2">
                                <div className="col-12">
                                    <div className="card_table">
                                        <div className="row">
                                            <div className="col-md-8 col-12">
                                                <h2>Add your Birthday date and receive a Discount code</h2>
                                            </div>
                                            <div className="col-md-4 col-12 text-end">
                                                <label htmlFor="txBirthdate" className="btn primary-bg-cls new_button_square_big">
                                                    ADD NOW
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row profile_wrapper spacer-top">
                                <div className="col-md-8 col-sm-8 col-12">
                                    <div className="card_table">
                                        <div className="row">
                                            <div className="col-12 border-bottom">
                                                <h2>My Profile</h2>
                                            </div>
                                            <div className="col-12 col-sm-6">
                                                <div className="form-group">
                                                    <label className="control-label">First Name</label>
                                                    <input type="text" placeholder="First Name" className="form-control border-bottom-input" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-6">
                                                <div className="form-group">
                                                    <label className="control-label">Last Name</label>
                                                    <input type="text" placeholder="Last Name" className="form-control border-bottom-input" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-6">
                                                <div className="form-group is-empty">
                                                    <label className="control-label">Birthday</label>
                                                    <input type="date" id="txBirthdate" className="form-control datepicker border-bottom-input" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-6">
                                                <div className="form-group ">
                                                    <label className="control-label">Phone</label>
                                                    <input
                                                        type="text"
                                                        placeholder="(xxx)-xxx-xxxx"
                                                        className="form-control border-bottom-input"
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-12 col-sm-4">
                                                <div className="form-check form-switch form-switch-md">
                                                    <input type="checkbox" className="form-check-input" id="receive_sms" />
                                                    <label className="d-flex form-check-label" htmlFor="receive_sms">
                                                        Receive SMS?
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-check form-switch form-switch-md">
                                                    <input type="checkbox" className="form-check-input" id="receive_email" />
                                                    <label className="d-flex form-check-label" htmlFor="receive_email">
                                                        Receive Emails?
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4 text-end">
                                                <button type="submit" className="new_button_square_big btn primary-bg-cls">
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-4 col-12 mt-4 mt-sm-0">
                                    <div className="new_card_points">
                                        <div className="new_card_text h-100 d-flex justify-content-center align-items-center">
                                            <div className="col-md-12">
                                                <h2>Digital wallet</h2>
                                                <h1>$0.00</h1>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cart_new">
                                        <button
                                            className="btn w-100 new_button_square_big bg-dark"
                                            onClick={() => setChangePassModal(true)}
                                        >
                                            Change Password
                                        </button>
                                    </div>

                                    <div className="macroGraph row w-100 mx-auto">
                                        <span className="font-size-16 fw-bold ps-0">My Macronutrients</span>
                                        <div className="col-12 p-2  macrograph-subcontainer">
                                            <div className="col-12 ps-0 text-right">
                                                <div className="text-end">
                                                    <span className="h3">
                                                        <span className="bold total_macros_1_«ID» totalsMacro_«ID»"></span>{' '}
                                                        <span className="bold">Calories</span>
                                                    </span>
                                                </div>
                                                <div className="text-end">
                                                    <span className=" text-primary">
                                                        <span className="total_macros_1_percentage_«ID» totalsMacroPercentage_«ID»"></span> Daily
                                                        2000 cal
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-12 mt-3 ps-0">
                                                <div className="row">
                                                    <div className="col-6">
                                                        <div className="progress-container progress-primary">
                                                            <span className="progress-badge">Total Fat </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="progress-value">
                                                            <span className="total_macros_4_«ID» totalsMacro_«ID»">78</span> gr
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">
                                                        <div className="progress-container progress-primary">
                                                            <span className="progress-badge">Total Carbohydrate </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="progress-value">
                                                            <span className="total_macros_3_«ID» totalsMacro_«ID»">275</span> gr
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">
                                                        <div className="progress-container progress-primary">
                                                            <span className="progress-badge">Protein </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="progress-value">
                                                            <span className="total_macros_2_«ID» totalsMacro_«ID»">50</span> gr
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-center mt-4 px-0">
                                            <button type="button" className="btn w-100 new_button_square_big bg-dark">
                                                Set Recommended Daily Value
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="profile_banners">
                                <div className="d-flex my-4">
                                    <div className="banner_button tall banner2 d-flex align-items-center justify-content-center">
                                        <div className="banner_text">
                                            <h1>Invite your friends and get money!</h1>
                                            <div className="banner_image img1">
                                                <i className="fas fa-cloud"></i>
                                            </div>
                                            <div className="cart_new">
                                                <button type="button" className="btn_cart_next btn_banner">
                                                    Invite a friend
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="banner_button tall d-flex align-items-center justify-content-center">
                                        <div className="banner_text">
                                            <h1>Start spending that gift money!</h1>
                                            <div className="banner_image">
                                                <i className="fas fa-cloud"></i>
                                            </div>
                                            <div id="redeem_btn" className="cart_new">
                                                <button type="button" className="btn_cart_next btn_banner">
                                                    Redeem Gift Card
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row preferences_wrapper">
                                <div className="col-12">
                                    <div className="card_table">
                                        <div className="border-bottom">
                                            <h2>My Meal Preferences</h2>
                                        </div>
                                        <div className="row mt-3 align-items-center">
                                            <div className="col-12 col-sm-8 col-md-8">
                                                <div className="">
                                                    <div className="card_table mt-3">
                                                        <div className="row">
                                                            <div className="col-12 col-sm-8">
                                                                <h2 className="mt-0 mb-3">Select your allergens</h2>
                                                                <div className="d-flex flex-wrap">
                                                                    {selectedAllergens?.main?.map((item) => {
                                                                        let allergen = allergens?.find((f) => f.ingredient_allergen_id === item);
                                                                        return (
                                                                            <div className="text-center profileSelected">
                                                                                <span>{allergen?.ingredient_allergen_name}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-4">
                                                                <button
                                                                    className="new_button_square_big btn primary-bg-cls w-100"
                                                                    onClick={() => setSelectAllergenModal(true)}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <div className="card_table mt-3">
                                                        <div className="row">
                                                            <div className="col-12 col-sm-8">
                                                                <h2 className="mt-0 mb-3">Select your dislikes</h2>
                                                                <div className="d-flex flex-wrap">
                                                                    {selectedDislikes?.main?.map((item) => {
                                                                        let dislike = dislikes?.find((f) => f.ingredient_dislike_id === item);
                                                                        return (
                                                                            <div className="text-center profileSelected" key={item}>
                                                                                <span>{dislike?.ingredient_dislike_name}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-4">
                                                                <button
                                                                    className="new_button_square_big btn primary-bg-cls w-100"
                                                                    onClick={() => setSelectDislikeModal(true)}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <div className="card_table mt-3">
                                                        <div className="row">
                                                            <div className="col-12 col-sm-8">
                                                                <h2 className="mt-0 mb-3">
                                                                    Select your diet preferences - <small>OR</small>
                                                                </h2>
                                                            </div>

                                                            <div className="col-12 col-sm-4">
                                                                <button
                                                                    className="new_button_square_big btn primary-bg-cls w-100"
                                                                    onClick={() => setSelectDietPrefModal(true)}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4 col-md-4">
                                                <div className="big_banner text-center">
                                                    <div className="banner_text col-12">
                                                        <h2 className="text-center text-white">
                                                            Don't forget to set your preferences so our system can automatically filter meals that
                                                            you'd want to eat!
                                                        </h2>
                                                    </div>
                                                    <div className="big_image col-12">
                                                        <img
                                                            src={AlertBanner}
                                                            alt="Don't forget to set your preferences"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row shipping_wrapper spacer-top">
                                <div className="col-12">
                                    <div className="card_table">
                                        <div className="row">
                                            <div className="col-12 border-bottom">
                                                <h2>My Shipping Address</h2>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label className="control-label">Street Address</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Street Address"
                                                        className="form-control border-bottom-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label className="control-label">Street Address #2 (Unit, APT, Bldg, etc…)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Street Address #2 (Unit, APT, Bldg, etc…)"
                                                        className="form-control border-bottom-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label className="control-label">City</label>
                                                    <input type="text" placeholder="City" className="form-control border-bottom-input" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label className="control-label">State</label>
                                                    <select className="form-select">
                                                        <option>--Select--</option>
                                                        <option>Oregon</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label className="control-label">Zip Code</label>
                                                    <input type="text" placeholder="Zip Code" className="form-control border-bottom-input" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group ">
                                                    <label className="control-label">Phone</label>
                                                    <input
                                                        type="text"
                                                        placeholder="(xxx)-xxx-xxxx"
                                                        className="form-control border-bottom-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label className="control-label">Gate Code</label>
                                                    <input type="text" placeholder="Gate Code" className="form-control border-bottom-input" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label className="control-label">Delivery Note</label>
                                                    <input type="text" placeholder="Delivery Note" className="form-control border-bottom-input" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4 text-end align-self-end">
                                                <button type="submit" className="new_button_square_big btn primary-bg-cls">
                                                    Save Shipping
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row address_wrapper spacer-top">
                                <div className="col-12">
                                    <div className="card_table">
                                        <div className="row">
                                            <div className="col-12 border-bottom">
                                                <h2>My Billing Address</h2>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label className="control-label">Street Address</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Street Address"
                                                        className="form-control border-bottom-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label className="control-label">City</label>
                                                    <input type="text" placeholder="City" className="form-control border-bottom-input" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label className="control-label">State</label>
                                                    <select className="form-select">
                                                        <option>--Select--</option>
                                                        <option>Oregon</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label className="control-label">Zip Code</label>
                                                    <input type="text" placeholder="Zip Code" className="form-control border-bottom-input" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-8 text-end align-self-end">
                                                <button type="submit" className="new_button_square_big btn primary-bg-cls">
                                                    Save Billing
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row cards_wrapper spacer-top">
                                <div className="col-12">
                                    <div className="card_table">
                                        <div className="row">
                                            <div className="col-md-6 col-12">
                                                <h2>
                                                    My Cards
                                                    <span className="clean-badge primary-bg-cls ms-2 font-size-11">Default Kitchen</span>
                                                </h2>
                                            </div>
                                            <div className="col-md-6 col-12 text-end">
                                                <button className="btn bg-dark new_button_square_big" onClick={() => setAddCardModal(true)}>
                                                    Add new Card
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Landing>

            <Modal isOpen={selectAllergenModal} centered className="modal modal-650 modal-not-centered profile">
                <ModalBody>
                    <div className="row">
                        <div className="col-12 text-center modal_action_content">
                            <h1 className="text-uppercase fw-bolder font-size-24">Select your allergens</h1>
                        </div>
                    </div>
                    <div className="">
                        <div className="row">
                            <div className="col-12">
                                <div className="form-group is-empty">
                                    <label className="control-label ">Search</label>
                                    <input
                                        type="search"
                                        className="form-control border-bottom-input"
                                        placeholder="Search"
                                        onChange={(e) => handleSearch(e, 'allergen')}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-wrap align-items-center">
                            {allergens?.map((item) => {
                                return (
                                    <div className="profileDeselected" key={item.ingredient_allergen_id}>
                                        <div
                                            className={`allergen text-center ${selectedAllergens?.temp?.includes(item.ingredient_allergen_id) ? 'profileSelected' : ''
                                                }`}
                                            onClick={() => handleSelectAllergenDislike(item, 'allergen')}
                                        >
                                            <span className="">{item.ingredient_allergen_name}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button
                        className="col-6 border-end"
                        onClick={() => {
                            setSelectAllergenModal(false);
                            setSelectedAllergens({ ...selectedAllergens, temp: selectedAllergens.main });
                        }}
                    >
                        Cancel
                    </button>
                    <button className="col-6" onClick={() => handleSaveAllergen()}>
                        Save
                    </button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={selectDislikeModal} centered className="modal modal-650 modal-not-centered profile">
                <ModalBody>
                    <div className="row">
                        <div className="col-12 text-center modal_action_content">
                            <h1 className="text-uppercase fw-bolder font-size-24">Select your dislikes</h1>
                        </div>
                    </div>
                    <div className="">
                        <div className="row">
                            <div className="col-12">
                                <div className="form-group is-empty">
                                    <label className="control-label ">Search</label>
                                    <input
                                        type="search"
                                        className="form-control border-bottom-input"
                                        placeholder="Search"
                                        onChange={(e) => handleSearch(e, 'dislike')}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-wrap align-items-center">
                            {dislikes?.map((item) => {
                                return (
                                    <div className="profileDeselected" key={item.ingredient_dislike_id}>
                                        <div
                                            className={`dislike text-center ${selectedDislikes?.temp?.includes(item.ingredient_dislike_id) ? 'profileSelected' : ''
                                                }`}
                                            onClick={() => handleSelectAllergenDislike(item, 'dislike')}
                                        >
                                            <span className="">{item.ingredient_dislike_name}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button
                        className="col-6 border-end"
                        onClick={() => {
                            setSelectDislikeModal(false);
                            setSelectedDislikes({ ...selectedDislikes, temp: selectedDislikes.main });
                        }}
                    >
                        Cancel
                    </button>
                    <button className="col-6" onClick={() => handleSaveDislike()}>
                        Save
                    </button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={selectDietPrefModal} centered className="modal modal-650 modal-not-centered profile">
                <ModalBody>
                    <div className="row">
                        <div className="col-12 text-center modal_action_content">
                            <h1 className="text-uppercase fw-bolder font-size-24">Select your diet preferences</h1>
                        </div>
                    </div>
                    <div className="">
                        <div className="row">
                            <div className="col-12">
                                <div className="form-group is-empty">
                                    <label className="control-label">Select</label>
                                    <select className="form-select form-control border-bottom-input">
                                        <option>Show meals that match any one of the options selected -- OR</option>
                                        <option>Show meals that match every option selected - AND</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button
                        className="col-6 border-end"
                        onClick={() => {
                            setSelectDietPrefModal(false);
                        }}
                    >
                        Cancel
                    </button>
                    <button className="col-6">Save</button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={changePassModal} centered className="modal modal-lg modal-not-centered profile">
                <ModalBody>
                    <div className="row">
                        <div className="col-12 modal_action_content">
                            <h3 className="font-size-20">Change Password</h3>
                            <button
                                type="button"
                                onClick={() => setChangePassModal(false)}
                                className="close"
                                data-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                    </div>
                    <div className="">
                        <div className="row">
                            <div className="col-12">
                                <div className="form-group">
                                    <label className="control-label">Old Password</label>
                                    <input type="text" placeholder="Old Password" className="form-control border-bottom-input" />
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="form-group">
                                    <label className="control-label">New Password</label>
                                    <input type="text" placeholder="New Password" className="form-control border-bottom-input" />
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="form-group">
                                    <label className="control-label">Repeat new Password</label>
                                    <input type="text" placeholder="Repeat new Password" className="form-control border-bottom-input" />
                                </div>
                            </div>
                            <div className="col-12 text-end mt-3">
                                <button className="primary-bg-cls btn">Save</button>
                            </div>
                        </div>
                    </div>
                </ModalBody>
            </Modal>

            <Modal isOpen={addCardModal} centered className="modal modal-not-centered profile">
                <ModalBody>
                    <div className="row">
                        <div className="col-12 modal_action_content text-center">
                            <h3 className="font-size-20">ADD NEW CARD</h3>
                        </div>
                    </div>
                    <div className="">
                        <div className="row">
                            <div className="col-12">
                                <div className="form-group">
                                    <label className="control-label">Card number</label>
                                    <input
                                        type="text"
                                        placeholder="1234 1234 1234 1234"
                                        maxLength={16}
                                        className="form-control border-bottom-input"
                                    />
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="form-group">
                                    <label className="control-label">Expires date</label>
                                    <input type="text" placeholder="MM / YY" className="form-control border-bottom-input" />
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="form-group">
                                    <label className="control-label">Code</label>
                                    <input type="text" placeholder="CVC" className="form-control border-bottom-input" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button className="col-6 border-end" onClick={() => setAddCardModal(false)}>
                        Cancel
                    </button>
                    <button className="col-6">Save</button>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    );
}
