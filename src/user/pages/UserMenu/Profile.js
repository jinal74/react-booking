import React, { useContext, useEffect, useRef, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { PostApi } from '../../../services/ApiService';
import { API_PATH } from '../../../admin/constants/const';
import { API_PATH_USER } from '../../../const';
import { toast } from 'react-toastify';
import AlertBanner from '../../../assets/images/alert-banner.svg';
import cheapImg from '../../../assets/images/chip.png';
import littleSquare from '../../../assets/images/little_square.png';
import UserMenu from '.';
import { IconLoader } from '../../../admin/Loader/IconLoader';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../helpers/func_helper';
import { Context } from '../../../context/GeneralContext';
import { auth } from '../../../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

export default function Profile() {
    const context = useContext(Context);
    const stripe = useStripe();
    const elements = useElements();

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
    const [addresses, setAddresses] = useState({ Billing: null, Shipping: null });
    const [states, setStates] = useState([]);
    const [cards, setCards] = useState([]);
    const [nutritionCalShow, setNutritionCalShow] = useState(false);
    const [macroCalShow, setMacroCalShow] = useState(false);

    useEffect(() => {
        if (context.user_details) {
            GetAddresses();
            GetCards();
        }
    }, [context.user_details]);

    useEffect(() => {
        GetAllStates();
        GetAllAllergens();
        GetAllDislikes();
        GetAllergenPreferences();
        GetDislikePreferences();
    }, []);

    const GetAllAllergens = async (searchVal = '') => {
        const response = await PostApi(API_PATH.getIngredientAllergens, {
            type: 'all',
            search_name: searchVal,
        });
        if (response.statusCode === 200) {
            setAllergens(response.data.data_result);
        }
    };

    const GetCards = async () => {
        const response = await PostApi(API_PATH_USER.GetCards);
        if (response?.statusCode === 200) {
            let data = response.data;
            setCards(data);
        }
    };

    const GetAddresses = async () => {
        const response = await PostApi(API_PATH_USER.GetAddresses);
        let Shipping = null;
        let Billing = null;
        if (response?.statusCode === 200) {
            let data = response.data;

            if (data) {
                Shipping = data.find((f) => f.address_type === 'Shipping') || {
                    address_type: 'Shipping',
                    street_address: '',
                    street_address_2: '',
                    city: '',
                    state: '',
                    zip: '',
                    phone: '',
                    gate_code: '',
                    delivery_notes: '',
                };
                Billing = data.find((f) => f.address_type === 'Billing') || {
                    address_type: 'Billing',
                    street_address: '',
                    city: '',
                    state: '',
                    zip: '',
                };
            }
        } else {
            Shipping = {
                address_type: 'Shipping',
                street_address: '',
                street_address_2: '',
                city: '',
                state: '',
                zip: '',
                phone: '',
                gate_code: '',
                delivery_notes: '',
            };
            Billing = {
                address_type: 'Billing',
                street_address: '',
                city: '',
                state: '',
                zip: '',
            };
        }
        setAddresses({ Billing, Shipping });
    };

    const GetAllStates = async () => {
        const response = await PostApi(API_PATH.getallDeliveryStates, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            setStates(response.data.data_result ?? []);
        }
    };

    const GetAllDislikes = async (searchVal = '') => {
        const response = await PostApi(API_PATH.getIngredientDislikes, {
            type: 'all',
            search_name: searchVal,
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

    const handleDeleteCard = async (id) => {
        const response = await PostApi(API_PATH_USER.DeleteCards, { payment_card_id: id });
        if (response.statusCode === 200) {
            toast.success('Card deleted successfully');
            GetCards();
        }
    }

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

    const handleSubmitAddress = async (values) => {
        let tempObj = JSON.parse(JSON.stringify(values));
        // tempObj.is_save = true;
        tempObj.type = tempObj.address_type;
        delete tempObj.address_type;

        const response = await PostApi(API_PATH_USER.UpdateAdresses, tempObj);
        if (response.statusCode === 200) {
            toast.success(`${tempObj.type} address updated successfully`);
            setAddresses((prevState) => ({ ...prevState, [tempObj.type]: values }));
        }
    };

    const handleSubmitCard = async (event) => {
        event.preventDefault();
        const cardElement = elements.getElement(CardElement);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            toast.error(error.message);
        } else {
            const response = await PostApi(API_PATH_USER.AddCards, {
                card_number: paymentMethod.card.last4,
                card_expiry_date: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`,
                kitchen_location_id: context?.selected_location?.kitchen_location_id,
                pm_id: paymentMethod.id,
                card_type: paymentMethod.card.brand
            });
            if (response.statusCode === 200) {
                toast.success(`Card added successfully`);
                GetCards();
                setAddCardModal(false);
            }
        }
    }

    const reauthenticate = (currentPassword) => {
        const user = auth.currentUser;
        const cred = EmailAuthProvider.credential(user.email, currentPassword);
        return reauthenticateWithCredential(user, cred);
    };

    const handleChangePassword = (values) => {
        const user = auth.currentUser;
        const currentPassword = values.oldPassword;
        const newPassword = values.newPassword;

        reauthenticate(currentPassword).then(() => {
            updatePassword(user, newPassword).then(() => {
                toast.success('Password updated successfully');
                setChangePassModal(false);
            }).catch((error) => {
                console.error('Error updating password:', error);
            });
        }).catch((error) => {
            toast.error('incorrect old password');
        });
    };

    return (
        <React.Fragment>
            <UserMenu>
                <div className="responsive-container-admin">
                    <div className="row pt-2">
                        <div className="col-12">
                            <div className="card_table">
                                <div className="row">
                                    <div className="col-md-8 col-12">
                                        <h2>Add your Birthday date and receive a Discount code</h2>
                                    </div>
                                    <div className="col-md-4 col-12 text-end">
                                        <label onClick={() => document.getElementById('txBirthdate').click()} className="btn primary-bg-cls new_button_square_big">
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
                                            <input type="text" placeholder="(xxx)-xxx-xxxx" className="form-control border-bottom-input" />
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
                                <button className="btn w-100 new_button_square_big bg-dark" onClick={() => setChangePassModal(true)}>
                                    Change Password
                                </button>
                            </div>

                            <div className="macroGraph row w-100 mx-auto">
                                <span className="font-size-16 fw-bold ps-0">My Macronutrients</span>
                                <div className="col-12 p-2  macrograph-subcontainer">
                                    <div className="col-12 ps-0 text-end">
                                        <div className="text-end">
                                            <span className="h3">
                                                <span className="bold total_macros_1_«ID» totalsMacro_«ID»"></span>{' '}
                                                <span className="bold">Calories</span>
                                            </span>
                                        </div>
                                        <div className="text-end">
                                            <span className=" text-primary">
                                                <span className="total_macros_1_percentage_«ID» totalsMacroPercentage_«ID»"></span> Daily 2000
                                                cal
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
                                    <button type="button" className="btn w-100 new_button_square_big bg-dark" onClick={() => setNutritionCalShow(true)}>
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
                                                                    <div className="text-center profileSelected" key={item}>
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
                                                    Don't forget to set your preferences so our system can automatically filter meals that you'd
                                                    want to eat!
                                                </h2>
                                            </div>
                                            <div className="big_image col-12">
                                                <img src={AlertBanner} alt="Don't forget to set your preferences" />
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
                                <Formik
                                    enableReinitialize
                                    initialValues={addresses.Shipping}
                                    validationSchema={Yup.object({
                                        street_address: Yup.string().required('Address is required!'),
                                        // city: Yup.string().required('City is required!'),
                                        // state: Yup.string().required('State is required!'),
                                        // zip: Yup.string().required('Zipcode is required!'),
                                        // phone: Yup.string().required('Phone is required!'),
                                    })}
                                    onSubmit={(values, { setSubmitting }) => {
                                        handleSubmitAddress(values);
                                        setSubmitting(false);
                                    }}
                                >
                                    {(runform) => (
                                        <form onSubmit={runform.handleSubmit}>
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
                                                            name="street_address"
                                                            {...formAttr(runform, 'street_address')}
                                                        />
                                                        {errorContainer(runform, 'street_address')}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label className="control-label">Street Address #2 (Unit, APT, Bldg, etc…)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Street Address #2 (Unit, APT, Bldg, etc…)"
                                                            className="form-control border-bottom-input"
                                                            name="street_address_2"
                                                            {...formAttr(runform, 'street_address_2')}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label className="control-label">City</label>
                                                        <input
                                                            type="text"
                                                            placeholder="City"
                                                            name="city"
                                                            {...formAttr(runform, 'city')}
                                                            className="form-control border-bottom-input"
                                                        />
                                                        {errorContainer(runform, 'city')}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label className="control-label">State</label>
                                                        <select
                                                            className="form-select border-bottom-input form-control"
                                                            {...formAttr(runform, 'state')}
                                                            name="state"
                                                        >
                                                            <option>--Select--</option>
                                                            {states?.map((state) => (
                                                                <option value={state.delivery_state_id} key={state.delivery_state_id}>
                                                                    {state.state_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errorContainer(runform, 'state')}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label className="control-label">Zip Code</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Zip Code"
                                                            name="zip"
                                                            {...formAttr(runform, 'zip')}
                                                            className="form-control border-bottom-input"
                                                        />
                                                        {errorContainer(runform, 'zip')}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group ">
                                                        <label className="control-label">Phone</label>
                                                        <input
                                                            type="text"
                                                            placeholder="(xxx)-xxx-xxxx"
                                                            name="phone"
                                                            {...formAttr(runform, 'phone')}
                                                            className="form-control border-bottom-input"
                                                        />
                                                        {errorContainer(runform, 'phone')}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label className="control-label">Gate Code</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Gate Code"
                                                            name="gate_code"
                                                            {...formAttr(runform, 'gate_code')}
                                                            className="form-control border-bottom-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label className="control-label">Delivery Note</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Delivery Note"
                                                            name="delivery_notes"
                                                            {...formAttr(runform, 'delivery_notes')}
                                                            className="form-control border-bottom-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4 text-end align-self-end">
                                                    <button type="submit" className="new_button_square_big btn primary-bg-cls">
                                                        {runform.isSubmitting ? <IconLoader /> : 'Save Shipping'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                    <div className="row address_wrapper spacer-top">
                        <div className="col-12">
                            <div className="card_table">
                                <Formik
                                    enableReinitialize
                                    initialValues={addresses.Billing}
                                    validationSchema={Yup.object({
                                        street_address: Yup.string().required('Address is required!'),
                                        city: Yup.string().required('City is required!'),
                                        state: Yup.string().required('State is required!'),
                                        zip: Yup.string().required('Zipcode is required!'),
                                    })}
                                    onSubmit={(values, { setSubmitting }) => {
                                        handleSubmitAddress(values);
                                        setSubmitting(false);
                                    }}
                                >
                                    {(runform) => (
                                        <form onSubmit={runform.handleSubmit}>
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
                                                            name="street_address"
                                                            {...formAttr(runform, 'street_address')}
                                                        />
                                                        {errorContainer(runform, 'street_address')}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label className="control-label">City</label>
                                                        <input
                                                            type="text"
                                                            placeholder="City"
                                                            name="city"
                                                            {...formAttr(runform, 'city')}
                                                            className="form-control border-bottom-input"
                                                        />
                                                        {errorContainer(runform, 'city')}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label className="control-label">State</label>
                                                        <select
                                                            className="form-select border-bottom-input form-control"
                                                            {...formAttr(runform, 'state')}
                                                            name="state"
                                                        >
                                                            <option>--Select--</option>
                                                            {states?.map((state) => (
                                                                <option value={state.delivery_state_id} key={state.delivery_state_id}>
                                                                    {state.state_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errorContainer(runform, 'state')}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label className="control-label">Zip Code</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Zip Code"
                                                            name="zip"
                                                            {...formAttr(runform, 'zip')}
                                                            className="form-control border-bottom-input"
                                                        />
                                                        {errorContainer(runform, 'zip')}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-8 text-end align-self-end">
                                                    <button type="submit" className="new_button_square_big btn primary-bg-cls">
                                                        {runform.isSubmitting ? <IconLoader /> : 'Save Billing'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                </Formik>
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
                                            <span className="clean-badge primary-bg-cls ms-2 font-size-11">{context?.selected_location?.kitchen_loc_name}</span>
                                        </h2>
                                    </div>
                                    <div className="col-md-6 col-12 text-end">
                                        <button className="btn bg-dark new_button_square_big" onClick={() => setAddCardModal(true)}>
                                            Add new Card
                                        </button>
                                    </div>
                                </div>
                                <div className="row justify-content-between">
                                    <div className="cart_new d-flex justify-content-center flex-wrap">
                                        {
                                            cards?.map((card) => {
                                                return (
                                                    <div className="credit_card" key={card.payment_card_id}>
                                                        <div className="del-card" type="button" onClick={() => handleDeleteCard(card.payment_card_id)}>
                                                            <i className="far fa-trash-alt"></i>
                                                        </div>
                                                        <div className="card__front card__part d-flex flex-wrap">
                                                            <div className="corner-ribbon top-left sticky blue shadow">Selected</div>
                                                            <img className="card__front-square card__square img-fluid" src={cheapImg} />
                                                            {/* <img className="card__front-logo card__logo" src="https://lifestylemeals.ttpfitness.com/assets/images/Visa.png" /> */}
                                                            <p className="col-12 card_numer">***********{card.card_number}</p>
                                                            <div className="col-8 text-start">
                                                                <span className="card__label">Card holder</span>
                                                                <p className="card__info"></p>
                                                            </div>
                                                            <div className="col-4 text-center">
                                                                <span className="card__label">Expires</span>
                                                                <p className="card__info">{card.card_expiry_date}</p>
                                                            </div>
                                                        </div>

                                                        <div className="card__back card__part">
                                                            <div className="corner-ribbon top-left sticky blue shadow">Selected</div>
                                                            <div className="card__black-line"></div>
                                                            <div className="card__back-content">
                                                                <div className="card__secret">
                                                                    <p className="card__secret--last">***</p>
                                                                </div>
                                                                <img className="card__back-square card__square" src={littleSquare} />
                                                                {/* <img className="card__back-logo card__logo" src="https://lifestylemeals.ttpfitness.com/assets/images/Visa.png" /> */}
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
            </UserMenu>

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
                        <Formik
                            enableReinitialize
                            initialValues={{
                                oldPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                            }}
                            validationSchema={Yup.object({
                                oldPassword: Yup.string()
                                    .required('Old password is required'),
                                newPassword: Yup.string()
                                    .min(8, 'Password must be at least 8 characters')
                                    .required('New password is required'),
                                confirmPassword: Yup.string()
                                    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
                                    .required('Confirming new password is required'),
                            })}
                            onSubmit={(values, { setSubmitting }) => {
                                handleChangePassword(values);
                                setSubmitting(false);
                            }}
                        >
                            {(runform) => (
                                <form onSubmit={runform.handleSubmit}>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="control-label">Old Password</label>
                                                <input type="password" name="oldPassword" {...formAttr(runform, 'oldPassword')} placeholder="Old Password" className="form-control border-bottom-input" />
                                                {errorContainer(runform, 'oldPassword')}
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="form-group">
                                                <label className="control-label">New Password</label>
                                                <input type="password" name="newPassword" {...formAttr(runform, 'newPassword')} placeholder="New Password" className="form-control border-bottom-input" />
                                                {errorContainer(runform, 'newPassword')}
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="form-group">
                                                <label className="control-label">Repeat new Password</label>
                                                <input type="password" name="confirmPassword" {...formAttr(runform, 'confirmPassword')} placeholder="Repeat new Password" className="form-control border-bottom-input" />
                                                {errorContainer(runform, 'confirmPassword')}
                                            </div>
                                        </div>
                                        <div className="col-12 text-end mt-3">
                                            <button className="primary-bg-cls btn" type='submit'>Save</button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </Formik>
                    </div>
                </ModalBody>
            </Modal>

            <Modal isOpen={addCardModal} centered className="modal modal-not-centered profile">
                <ModalHeader>
                    <div className="row">
                        <div className="col-12 modal_action_content text-center">
                            <h3 className="font-size-20">ADD NEW CARD</h3>
                        </div>
                    </div>
                </ModalHeader>
                <ModalBody className='p-0'>
                    <div className="">
                        <form onSubmit={handleSubmitCard}>
                            <div className='my-5 padding-xs-col'>
                                <CardElement />
                            </div>
                            <div className="upld-mls-btn border-top overflow-hidden">
                                <button className="col-6 border-end" type='button' onClick={() => setAddCardModal(false)}>
                                    Cancel
                                </button>
                                <button className="col-6" type="submit" disabled={!stripe}>
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </ModalBody>
            </Modal>

            <Modal isOpen={nutritionCalShow} centered className="modal modal-650 modal-not-centered profile">
                <ModalBody className='px-4'>
                    <div className="row mb-2">
                        <div className="col-md-12 modal_action_content">
                            <h3 className="font-size-20 my-2">Nutrition Calculator</h3>
                        </div>
                    </div>
                    <div className="px-3">
                        <div className="mb-3">
                            <div className="alert alert-info d-flex align-items-center justify-content-between">
                                <span>
                                    I am: <span className="general_info_gender">Female </span> //
                                    Age: <span className="general_info_age">20 </span> //
                                    Height:
                                    <span className="general_info_height">
                                        <span className="height_value">0 feet and 0 inches</span>
                                    </span>
                                </span>
                                <span className='cursor-pointer fw-bold'>Edit</span>
                            </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                            <div className="w-100 w-md-unset flex-basis-md-35">I want to</div>
                            <div className="w-100 w-md-unset flex-basis-md-65">
                                <div className="d-flex nutrition_calculator__btn-group">
                                    <button type="button" className="nutrition_calc_goal_0 nutrition_calculator__btn-item active">
                                        Lose Weight
                                    </button>
                                    <button type="button" className="nutrition_calc_goal_1 nutrition_calculator__btn-item ">
                                        Mantain
                                    </button>
                                    <button type="button" className="nutrition_calc_goal_2 nutrition_calculator__btn-item ">
                                        Build Muscle
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                            <div className="w-100 w-md-unset flex-basis-md-35">
                                <label for="nutrition_calc_weight_value" className="nutrition_calculator__labelFor">
                                    Weight
                                </label>
                            </div>
                            <div className="w-100 w-md-unset flex-basis-md-65 inline_input">
                                <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                    <input type="number" className="w-100" />
                                    <label className="nutrition_calculator__input-unit">lbs</label>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                            <div className="w-100 w-md-unset flex-basis-md-35">
                                <label for="nutrition_calc_weight_value" className="nutrition_calculator__labelFor">
                                    BodyFat
                                </label>
                            </div>
                            <div className="w-100 w-md-unset flex-basis-md-65 inline_input">
                                <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                    <input type="number" className="w-100" />
                                    <label className="nutrition_calculator__input-unit">%</label>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                            <div className="w-100 w-md-unset flex-basis-md-35">
                                <label for="cbActivityLevel" className="nutrition_calculator__labelFor">
                                    Activity level
                                </label>
                            </div>
                            <div className="w-100 w-md-unset flex-basis-md-65">
                                <div className="d-flex">
                                    <select name="cbActivityLevel" className="chosen-select form-select primary-border-cls">
                                        <option value="0">Sedentary</option>
                                        <option value="1">Lightly Active</option>
                                        <option value="2">Moderately Active</option>
                                        <option value="3">Very Active</option>
                                        <option value="4">Extremely Active</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                            <div className="w-100 w-md-unset flex-basis-md-35">Custom Macro Ratio?</div>
                            <div className="w-100 w-md-unset flex-basis-md-65">
                                <div className="d-flex nutrition_calculator__btn-group">
                                    <button
                                        type="button"
                                        className="nutrition_calc_haveCustomMacroRatio_0 nutrition_calculator__btn-item active"
                                    >
                                        No thanks
                                    </button>
                                    <button type="button" className="nutrition_calc_haveCustomMacroRatio_1 nutrition_calculator__btn-item ">
                                        Yeah let's do it!
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="d-flex flex-column flex-md-row align-items-center">
                                <div className="w-100 w-md-unset flex-basis-md-35">Macro Ratio</div>
                                <div className="w-100 w-md-unset flex-basis-md-65">
                                    <div className="d-flex nutrition_calculator__btn-group">
                                        <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                            <div className="metric w-100">
                                                <input type="number" className="w-100 nutrition_calculator_macroRatioCarbs" />
                                                <label className="nutrition_calculator__input-unit">%</label>
                                            </div>
                                        </div>
                                        <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                            <div className="metric w-100">
                                                <input type="number" className="w-100 nutrition_calculator_macroRatioProteins" />
                                                <label className="nutrition_calculator__input-unit">%</label>
                                            </div>
                                        </div>
                                        <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                            <div className="metric w-100">
                                                <input type="number" className="w-100 nutrition_calculator_macroRatioFats" />
                                                <label className="nutrition_calculator__input-unit">%</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                                <div className="w-100 w-md-unset flex-basis-md-35"></div>
                                <div className="w-100 w-md-unset flex-basis-md-65">
                                    <div className="d-flex nutrition_calculator__btn-under">
                                        <div className="nutrition_calculator__btn-under_label">
                                            Carbohydrates
                                        </div>
                                        <div className="nutrition_calculator__btn-under_label">
                                            Proteins
                                        </div>
                                        <div className="nutrition_calculator__btn-under_label">
                                            Fats
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                            <div className="w-100 w-md-unset flex-basis-md-35">Set a weight goal?</div>
                            <div className="w-100 w-md-unset flex-basis-md-65">
                                <div className="d-flex nutrition_calculator__btn-group">
                                    <button type="button" className="nutrition_calc_setWeightGoal_0 nutrition_calculator__btn-item active">
                                        No thanks
                                    </button>
                                    <button type="button" className="nutrition_calc_setWeightGoal_1 nutrition_calculator__btn-item ">
                                        Yeah let's do it!
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                                <div className="w-100 w-md-unset flex-basis-md-35">
                                    <label for="nutrition_calc_goal_weight" className="nutrition_calculator__labelFor">
                                        Enter goal weight:
                                    </label>
                                </div>
                                <div className="w-100 w-md-unset flex-basis-md-65">
                                    <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                        <div className="metric w-100">
                                            <input type="number" className="w-100" />
                                            <label className="nutrition_calculator__input-unit">lbs</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                                <div className="w-100 w-md-unset flex-basis-md-35">
                                    <label for="nutrition_calc_goal_weight_rate" className="nutrition_calculator__labelFor">
                                        Days to achive your weight goal:
                                    </label>
                                </div>
                                <div className="w-100 w-md-unset flex-basis-md-65">
                                    <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                        <div className="metric w-100">
                                            <input type="number" className="w-100" />
                                            <label className="nutrition_calculator__input-unit">days</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center mb-3">
                                <div className="w-100 text-warning"></div>
                            </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-center mt-2">
                            <button type="button" className="nutrition_calculator__btn-calculate" onclick="calculateMacros()">
                                Calculate
                            </button>
                        </div>
                        <div className="d-flex align-items-center">
                            <div className="w-100 text-warning"></div>
                        </div>

                        <div className="macro_recommendation d-block mt-2">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>
                                            <strong>Calories</strong>
                                        </th>
                                        <th>
                                            <strong>Proteins</strong>
                                        </th>
                                        <th>
                                            <strong>Carbohydrates</strong>
                                        </th>
                                        <th>
                                            <strong>Fats</strong>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="4" className='text-center'>Please answer all questions</td>
                                        <td colspan="4" className="warningCaloriesContainer d-none">
                                            <div className="alert alert-warning warningCaloriesText" role="alert"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="suggested_calories">
                                            <span>x</span> kcal
                                        </td>
                                        <td className="suggested_proteins">
                                            <span>x</span> g
                                        </td>
                                        <td className="suggested_carbohydrates">
                                            <span>x</span> g
                                        </td>
                                        <td className="suggested_fats">
                                            <span>x</span> g
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="text-center">
                                <button type="button" className="primary-bg-cls btn-save" onClick={() => setMacroCalShow(true)}>
                                    Apply these settings
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button className="col-12" onClick={() => setNutritionCalShow(false)}>
                        Close
                    </button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={macroCalShow} centered className="small_modal_action_content modal modal-650 modal-not-centered profile">
                <ModalBody className='px-5'>
                    <div className="row mb-2">
                        <div className="col-md-12 modal_action_content text-center">
                            <h3 className="font-size-20 my-2">Nutrition Calculator</h3>
                        </div>
                    </div>
                    <div className="px-2">
                        <p>The recommended values that will be stored are:</p>
                        <div className="">
                            <div className="confirm_nutrition_calculator__input mb-2">
                                <label for="confirm_suggested_calories">Calories: </label>
                                <input type="number" />
                                <span className="confirm_nutrition_calculator__input-unit">g</span>
                            </div>
                            <div className="confirm_nutrition_calculator__input mb-2">
                                <label for="confirm_suggested_proteins">Proteins: </label>
                                <input type="number" />
                                <span className="confirm_nutrition_calculator__input-unit">g</span>
                            </div>
                            <div className="confirm_nutrition_calculator__input mb-2">
                                <label for="confirm_suggested_carbohydrates">Carbohydrates: </label>
                                <input type="number" />
                                <span className="confirm_nutrition_calculator__input-unit">g</span>
                            </div>
                            <div className="confirm_nutrition_calculator__input mb-2">
                                <label for="confirm_suggested_fats">Fats: </label>
                                <input type="number" />
                                <span className="confirm_nutrition_calculator__input-unit">g</span>
                            </div>
                        </div>
                        <div className="text-center max-width-300 px-2">
                            <div className="togglebutton">
                                <label>Use Custom Values?
                                    <input type="checkbox" id="custom_suggested_values" />
                                    <span className="toggle ms-2"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button className="col-6 border-end" onClick={() => setMacroCalShow(false)}>
                        Cancel
                    </button>
                    <button className="col-6">Save</button>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    );
}
