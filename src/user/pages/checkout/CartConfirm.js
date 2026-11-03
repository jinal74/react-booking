import React, { useContext, useEffect, useState } from 'react';
import Topbar from '../../../pages/common/Topbar';
import Header from '../../../pages/common/Header';
import { Link, useNavigate } from 'react-router-dom';
import padLock from '../../../assets/images/padlock.svg';
import VisaBlk from '../../../assets/images/visa-blk.png';
import MasterBlk from '../../../assets/images/master-blk.png';
import AmexBlk from '../../../assets/images/amex-blk.png';
import JCBBlk from '../../../assets/images/jcb-blk.png';
import DiscoverBlk from '../../../assets/images/discover-blk.png';
import UnionpayBlk from '../../../assets/images/unionpay-blk.png';
import DinersBlk from '../../../assets/images/diner-blk.png';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Context } from '../../../context/GeneralContext';
import { API_PATH } from '../../../admin/constants/const';
import { PostApi } from '../../../services/ApiService';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FixedDecimal, errorContainer, formAttr } from '../../../helpers/func_helper';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { IconLoader } from '../../../admin/Loader/IconLoader';
import { useAuth } from '../../../admin/hooks/useAuth';
import { API_PATH_USER } from '../../../const';
import { toast } from 'react-toastify';
import moment from 'moment/moment';

export default function CartConfirm() {
    const context = useContext(Context);
    const navigate = useNavigate();
    const token = localStorage.getItem('token_auth');

    const [isLoading, set_isLoading] = useState(false);
    const [isOther, setIsOther] = useState({ show: false, value: '' });
    const [cards, setCards] = useState([]);
    const [zipcodes, setZipcodes] = useState([]);
    const [states, setStates] = useState([]);
    const [pickupLocations, setPickupLocations] = useState([]);
    const [allCardPopup, setAllCardPopup] = useState(false);
    const [addCardPopup, setAddCardPopup] = useState(false);
    const [openDeliveryPopup, setOpenDeliveryPopup] = useState(false);
    const [openPickupPopup, setOpenPickupPopup] = useState(false);
    const [addresses, setAddresses] = useState(null);
    const [pickupAddress, setPickupAddress] = useState('');
    const [recieveOrderData, setRecieveOrderData] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [totals, setTotals] = useState({
        giftcards: 0,
        packs: 0,
        meals: 0,
        subscriptionMeals: 0,
        subscription: 0,
        subTotal: 0,
        tip: 0,
        tipType: "",
        serviceFee: 0,
        total: 0,
    });
    const [initialValues, setInitialValues] = useState({
        street_address: '',
        street_address_2: '',
        city: '',
        state: '',
        state_name: '',
        zip: '',
        phone: '',
        gate_code: '',
        delivery_notes: '',
        is_save: "false",
        address_type: 'Shipping'
    });
    const [initialLoginValues, setInitialLoginValues] = useState({
        email: '',
        password: '',
    });

    useEffect(() => {
        GetAllStates();
        GetAddresses();
        GetCards();
    }, []);

    useEffect(() => {
        let cartData = context.cartData;
        if (cartData.data && Object.keys(cartData.data)?.length > 0) {
            let data = JSON.parse(JSON.stringify(cartData.data));

            let pricesObj = { ...totals };
            Object.keys(data)?.forEach((date) => {
                let item = data[date];
                pricesObj.packs += item.packs
                    ? item.packs?.reduce((acc, pack) => {
                        return acc + Number(pack.totalPrice) * Number(pack.quantity);
                    }, 0)
                    : 0;

                pricesObj.meals += item?.meals
                    ? item?.meals?.reduce((acc, meal) => {
                        return acc + Number(meal.quantity) * Number(meal.price);
                    }, 0)
                    : 0;

                pricesObj.subscriptionMeals += item?.subscriptionMeals
                    ? Object.values(item?.subscriptionMeals)
                        ?.flat()
                        ?.reduce((acc, meal) => {
                            return acc + Number(meal.price);
                        }, 0)
                    : 0;

                pricesObj.subscription += Number(item?.subscription?.price) || 0;
            });
            pricesObj.giftcards = Number(cartData?.giftcards?.value) || 0;
            pricesObj.subTotal =
                pricesObj.packs + pricesObj.meals + pricesObj.subscriptionMeals + pricesObj.subscription + pricesObj.giftcards;
            pricesObj.total = pricesObj.subTotal;
            setTotals(pricesObj);

            setRecieveOrderData(transformData(cartData), addresses, pickupAddress);
        } else {
            navigate('/cart');
        }
    }, [context.cartData.data, addresses, pickupAddress]);

    function transformData(originalData, addresses, pickupAddress) {
        console.log(addresses, pickupAddress)
        const newData = [];
        let storedData = localStorage.getItem('')

        for (const [key, value] of Object.entries(originalData.data)) {
            // const mealsList = [];

            // // Adding À la Carte meals
            // value.meals?.forEach(meal => {
            //     mealsList.push({
            //         type: "À la Carte",
            //         order_quantity: "1",
            //         product: [{
            //             quantity: meal.quantity,
            //             product_id: meal.ingredient_id,
            //             portion_size_id: meal.is_default == 1 ? null : meal.portion_size_id,
            //             extra: "0"
            //         }]
            //     });
            // });

            // // Adding Meal Packs
            // value.packs?.forEach(pack => {
            //     const products = [];
            //     Object.entries(pack.meals)?.forEach(([mealId, mealDetails]) => {
            //         mealDetails?.forEach(detail => {
            //             products.push({
            //                 quantity: "1",
            //                 product_id: detail.ingredient_id,
            //                 portion_size_id: detail.is_default == 1 ? null : detail.portion_size_id,
            //                 extra: "0"
            //             });
            //         });
            //     });

            //     mealsList.push({
            //         type: "Meal Packs",
            //         order_quantity: pack.quantity,
            //         meal_pack_id: pack.meal_pack_id,
            //         product: products
            //     });
            // });


            newData.push({
                receive_date: key,
                receive_type: "Delivery",
                pickup_address: "14199 SW Millikan Way, 97005 Beaverton",
                billing_address: "14199 SW Millikan Way, 97005 Beaverton",
                shipping_address: {
                    street_address: "xyz ddssdd",
                    street_address_2: "",
                    country: "",
                    city: "surat",
                    state: "0DEFBFBD7E3DEFBFBDEFBFBD45EFBFBD",
                    zip: "231212",
                    gate_code: "",
                    delivery_notes: "",
                    phone: ""
                },
                // meals: mealsList
            });
        }

        return newData;
    }

    // useEffect(() => {
    // if (addresses) setInitialValues(addresses);
    // if (addresses?.state && context?.selected_location) {
    //     GetAllZipCodes();
    // }
    // }, [addresses, context?.selected_location]);

    useEffect(() => {
        if (context?.selected_location) {
            GetAllPickupPoints();
        }
    }, [context?.selected_location]);

    const GetAllStates = async () => {
        const response = await PostApi(API_PATH.getallDeliveryStates, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            setStates(response.data.data_result ?? []);
        }
    };

    const GetAddresses = async () => {
        const response = await PostApi(API_PATH_USER.GetAddresses);
        if (response?.statusCode === 200) {
            let data = response.data;
            let Shipping = null;
            let Billing = null;

            if (data) {
                Shipping = data.find((f) => f.address_type === 'Shipping');
                if (Shipping) {
                    Shipping.state_name = states?.find((state) => Shipping.state === state.delivery_state_id)?.state_name ?? '';
                    Shipping.is_save = "false";
                }
                Billing = data.find((f) => f.address_type === 'Billing');
                if (Billing) Billing.state_name = states?.find((state) => Billing.state === state.delivery_state_id)?.state_name ?? '';
            }

            if (!Shipping) setOpenDeliveryPopup(true);
            setAddresses({ Shipping, Billing });
        }
    };

    const GetCards = async () => {
        const response = await PostApi(API_PATH_USER.GetCards);
        if (response?.statusCode === 200) {
            let data = response.data;
            data = data?.map((f) => ({ ...f, url: getCardType(f.card_type) }));
            setCards(data);
            setSelectedCard(data[0]);
        }
    };

    const GetAllPickupPoints = async () => {
        const response = await PostApi(API_PATH.getAllPickupLocation, {
            kitchen_location_id: context?.selected_location?.kitchen_location_id,
            type: "all",
        });
        if (response.statusCode === 200) {
            setPickupLocations(response.data.data_result ?? []);
            setPickupAddress(response.data.data_result?.[0]?.pickup_loc_name);
        } else {
            setPickupLocations([])
        }
    };

    // const GetAllZipCodes = async () => {
    //     const response = await PostApi(API_PATH.getallDeliveryZipcode, {
    //         delivery_state_id: addresses?.state,
    //         type: 'all',
    //         kitchen_location_id: context?.selected_location?.kitchen_location_id,
    //     });
    //     if (response.statusCode === 200) {
    //         setZipcodes(response.data.data_result?.map((f) => f.zip_code) ?? []);
    //     }
    // };

    const handleDeleteCart = () => {
        let cart = { ...context.cartData };
        cart.data = {};
        context.setCartData({
            ...cart,
            totalItems: 0,
            subTotal: 0,
        });
    };

    const handleDeleteCard = async (e, id) => {
        e.stopPropagation();
        const response = await PostApi(API_PATH_USER.DeleteCards, { payment_card_id: id });
        if (response.statusCode === 200) {
            toast.success('Card deleted successfully');
            GetCards();
        }
    }

    const handleChangeType = (e, date) => {
        let data = [...recieveOrderData];
        // let obj = { ...data[date] };
        // obj.type = e.target.value;
        // data[date] = obj;
        // setRecieveOrderData(data);
        console.log(data)
        if (e.target.value == 'Delivery') {
            setOpenDeliveryPopup(true);
        }
    };

    const handleSubmitAddress = async (values) => {
        if (values.is_save) {
            let tempObj = JSON.parse(JSON.stringify(values));
            tempObj.type = tempObj.address_type;
            delete tempObj.address_type;
            delete tempObj.state_name;
            delete tempObj.is_save;

            const response = await PostApi(API_PATH_USER.UpdateAdresses, tempObj);
            if (response.statusCode === 200) {
                toast.success(`Shipping address updated successfully`);
            }
            values.state_name = states?.find((state) => values.state === state.delivery_state_id)?.state_name;
            setAddresses({ ...addresses, Shipping: values });
        }

        setOpenDeliveryPopup(false);
    };

    const AnyOneItemsHaveIngredientId = (meals) => {
        if (meals) {
            for (const [key, value] of Object.entries(meals)) {
                const anyOneHaveIngredientId = value.some((item) => item.ingredient_id !== '');
                if (anyOneHaveIngredientId) {
                    return true;
                }
            }
            return false;
        }
    };

    const handleChangeTip = (value, type) => {
        setTotals((prevState) => ({
            ...prevState,
            total: ((totals.total + (type === '%' ? ((totals.subTotal * value) / 100) : value)) - (totals.tipType === '%' ? ((totals.subTotal * totals.tip) / 100) : totals.tip)),
            tip: value,
            tipType: type
        }));
        setIsOther({ show: false, value: '' });
    }

    const stripe = useStripe();
    const elements = useElements();

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
                setAddCardPopup(false);
            }
        }
    };

    const { login } = useAuth();

    const handleLogin = async (values, action) => {
        await login({ ...values, set_isLoading, page: 'cart-confirm' }, action);
    };

    function getCardType(type) {
        var patterns = {
            mastercard: MasterBlk,
            amex: AmexBlk,
            unionpay: UnionpayBlk,
            jcb: JCBBlk,
            diners: DinersBlk,
            discover: DiscoverBlk,
            visa: VisaBlk,
        }
        for (var key in patterns) {
            if (key === type) {
                return patterns[key]
            }
        }
    }

    return (
        <React.Fragment>
            <Topbar />
            <Header />
            <div className="checkout">
                <div className="row w-100 d-flex top_holder">
                    <div className="d-flex align-items-center col-sm-6 col-md-6">
                        <span className="me-auto">
                            <Link to="/cart" className="forgot-pass">
                                <i className="fas fa-long-arrow-alt-left me-1"></i>
                                Back to Review
                            </Link>
                        </span>
                    </div>
                    <div className="d-flex align-items-center col-sm-6 col-md-6 mt-4">
                        <div className="ms-auto d-flex secure_wrapper">
                            <div className="img me-3">
                                <img className="" src={padLock} alt="" />
                            </div>
                            <div className="safe-text">
                                <p className="bold mb-0">SAFE AND SECURE CHECKOUT</p>
                                <p>Stripe AES-256 encryption</p>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    token ?
                        <div className="d-flex half flex-sm-column">
                            <div className="row d-flex align-items-top justify-content-center">
                                <div className="col-sm-8 px-5">
                                    <div className="fullfilment_wrapper mb-3">
                                        <h3 className="m-0">
                                            <span className="cart-step">1. </span>
                                            <strong>How would you like to receive your order?</strong>
                                        </h3>
                                        <div className="">
                                            {recieveOrderData && recieveOrderData?.map((item) => {
                                                return (
                                                    <div className="" key={item.receive_date}>
                                                        <div className="selection_holder align-items-center">
                                                            <div className="date_holder">
                                                                <b>
                                                                    <i className="far fa-clock me-3"></i>{moment(item.receive_date).format('dddd, MMM DD, yyyy')}
                                                                    <i className="fas fa-long-arrow-alt-right"></i>
                                                                </b>
                                                            </div>
                                                            <div className="option_holder" onChange={(e) => handleChangeType(e, item.receive_date)}>
                                                                <div className="cursor-pointer">
                                                                    <label>
                                                                        <input type="radio" defaultChecked={item.receive_type == 'Delivery'} name={'type-' + item.receive_date} value={'Pickup'} />
                                                                        <span>Delivery</span>
                                                                    </label>
                                                                </div>

                                                                <div className="cursor-pointer">
                                                                    <label>
                                                                        <input type="radio" defaultChecked={item.receive_type == 'Pickup'} name={'type-' + item.receive_date} value={'Pickup'} />
                                                                        <span>Pickup</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {item.receive_type == 'Delivery' ? (
                                                            item.shipping_address && zipcodes?.includes(item.shipping_address?.zip) ? (
                                                                <div className="deliveryWrapper">
                                                                    <div>
                                                                        <span className="__notes">
                                                                            <i className="fas fa-map-marker-alt me-3"></i> {item.shipping_address?.street_address},{' '}
                                                                            {item.shipping_address?.street_address_2}, {item.shipping_address?.city}, {item.shipping_address?.state_name} - {item.shipping_address?.zip}{' '}
                                                                            <span onClick={() => setOpenDeliveryPopup(true)}>
                                                                                <a className="ms-3">Edit</a>
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        {item.shipping_address?.phone !== '' && <><i className="fas fa-phone-alt me-3"></i> {item.shipping_address?.phone}</>}
                                                                        <br />
                                                                        {item.shipping_address?.gate_code !== '' && <><i className="fas fa-shield-alt me-3"></i> {item.shipping_address?.gate_code}</>}
                                                                    </div>

                                                                    <span className="__notes">
                                                                        {item.shipping_address?.delivery_notes !== '' && <><i className="far fa-sticky-note me-3"></i> {item.shipping_address?.delivery_notes}</>}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="alert alert-danger-login small">
                                                                    <h3>An error occurred!</h3>
                                                                    <p className="m-0">
                                                                        {item.shipping_address?.state === ""
                                                                            ? `${item.shipping_address?.state_name}: Sorry, but we do not currently deliver to ${item.shipping_address?.zip}`
                                                                            : 'Please select a valid State to continue checkout process'}
                                                                    </p>
                                                                    <span onClick={() => setOpenDeliveryPopup(true)}>
                                                                        <a className="font-size-12">Edit</a>
                                                                    </span>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div className="pickupWrapper">
                                                                <div>
                                                                    <i className="fas fa-map-marker-alt me-3"></i> {pickupAddress} - {item.pickup_address}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="payment_wrapper mb-3 mt-3">
                                        <h3 className="mt-0">
                                            <span className="cart-step">2. </span>
                                            <strong>Payment Method</strong>
                                        </h3>
                                        <div className="payments d-flex">
                                            <div className="cursor-pointer">
                                                <label className="btnPayment btnPayment-stripe active">
                                                    <input type="radio" defaultChecked name="paymentMethod" />
                                                    <span className="text-top">Credit Card </span>
                                                </label>
                                            </div>
                                        </div>
                                        <p className="ms-0 text-muted">
                                            Safe money transfer using your bank account. Visa, Maestro, Discover, American Express. Payments made
                                            through our website are securely processed via Stripe.
                                        </p>
                                        <a className="btn-ck back_system" onClick={() => setAddCardPopup(true)}>
                                            <i className="fas fa-plus me-2"></i>Add new Card
                                        </a>

                                        <div className="mt-4">
                                            <div className="cardv2 credit_card btnStripeCard active">
                                                <span>
                                                    <p className="card_numer">
                                                        {selectedCard?.url && <img className="card__front-logo card__logo me-3" src={selectedCard?.url} />}
                                                        ***********{selectedCard?.card_number}
                                                        <a className="cursor ms-3" onClick={() => setAllCardPopup(true)}>Edit</a>
                                                    </p>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="promo_wrapper mt-0">
                                        <h3 className="m-0">
                                            <span className="cart-step">3. </span>
                                            <strong>Add Promo or Giftcard Code</strong>
                                        </h3>
                                        <div>
                                            <div className=" checkoutGiftCard">
                                                <div className="d-flex align-items-center">
                                                    <div className="col-6 form-group me-4 is-empty">
                                                        <label className="control-label"></label>
                                                        <input type="text" placeholder="Add promo code" className="form-control border-bottom-input" />
                                                    </div>
                                                    <div className="col-6">
                                                        <button className="btn small" type="button">
                                                            Apply Code<div className="ripple-container"></div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 px-5">
                                    <div className="summary_wrapper">
                                        <div id="border-totals" className="lateral_base_cart">
                                            <div className="d-flex align-items-center my-4">
                                                <div className="title">
                                                    <h3 className="m-0">
                                                        <strong>Shopping Cart</strong>
                                                    </h3>
                                                </div>

                                                <div className="delete--cart d-flex ms-auto">
                                                    <button type="button" className="btn-link" onClick={handleDeleteCart}>
                                                        <span className="portion_tag_v2 summary_delete">
                                                            <i className="far fa-trash-alt me-2"></i> Delete Cart
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="products_review">
                                                {context.cartData?.giftcards && (
                                                    <div className="mb-3">
                                                        <div className="bottom_line d-flex justify-content-between">
                                                            <div className="d-flex me-auto">
                                                                <span className="cursor-pointer trash_confirm_i me-3">
                                                                    <i className="far fa-times-circle"></i>
                                                                </span>
                                                                <span className="bold strike_del">Gift Card</span>
                                                            </div>
                                                            <div className="d-flex ms-auto mb-3 pe-0">
                                                                ${context.cartData?.giftcards?.value?.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {recieveOrderData && recieveOrderData?.map((item) => {
                                                    return (
                                                        <React.Fragment key={item.receive_date}>
                                                            <div className="mb-4 mt-3 mobile_hide">
                                                                <div className="date_holder">
                                                                    <b>
                                                                        <i className="fas fa-store me-2"></i> {item.receive_type == 'Delivery' ? 'DELIVERY' : 'PICKUP'}
                                                                    </b>
                                                                    <span
                                                                        onClick={() =>
                                                                            item.receive_type == 'Delievry' ? setOpenDeliveryPopup(true) : setOpenPickupPopup(true)
                                                                        }
                                                                    >
                                                                        <a className="ms-3">Edit</a>
                                                                    </span>
                                                                </div>
                                                                {(item.shipping_address || item.pickup_address) && (
                                                                    <div className="date_holder">
                                                                        <b>
                                                                            <i className="fas fa-map-marker-alt me-3"></i>
                                                                            {item.receive_type == 'Delievry'
                                                                                ? `${item.shipping_address?.street_address} ${item.shipping_address?.street_address_2} ${item.shipping_address?.city} ${item.shipping_address?.zip}, ${item.shipping_address?.state_name}`
                                                                                : `${pickupAddress} - ${item.pickup_address}`}
                                                                        </b>
                                                                    </div>
                                                                )}
                                                                <div className="date_holder">
                                                                    <b>
                                                                        <i className="far fa-clock me-2"></i> {moment(item.receive_date).format('dddd, MMM DD, yyyy')}
                                                                    </b>
                                                                </div>
                                                                <div className="bottom_line mt-4"></div>
                                                            </div>
                                                            {context.cartData?.data?.[item.receive_date]?.packs?.length > 0 &&
                                                                context.cartData?.data?.[item.receive_date]?.packs?.map((pack, index) => (
                                                                    <div className="mb-3" key={index}>
                                                                        <div className="bottom_line d-flex justify-content-between">
                                                                            <div className="d-flex me-auto">
                                                                                <span className="cursor-pointer trash_confirm_i me-3">
                                                                                    <i className="far fa-times-circle"></i>
                                                                                </span>
                                                                                <span className="bold strike_del">
                                                                                    Meal Packs - {pack.quantity} packs of {pack.number_of_meals} meals
                                                                                </span>
                                                                            </div>
                                                                            <div className="d-flex ms-auto mb-3 pe-0">${pack.totalPrice}</div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            {context.cartData?.data?.[item.receive_date]?.meals?.length > 0 && (
                                                                <div className="mb-3">
                                                                    <div className="bottom_line d-flex justify-content-between">
                                                                        <div className="d-flex me-auto">
                                                                            <span className="cursor-pointer trash_confirm_i me-3">
                                                                                <i className="far fa-times-circle"></i>
                                                                            </span>
                                                                            <span className="bold strike_del">À la Carte</span>
                                                                        </div>
                                                                        <div className="d-flex ms-auto mb-3 pe-0">
                                                                            $
                                                                            {context.cartData?.data?.[item.receive_date]?.meals
                                                                                ?.reduce((acc, meal) => {
                                                                                    return acc + meal.quantity * meal.price;
                                                                                }, 0)
                                                                                ?.toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {context.cartData?.data?.[item.receive_date]?.subscriptionMeals &&
                                                                AnyOneItemsHaveIngredientId(context.cartData?.data?.[item.receive_date]?.subscriptionMeals) && (
                                                                    <div className="mb-3">
                                                                        <div className="bottom_line">
                                                                            <div className="d-flex justify-content-between">
                                                                                <div className="d-flex me-auto">
                                                                                    <span className="cursor-pointer trash_confirm_i me-3">
                                                                                        <i className="far fa-times-circle"></i>
                                                                                    </span>
                                                                                    <span className="bold strike_del">Weekly Subscription</span>
                                                                                </div>
                                                                                <div className="d-flex ms-auto pe-0">
                                                                                    $
                                                                                    {(context.cartData?.data?.[item.receive_date]?.subscriptionMeals
                                                                                        ? Object.values(context.cartData?.data?.[item.receive_date]?.subscriptionMeals)
                                                                                            ?.flat()
                                                                                            ?.reduce((acc, meal) => {
                                                                                                return acc + Number(meal.price);
                                                                                            }, 0)
                                                                                        : 0
                                                                                    )?.toFixed(2)}
                                                                                </div>
                                                                            </div>
                                                                            <div className="ms-4 ps-1 mb-3">
                                                                                <span>
                                                                                    <small className="strike_del">(Your Selected meals)</small>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            {context.cartData?.data?.[item.receive_date]?.subscription && (
                                                                <div className="mb-3">
                                                                    <div className="bottom_line d-flex justify-content-between">
                                                                        <div className="d-flex me-auto">
                                                                            <span className="cursor-pointer trash_confirm_i me-3">
                                                                                <i className="far fa-times-circle"></i>
                                                                            </span>
                                                                            <span className="bold strike_del">Subscription Creation</span>
                                                                        </div>
                                                                        <div className="d-flex ms-auto mb-3 pe-0">
                                                                            ${context.cartData?.data?.[item.receive_date]?.subscription?.price}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>

                                            <div className="tips_wrapper">
                                                <div className="marginBottom marginTop choose_giftcard">
                                                    <div className="mb-3">
                                                        <span>
                                                            <b>Tip Amount</b>
                                                        </span>
                                                        <span className={`tip-badge none btnTip ${totals.tip === 0 ? 'active' : ''}`} onClick={() => handleChangeTip(0, '')}>No Tip</span>
                                                    </div>

                                                    <div className="tips_options_wrapper">
                                                        <div
                                                            className={`tip-badge btnTip ${(totals.tipType === '%' && totals.tip === 5) ? 'active' : ''}`}
                                                            onClick={() => handleChangeTip(5, '%')}
                                                        >
                                                            <p className="bold">5%</p>
                                                            <small className="smallprice">${FixedDecimal((totals.subTotal * 5) / 100)}</small>
                                                        </div>
                                                        <div
                                                            className={`tip-badge btnTip ${(totals.tipType === '%' && totals.tip === 10) ? 'active' : ''}`}
                                                            onClick={() => handleChangeTip(10, '%')}
                                                        >
                                                            <p className="bold">10%</p>
                                                            <small className="smallprice">${FixedDecimal((totals.subTotal * 10) / 100)}</small>
                                                        </div>
                                                        <div
                                                            className={`tip-badge btnTip ${(totals.tipType === '%' && totals.tip === 15) ? 'active' : ''}`}
                                                            onClick={() => handleChangeTip(15, '%')}
                                                        >
                                                            <p className="bold">15%</p>
                                                            <small className="smallprice">${FixedDecimal((totals.subTotal * 15) / 100)}</small>
                                                        </div>
                                                        <div
                                                            className={`tip-badge btnTip ${(totals.tipType === '%' && totals.tip === 20) ? 'active' : ''}`}
                                                            onClick={() => handleChangeTip(20, '%')}
                                                        >
                                                            <p className="bold">20%</p>
                                                            <small className="smallprice">${FixedDecimal((totals.subTotal * 20) / 100)}</small>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`mt-3 mb-2 tip-badge btnTip tip_other ${totals.tipType === '$' ? 'active' : ''}`}
                                                        onClick={() => { setTotals((prevState) => ({ ...prevState, tipType: '$' })); setIsOther({ show: true, value: totals.tipType === '%' ? (totals.subTotal * 20) / 100 : totals.tip }); }}
                                                    >
                                                        <p className="bold">Other</p>
                                                        {totals.tipType === '$' && <small className="smallprice">{totals.tip}</small>}
                                                    </div>
                                                    {isOther.show && (
                                                        <div className="form-group first last btnCustomTip">
                                                            <label className="control-label">Please enter the amount you would like to tip below.</label>
                                                            <input
                                                                type="number"
                                                                placeholder="Ex: 20"
                                                                value={isOther.value}
                                                                className="form-control border-bottom-input"
                                                                onChange={(e) => setIsOther((prevState) => ({ ...prevState, value: e.target.value }))}
                                                            />
                                                            <button type="button" className="btn small mt-2" onClick={() => handleChangeTip(Number(isOther.value), '$')}>
                                                                Apply
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="subtotals_wrapper" id="checkoutDetails">
                                                <div className="subtotal_wrapper bottom_line mt-3">
                                                    <div className="checkoutSubTotal">
                                                        <p className="bold">Sub Total:</p>
                                                    </div>
                                                    <div className="ms-auto checkoutSubTotal" id="checkoutSubTotal">
                                                        <p>${totals.subTotal}</p>
                                                    </div>
                                                </div>

                                                <div className="subtotal_wrapper bottom_line mt-3">
                                                    <div className="checkoutServiceFeeTotal">
                                                        <p className="bold">Service Fee:</p>
                                                    </div>
                                                    <div className="ms-auto checkoutServiceFeeTotal" id="checkoutServiceFeeTotal">
                                                        <p>${totals.serviceFee}</p>
                                                    </div>
                                                </div>

                                                <div className="subtotal_wrapper bottom_line mt-3">
                                                    <div className="checkoutServiceFeeTotal">
                                                        <p className="bold">Tip:</p>
                                                    </div>
                                                    <div className="ms-auto checkoutServiceFeeTotal" id="checkoutServiceFeeTotal">
                                                        <p>${totals.tipType === '%' ? (totals.subTotal * totals.tip) / 100 : totals.tip}</p>
                                                    </div>
                                                </div>

                                                <div className="subtotal_wrapper bottom_line mt-3">
                                                    <div className=" checkoutDeliveryTotal">
                                                        <p className="bold">Delivery (1):</p>
                                                    </div>
                                                    <div className="ms-auto checkoutDeliveryTotal" id="checkoutDeliveryTotal">
                                                        <p>Free</p>
                                                    </div>
                                                    <div className="mb-3"></div>
                                                </div>

                                                <div className="subtotal_wrapper mt-3"></div>

                                                <div className="subtotal_wrapper">
                                                    <div className="paddingControl text-start checkoutTotal">
                                                        <p className="bold">Total:</p>
                                                    </div>
                                                    <div className="ms-auto paddingControl checkoutTotal bold" id="checkoutTotal">
                                                        <b>${totals.total}</b>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="alert alert-danger-login small cart_globalError mt-4 mb-0">
                                        <h3>Error</h3>
                                        <p id="cardError" className="cart_globalErrorText"></p>
                                    </div>

                                    <div className="button_go_wrapper mt-4">
                                        <a className="btn w-100 h-100">Checkout</a>
                                    </div>

                                    <label className="mt-3 mb-5 justify-content-center">
                                        <p>
                                            <b className="font-size-13">
                                                By clicking checkout you agree to our
                                                <a id="termsModalcart" href="" className="primary-color-cls">
                                                    &nbsp;Terms &amp; Conditions
                                                </a>
                                            </b>
                                        </p>
                                    </label>
                                </div>
                            </div>
                        </div> :
                        <div className=''>
                            <div className='container-user w-50'>
                                <div className='row d-flex align-items-center justify-content-center'>
                                    <div className='col-sm-7'>
                                        <div className='mb-4'>
                                            <h3 className='my-3'><strong>Login to TTP Fitness</strong></h3>
                                            <p className='grey-txt-cls'>To access your account please login with your email address and password.</p>
                                        </div>
                                        <div>
                                            <Formik
                                                enableReinitialize
                                                initialValues={initialLoginValues}
                                                validationSchema={Yup.object({
                                                    email: Yup.string()
                                                        .email('Please Enter Valid Email')
                                                        .required('Please Enter Your Email'),
                                                    password: Yup.string().required('Please Enter Your Password'),
                                                })}
                                                onSubmit={(values, action) => {
                                                    handleLogin(values, action);
                                                }}
                                            >
                                                {(runform) => (
                                                    <form onSubmit={runform.handleSubmit} className="form-horizontal">
                                                        <div className="mb-2">
                                                            <label className="form-label">Email</label>
                                                            <input
                                                                name="email"
                                                                className="form-control"
                                                                placeholder="Your registered email"
                                                                type="text"
                                                                {...formAttr(runform, 'email')}
                                                            />
                                                            {errorContainer(runform, 'email')}
                                                        </div>
                                                        <div className="mb-4">
                                                            <label className="form-label">Password</label>
                                                            <input
                                                                name="password"
                                                                type="password"
                                                                className="form-control"
                                                                placeholder="Enter Password"
                                                                {...formAttr(runform, 'password')}
                                                            />
                                                            {errorContainer(runform, 'password')}
                                                        </div>

                                                        <div className="d-flex mb-5 align-items-center">
                                                            <span>
                                                                <Link className="caption" to="/register"> Dont have an account? </Link>
                                                            </span>
                                                            {/* <span id="recover_trigger" className="ms-auto"><a className="forgot-pass" to="#recovery">Forgot password?</a></span> */}
                                                        </div>

                                                        <div className="d-grid">
                                                            <button className="btn primary-bg-cls btn-block" type="submit">
                                                                {isLoading ? <IconLoader /> : 'Log In'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}
                                            </Formik>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                }
            </div>

            <Modal isOpen={openDeliveryPopup} centered className="modal modal-650 modal-not-centered checkout">
                <ModalHeader className="border-0 d-block pb-0 ms-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="fw-normal m-0">Delivery Address</h3>
                        <button
                            type="button"
                            onClick={() => setOpenDeliveryPopup(false)}
                            className="btn"
                            data-dismiss="modal"
                            aria-label="Close"
                        >
                            <i className="far fa-times-circle font-size-24"></i>
                        </button>
                    </div>
                </ModalHeader>
                <ModalBody className="p-0">
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={Yup.object({
                            street_address: Yup.string().required('Address is required!'),
                            city: Yup.string().required('City is required!'),
                            state: Yup.string().required('State is required!'),
                            zip: Yup.string().required('Zipcode is required!'),
                            phone: Yup.string().required('Phone is required!'),
                        })}
                        onSubmit={(values, actions) => {
                            handleSubmitAddress(values, actions);
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                {runform.errors && Object.keys(runform.errors)?.length > 0 && (
                                    <div className="alert alert-danger-login small mx-2">
                                        <h3>An error occurred!</h3>
                                        {runform.touched?.['street_address'] && runform.errors?.['street_address'] && (
                                            <p className="m-0">{runform.errors?.['street_address']}</p>
                                        )}
                                        {runform.touched?.['city'] && runform.errors?.['city'] && (
                                            <p className="m-0">{runform.errors?.['city']}</p>
                                        )}
                                        {runform.touched?.['state'] && runform.errors?.['state'] && (
                                            <p className="m-0">{runform.errors?.['state']}</p>
                                        )}
                                        {runform.touched?.['zip'] && runform.errors?.['zip'] && (
                                            <p className="m-0">{runform.errors?.['zip']}</p>
                                        )}
                                        {runform.touched?.['phone'] && runform.errors?.['phone'] && (
                                            <p className="m-0">{runform.errors?.['phone']}</p>
                                        )}
                                    </div>
                                )}

                                <div className="row border rounded m-3">
                                    <div className="col-12 col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">Street Address</label>
                                            <input
                                                type="text"
                                                {...formAttr(runform, 'street_address')}
                                                name="street_address"
                                                placeholder="Street Address"
                                                className="form-control border-bottom-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">Street Address #2 (Unit, APT, Bldg, etc…)</label>
                                            <input
                                                type="text"
                                                {...formAttr(runform, 'street_address_2')}
                                                name="street_address_2"
                                                placeholder="Street Address #2 (Unit, APT, Bldg, etc…)"
                                                className="form-control border-bottom-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-group">
                                            <label className="control-label">City</label>
                                            <input
                                                type="text"
                                                placeholder="City"
                                                {...formAttr(runform, 'city')}
                                                name="city"
                                                className="form-control border-bottom-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
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
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">Zip Code</label>
                                            <input
                                                type="text"
                                                placeholder="Zip Code"
                                                {...formAttr(runform, 'zip')}
                                                name="zip"
                                                className="form-control border-bottom-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">Phone</label>
                                            <input
                                                type="text"
                                                placeholder="(xxx)-xxx-xxxx"
                                                {...formAttr(runform, 'phone')}
                                                name="phone"
                                                className="form-control border-bottom-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">Gate Code</label>
                                            <input
                                                type="text"
                                                placeholder="Gate Code"
                                                {...formAttr(runform, 'gate_code')}
                                                name="gate_code"
                                                className="form-control border-bottom-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-group">
                                            <label className="control-label">Delivery Note</label>
                                            <input
                                                type="text"
                                                placeholder="Delivery Note"
                                                {...formAttr(runform, 'delivery_notes')}
                                                name="delivery_notes"
                                                className="form-control border-bottom-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="cursor-pointer m-3">
                                    <label className="">
                                        <input
                                            type="radio"
                                            checked={runform.values.is_save === "true"}
                                            onChange={(e) => runform.setFieldValue('is_save', e.target.checked?.toString())}
                                            name="is_save"
                                        />
                                        <span>Save address to profile and use for all future deliveries</span>
                                    </label>
                                </div>
                                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                                    <button className="col-6 border-end" type='button' onClick={() => setOpenDeliveryPopup(false)}>
                                        Cancel
                                    </button>
                                    <button className="col-6" type="submit">
                                        Save
                                    </button>
                                </ModalFooter>
                            </form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>

            <Modal isOpen={openPickupPopup} centered className="modal modal-650 modal-not-centered checkout">
                <ModalHeader className="border-0 d-block pb-0 ms-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="fw-normal m-0">Select your Pickup</h3>
                        <button
                            type="button"
                            onClick={() => setOpenPickupPopup(false)}
                            className="btn"
                            data-dismiss="modal"
                            aria-label="Close"
                        >
                            <i className="far fa-times-circle font-size-24"></i>
                        </button>
                    </div>
                </ModalHeader>
                <ModalBody className="pt-0">
                    <div className="d-flex flex-column pt-3">
                        {
                            pickupLocations?.map((item) => {
                                return (
                                    <div className={`px-3 mb-3 col-12 pickup-cart-wrapper_modal btnPickupPoint ${item.pickup_loc_name === pickupAddress ? 'active' : ''}`} key={item.pickup_location_id} onClick={() => setPickupAddress(item.pickup_loc_name)}>
                                        <div className="font-size-15">
                                            <div className="d-flex">
                                                <b>{item.pickup_loc_name}</b> <small className="text-muted ms-auto text-nowrap">Click to Select</small>
                                            </div>
                                            {item.pickup_address}, {item.zipcode} {item.city} | ${item.pickup_fee}
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button className="col-12" type='button' onClick={() => setOpenPickupPopup(false)}>
                        Cancel
                    </button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={allCardPopup} centered className="modal modal-650 modal-not-centered checkout">
                <ModalHeader className="border-0 d-block pb-0 ms-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="fw-normal m-0">Select your Card</h3>
                        <button
                            type="button"
                            onClick={() => setAllCardPopup(false)}
                            className="btn"
                            data-dismiss="modal"
                            aria-label="Close"
                        >
                            <i className="far fa-times-circle font-size-24"></i>
                        </button>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className='row padding-xs-col py-4'>
                        {
                            cards?.map((card) => {
                                return (
                                    <div className='col-md-6 col-sm-12' key={card.payment_card_id} onClick={(e) => { setSelectedCard(card); setAllCardPopup(false); }}>
                                        <div className="card__wrapper">
                                            <div className={`d-flex justify-content-between align-items-center cardv2 credit_card btnStripeCard ${selectedCard?.payment_card_id === card.payment_card_id ? 'active' : ''}`}>
                                                <div>
                                                    <p className="card_numer mb-0">
                                                        {card.url && <img className="card__front-logo card__logo me-3" src={card.url} />}
                                                        ***********{card.card_number}
                                                    </p>
                                                </div>
                                                <div className="" onClick={(e) => handleDeleteCard(e, card.payment_card_id)}>
                                                    <i className='far fa-trash-alt'></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button
                        className="w-100"
                        type='button'
                        onClick={() => setAllCardPopup(false)}
                    >
                        Cancel
                    </button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={addCardPopup} centered className="modal modal-650 modal-not-centered checkout">
                <ModalHeader className="border-0 d-block pb-0 ms-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="fw-normal m-0">Add a New Card</h3>
                        <button
                            type="button"
                            onClick={() => setAddCardPopup(false)}
                            className="btn"
                            data-dismiss="modal"
                            aria-label="Close"
                        >
                            <i className="far fa-times-circle font-size-24"></i>
                        </button>
                    </div>
                </ModalHeader>
                <ModalBody className="p-0">
                    <div className="row">
                        <div className='col-12'>
                            <form onSubmit={handleSubmitCard}>
                                <div className='my-5 padding-xs-col'>
                                    <CardElement />
                                </div>
                                <div className="upld-mls-btn border-top overflow-hidden">
                                    <button className="col-6 border-end" type='button' onClick={() => setAddCardPopup(false)}>
                                        Cancel
                                    </button>
                                    <button className="col-6" type="submit" disabled={!stripe}>
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
}
