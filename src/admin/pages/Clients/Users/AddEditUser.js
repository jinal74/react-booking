import React, { useContext, useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../../helpers/func_helper';
import { useNavigate, useParams } from 'react-router-dom';
import { IconLoader, SelectLoader } from '../../../Loader/IconLoader';
import { API_PATH } from '../../../constants/const';
import { toast } from 'react-toastify';
import FileIco from '../../../assets/images/cloud-arrow-up2.svg';
import { Modal, ModalBody, ModalFooter, ModalHeader, Tooltip } from 'reactstrap';
import CryptoJS from 'crypto-js';
import { SettingsStore } from "../../../context/SettingsContext";
import { PostApi } from '../../../../services/ApiService';
import { API_PATH_USER } from '../../../../const';
import DataTable from '../../Tables/CustDataTable';
import moment from 'moment';
import cheapImg from '../../../../assets/images/chip.png';
import littleSquare from '../../../../assets/images/little_square.png';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

export default function AddEditUser() {
    const runforms = useRef();
    const navigate = useNavigate();
    const { id } = useParams();
    const context = useContext(SettingsStore);
    const stripe = useStripe();
    const elements = useElements();

    const [edit_data, set_edit_data] = useState('add');
    const [isLoading, set_isLoading] = useState(false);
    const [kitchen_loc_list, setkitchen_loc_list] = useState(null);
    const [load_data, set_load_data] = useState(false);
    const [userList, set_userList] = useState([]);
    const [initialValues, set_initialValues] = useState({
        user_profile_image: null,
        user_role_id: '',
        user_first_name: '',
        user_last_name: '',
        is_active: "1",
        receive_sms: "1",
        receive_email: "1",
        kitchen_loc_id: '',
        user_email: '',
        last_checkout_on: "",
        password: '',
        phone_number: '',
        dob: '',
        loyalty_cashback: '',
        digital_amount_to_referring_customer: '',
        digital_amount_to_referred_customer: '',
        notes: '',
        kitchen_wise_role: []
    });
    const [tooltipOpen, setTooltipOpen] = useState('');
    const [allergens, setAllergens] = useState([]);
    const [selectedAllergens, setSelectedAllergens] = useState({ temp: [], main: [] });
    const [selectedDislikes, setSelectedDislikes] = useState({ temp: [], main: [] });
    const [dislikes, setDislikes] = useState([]);
    const [timer, setTimer] = useState(null);
    const [addresses, setAddresses] = useState({ Billing: null, Shipping: null });
    const [states, setStates] = useState([]);
    const [cards, setCards] = useState([]);
    const [billingAddressModal, setBillingAddressModal] = useState(false);
    const [shippingAddressModal, setShippingAddressModal] = useState(false);
    const [selectAllergenModal, setSelectAllergenModal] = useState(false);
    const [selectDislikeModal, setSelectDislikeModal] = useState(false);
    const [selectDietPrefModal, setSelectDietPrefModal] = useState(false);
    const [addCardModal, setAddCardModal] = useState(false);
    const [deliveryBagsData, setDeliveryBagsData] = useState([]);
    const [deliveryBagsOptions, setDeliveryBagsOptions] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'user_first_name',
        order: 1,
        show_header: false
    });
    const [subscriptionData, setSubscriptionData] = useState([]);
    const [subscriptionOptions, setSubscriptionOptions] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'user_first_name',
        order: 1
    });
    const [orderInvoiceData, setOrderInvoiceData] = useState([]);
    const [orderInvoiceOptions, setOrderInvoiceOptions] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'user_first_name',
        order: 1
    });
    const [transactionsData, setTransactionsData] = useState([]);
    const [transactionsOptions, setTransactionsOptions] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'user_first_name',
        order: 1
    });
    const [activeTab, set_activeTab] = useState(context.pickup_loc_status);

    const deliveryBagsColumns = [
        {
            name: 'ID',
            column: 'id',
            options: {
                sort: true,
            },
        },
        {
            name: 'Order',
            column: 'order',
            options: {
                sort: true
            },
        },
        {
            name: 'Tracking',
            column: 'tracking',
            options: {
                sort: true
            },
        },
        {
            name: 'Bag Fee',
            column: 'bag_fee',
            options: {
                sort: true
            },
        },
        {
            name: 'Bag Credit Once Returned',
            column: 'returned',
            options: {
                sort: true
            },
        },
        {
            name: 'Delivery date',
            column: 'delivery_date',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return <span>{(data[i].delivery_date && data[i].delivery_date != 0) ? moment(data[i].delivery_date).format('MMM DD, YYYY') : ""}</span>
                }
            },
        },
        {
            name: 'Status',
            column: 'is_active',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span className='bg-success rounded-pill text-white'>{data[i].is_active == 1 ? 'Active' : 'Inactive'}</span>
                    )
                }
            },
        },
        {
            name: 'Action',
            column: 'user_id',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="cursor-pointer" onClick={() => handleRowClick(data[i])}>
                            <i className="bx bxs-edit-alt fs-4"></i>
                        </div>
                    );
                },
            },
        },
    ];

    const subscriptionColumns = [
        {
            name: 'ID',
            column: 'id',
            options: {
                sort: true,
            },
        },
        {
            name: 'Group',
            column: 'group',
            options: {
                sort: true
            },
        },
        {
            name: 'Subscription',
            column: 'subscription',
            options: {
                sort: true
            },
        },
        {
            name: 'User',
            column: 'user',
            options: {
                sort: true
            },
        },
        {
            name: 'Start',
            column: 'start',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return <span>{(data[i].start && data[i].start != 0) ? moment(data[i].start).format('MMM DD, YYYY') : ""}</span>
                }
            },
        },
        {
            name: 'End',
            column: 'end',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return <span>{(data[i].end && data[i].end != 0) ? moment(data[i].end).format('MMM DD, YYYY') : ""}</span>
                }
            },
        },
        {
            name: 'Renew',
            column: 'renew',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return <span>{(data[i].renew && data[i].renew != 0) ? moment(data[i].renew).format('MMM DD, YYYY') : ""}</span>
                }
            },
        },
        {
            name: 'Amount',
            column: 'amount',
            options: {
                sort: true
            },
        }
    ];

    const orderInvoiceColumns = [
        {
            name: 'Order',
            column: 'order',
            options: {
                sort: true,
            },
        },
        {
            name: 'Type',
            column: 'type',
            options: {
                sort: true
            },
        },
        {
            name: 'Amount',
            column: 'amount',
            options: {
                sort: true
            },
        },
        {
            name: 'Discounts',
            column: 'discounts',
            options: {
                sort: true
            },
        },
        {
            name: 'Date',
            column: 'date',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return <span>{(data[i].date && data[i].date != 0) ? moment(data[i].date).format('MMM DD, YYYY') : ""}</span>
                }
            },
        },
        {
            name: 'Payment Method',
            column: 'payment_method',
            options: {
                sort: true
            },
        },
        {
            name: 'Status',
            column: 'status',
            options: {
                sort: true
            },
        },
        {
            name: 'Kitchen Location',
            column: 'kitchen_location',
            options: {
                sort: true
            },
        }
    ];

    const transactionsColumns = [
        {
            name: 'Creation',
            column: 'creation',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return <span>{(data[i].creation && data[i].creation != 0) ? moment(data[i].creation).format('MMM DD, YYYY') : ""}</span>
                }
            },
        },
        {
            name: 'Value',
            column: 'value',
            options: {
                sort: true
            },
        },
        {
            name: 'Description',
            column: 'description',
            options: {
                sort: true
            },
        }
    ];

    const toggle = (key) => {
        setTooltipOpen(tooltipOpen == key ? '' : key);
    }

    useEffect(() => {
        GlobalUserList();
        GetAllKitchenLocations();
    }, []);

    useEffect(() => {
        if (id && kitchen_loc_list) {
            fetchEditData(id);
            GetAllStates();
            GetAddresses();
            GetCards();
            GetAllAllergens();
            GetAllDislikes();
            GetAllergenPreferences();
            GetDislikePreferences();
        } else if (kitchen_loc_list && !id) {
            let kitchenWiseRole = kitchen_loc_list?.map((f) => ({
                kitchen_loc_id: f.kitchen_location_id,
                user_role_id: ""
            }))
            runforms?.current?.setFieldValue("kitchen_wise_role", kitchenWiseRole);
        }
    }, [id, kitchen_loc_list]);

    const GetAllAllergens = async (searchVal = '') => {
        const response = await PostApi(API_PATH.getIngredientAllergens, {
            type: 'all',
            search_name: searchVal,
        });
        if (response.statusCode === 200) {
            setAllergens(response.data.data_result);
        } else {
            setAllergens([])
        }
    };

    const GetCards = async () => {
        const response = await PostApi(API_PATH_USER.GetCards, { user_id: id });
        if (response?.statusCode === 200) {
            let data = response.data;
            setCards(data);
        } else {
            setCards([])
        }
    };

    const GetAddresses = async () => {
        const response = await PostApi(API_PATH_USER.GetAddresses, { user_id: id });
        if (response?.statusCode === 200) {
            let data = response.data;
            let Shipping = null;
            let Billing = null;

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

            setAddresses({ Billing, Shipping });
        }
    };

    const GetAllStates = async () => {
        const response = await PostApi(API_PATH.getallDeliveryStates, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            setStates(response.data.data_result ?? []);
        } else {
            setStates([])
        }
    };

    const GetAllDislikes = async (searchVal = '') => {
        const response = await PostApi(API_PATH.getIngredientDislikes, {
            type: 'all',
            search_name: searchVal,
        });
        if (response.statusCode === 200) {
            setDislikes(response.data.data_result);
        } else {
            setDislikes([])
        }
    };

    const GetAllergenPreferences = async () => {
        const response = await PostApi(API_PATH_USER.GetAllergenPreferences, { user_id: id });
        if (response.statusCode === 200) {
            let allergenRes = response.data[0]?.allergens?.split(',') ?? [];
            let arr = allergenRes?.map((f) => f.split(':')?.[0]);
            setSelectedAllergens({ temp: arr, main: arr });
        }
    };

    const GetDislikePreferences = async () => {
        const response = await PostApi(API_PATH_USER.GetDislikePreferences, { user_id: id });
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
        const response = await PostApi(API_PATH_USER.DeleteCards, { payment_card_id: id, user_id: id });
        if (response.statusCode === 200) {
            toast.success('Card deleted successfully');
            GetCards();
        }
    }

    const handleSaveAllergen = async () => {
        const response = await PostApi(API_PATH_USER.AddAllergenPreferences, { allergen_ids: selectedAllergens.temp, user_id: id });
        if (response.statusCode === 200) {
            toast.success(response.data);
            GetAllergenPreferences();
        }
        setSelectAllergenModal(false);
    };

    const handleSaveDislike = async () => {
        const response = await PostApi(API_PATH_USER.AddDislikePreferences, { dislike_ids: selectedDislikes.temp, user_id: id });
        if (response.statusCode === 200) {
            toast.success(response.data);
            GetDislikePreferences();
        }
        setSelectDislikeModal(false);
    };

    const handleSubmitAddress = async (values) => {
        let tempObj = JSON.parse(JSON.stringify(values));
        tempObj.user_id = id;
        // tempObj.is_save = true;
        tempObj.type = tempObj.address_type;
        delete tempObj.address_type;

        const response = await PostApi(API_PATH_USER.UpdateAdresses, tempObj);
        if (response.statusCode === 200) {
            toast.success(`${tempObj.type} address updated successfully`);
            GetAddresses();
        }
        setShippingAddressModal(false);
        setBillingAddressModal(false);
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

    const GetAllKitchenLocations = async () => {
        const response = await PostApi(API_PATH.getAllKitchenLocation, {
            type: "all",
        });
        if (response.statusCode === 200) {
            setkitchen_loc_list(response.data.data_result);
        }
    };

    const GlobalUserList = async () => {
        set_load_data(true);
        const response = await PostApi(API_PATH.getGlobalUserList);
        if (response.statusCode === 200) {
            set_load_data(false);
            set_userList(response.data ?? []);
            if (!id) runforms?.current?.setFieldValue("user_role_id", response.data?.[0]?.user_role_id);
        }
        set_load_data(false);
    };

    const fetchEditData = async (user_id) => {
        const response = await PostApi(API_PATH.getCompanyUserById, { user_id });
        if (response.statusCode === 200) {
            let data = response.data.user_detail;
            set_edit_data('edit');

            let formattedDate = data.dob ?? '';
            if (data.dob && data.dob !== '') {
                const inputDate = new Date(data.dob).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
                const parts = inputDate.split('/');
                formattedDate = `${parts[2]}-${parts[0]}-${parts[1]}`;
            }
            let kitchenWiseRole = [];
            if (response.data.kitchen_wise_user_role?.length > 0) {
                kitchenWiseRole = kitchen_loc_list?.map((f) => {
                    let find = response.data.kitchen_wise_user_role?.find((item) => item.kitchen_location_id === f.kitchen_location_id);
                    if (find) {
                        return ({
                            kitchen_loc_id: f.kitchen_location_id,
                            user_role_id: find.user_role_id === data?.user_role_id ? "" : find.user_role_id
                        })
                    } else {
                        return ({
                            kitchen_loc_id: f.kitchen_location_id,
                            user_role_id: ""
                        })
                    }
                }) ?? [];
            } else {
                kitchenWiseRole = kitchen_loc_list?.map((f) => ({
                    kitchen_loc_id: f.kitchen_location_id,
                    user_role_id: ""
                })) ?? [];
            }

            set_initialValues({
                user_id: data.user_id,
                user_profile_image: data.user_profile_image,
                user_role_id: data.user_role_id,
                user_first_name: data.user_first_name,
                user_last_name: data.user_last_name,
                is_active: data.is_active,
                receive_sms: data.receive_sms,
                receive_email: data.receive_email,
                kitchen_loc_id: data.kitchen_loc_id,
                user_email: data.user_email,
                password: data.password ?? '',
                phone_number: data.phone_number,
                dob: formattedDate,
                loyalty_cashback: data.loyalty_cashback,
                digital_amount_to_referring_customer: data.digital_amount_to_referring_customer,
                digital_amount_to_referred_customer: data.digital_amount_to_referred_customer,
                notes: data.notes,
                firebase_user_id: data.firebase_user_id,
                last_checkout_on: "",
                kitchen_wise_role: kitchenWiseRole
            });

            document.getElementById('is_active').checked = data.is_active == 1;
            document.getElementById('receive_sms').checked = data.receive_sms == 1;
            document.getElementById('receive_email').checked = data.receive_email == 1;

            if (data.user_profile_image) {
                let img = document.getElementById('user-img');
                img.className = 'w-100 h-100';
                img.src = data.user_profile_image;
                document.getElementById('upload-img-area').style.display = 'none';
            }
        }
    }

    const handleImg = (file, e) => {
        if (file.length < 0) {
            return;
        }
        if ((file.size / 1024 / 1024).toFixed(2) >= 1) {
            if (e) e.target.value = null;
            toast.error('please select less than 1mb size');
            return;
        } else if (!file.type.includes('image')) {
            if (e) e.target.value = null;
            toast.error('please select valid image');
            return;
        }

        if (file) {
            let img = document.getElementById('user-img');
            if (file && file != '') {
                let reader = new FileReader();
                reader.onload = function () {
                    img.className = 'w-100 h-100';
                    img.src = reader.result;
                    runforms.current.setFieldValue('user_profile_image', file);
                    document.getElementById('upload-img-area').style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSubmitForm = () => {
        document.getElementById('users-submit').click();
    };

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? "1" : "0";
        runforms.current.setFieldValue(e.target.id, value);
        document.getElementById(e.target.id).checked = e.target.checked;
    };

    const changeKitchenWiseUserRole = (value, item, index) => {
        let tempData = [...runforms.current?.values?.kitchen_wise_role];
        let tempObj = { ...item };
        tempObj.user_role_id = value;
        tempData?.splice(index, 1, tempObj);
        runforms?.current?.setFieldValue("kitchen_wise_role", tempData);
    }

    const handleSubmit = async (formData) => {
        set_isLoading(true);
        let temp_obj = { ...formData };

        if (temp_obj.kitchen_loc_id === "") temp_obj.kitchen_loc_id = null;
        if (formData.password !== '') {
            const encryptedPassword = CryptoJS.AES.encrypt(formData.password, process.env.REACT_APP_SECRET_KEY).toString();
            temp_obj.password = encryptedPassword;
        }
        if (temp_obj?.kitchen_wise_role) {
            temp_obj.kitchen_wise_role = temp_obj?.kitchen_wise_role?.map((f) => ({
                kitchen_loc_id: (f.kitchen_loc_id ?? f.kitchen_location_id),
                user_role_id: (f.user_role_id === "" ? temp_obj?.user_role_id : f.user_role_id)
            }))
        }

        const timestamp = new Date(temp_obj.dob).getTime();
        if (temp_obj.dob && temp_obj.dob !== '') temp_obj.dob = timestamp;

        const form_data = new FormData()
        if (temp_obj.user_profile_image && typeof temp_obj.user_profile_image !== 'string') {
            form_data.append('user_profile_image', temp_obj.user_profile_image);
        }

        let api_path = '';
        let message = '';

        if (edit_data === 'edit') {
            api_path = API_PATH.editCompanyUsers;
            message = 'User updated successfully';
        } else {
            api_path = API_PATH.addCompanyUsers;
            message = 'User added successfully';
        }

        form_data.append('props', JSON.stringify(temp_obj));

        if (api_path != '') {
            const response = await PostApi(api_path, form_data);
            if (response.statusCode === 200) {
                toast.success(message);
                navigate('/admin/users');
            }
            set_isLoading(false);
        }
    };

    const deliveryBagsTableCallBack = (option) => {
        setDeliveryBagsOptions(option);
    };

    const subscriptionTableCallBack = (option) => {
        setSubscriptionOptions(option);
    };

    const orderInvoiceTableCallBack = (option) => {
        setOrderInvoiceOptions(option);
    };

    const transactionsTableCallBack = (option) => {
        setTransactionsOptions(option);
    };

    const handleRowClick = (data) => {
        navigate(`/`);
    };

    const toggleSubscription = (tab) => {
        if (activeTab !== tab) {
            set_activeTab(tab);
        }
    }

    return (
        <React.Fragment>
            <div className="page-content user-add-main back_content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center">
                            <span
                                className="d-flex align-items-center p-0 me-3 cursor-pointer"
                                onClick={() => navigate('/admin/users')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data === 'edit' ? 'Edit' : 'Add'} User</h4>
                            <div className="ms-auto">
                                <button type="submit" className="btn btn-success" onClick={handleSubmitForm}>
                                    {isLoading ? <IconLoader /> : 'SAVE'}
                                </button>
                                {
                                    edit_data === 'edit' &&
                                    <>
                                        <button type='button' className="btn back_admin ms-2">
                                            <i className='bx bx-pencil fs-5 align-middle'></i> Edit Balance ($471.95)
                                        </button>
                                        <button type='button' className="btn meal-auto-bx text-white ms-2">
                                            <i className='bx bx-paper-plane fs-5 align-middle'></i> Send Message
                                        </button>
                                        <button type='button' className="btn back_admin ms-1">
                                            <i className='fas fa-cash-register font-size-11'></i> New Order
                                        </button>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <Formik
                            innerRef={runforms}
                            enableReinitialize
                            initialValues={initialValues}
                            validationSchema={Yup.object({
                                user_first_name: Yup.string().required('Please enter first name'),
                                user_last_name: Yup.string().required('Please enter last name'),
                                user_email: Yup.string().required('Please enter email'),
                                password: Yup.string()
                                    .test('check-password', function (value) {
                                        if ((!id) && !value) {
                                            return this.createError({ message: 'Please enter password' });
                                        }
                                        if (value && value.length < 6) {
                                            return this.createError({ message: 'Password must be at least 6 characters' });
                                        }
                                        return true;
                                    }),
                            })}
                            onSubmit={(values) => {
                                handleSubmit(values);
                            }}
                        >
                            {(runform) => (
                                <form onSubmit={runform.handleSubmit}>
                                    <div className="row mx-2 mb-3">
                                        <div className="col-md-3">
                                            <div className="p-3 card_table h-100">
                                                <div>
                                                    <div className="upload-file-dash-new position-relative">
                                                        <div className="file-selecter text-center position-relative">
                                                            <div className="file-area position-relative">
                                                                <input
                                                                    type="file"
                                                                    name="user_profile_image"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleImg(e.target.files[0], e)}
                                                                />
                                                                <div className="file-dummy">
                                                                    <img id="user-img" loading="lazy" alt="" />
                                                                    <div id='upload-img-area'>
                                                                        <div className="file-upload-content">
                                                                            <img
                                                                                className="file-dummy-image"
                                                                                loading="lazy"
                                                                                src={FileIco}
                                                                                alt=""
                                                                            />
                                                                        </div>
                                                                        <span>
                                                                            Drag and drop your files or{' '}
                                                                            <bdi
                                                                                style={{ textDecoration: 'underline' }}
                                                                            >
                                                                                Browse
                                                                            </bdi>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='mt-3'>
                                                    <label>Global User Role</label>
                                                    <div>
                                                        {load_data ? (
                                                            <span className="form-select p-1">
                                                                <SelectLoader />
                                                            </span>
                                                        ) : (
                                                            <select
                                                                className="form-select"
                                                                name="user_role_id"
                                                                {...formAttr(runform, "user_role_id")}
                                                            >
                                                                {userList.map((user) => (
                                                                    <option
                                                                        key={user.user_role_id}
                                                                        value={user.user_role_id}
                                                                    >
                                                                        {user.user_role_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                </div>
                                                {
                                                    runform.values?.kitchen_wise_role?.map((item, i) => {
                                                        let index = kitchen_loc_list?.findIndex((f) => f.kitchen_location_id === (item.kitchen_loc_id ?? item.kitchen_location_id));
                                                        return (
                                                            <div className='mt-3' key={`kitchen-role-${item.kitchen_location_id}-${i}`}>
                                                                <label>{kitchen_loc_list?.[index]?.kitchen_loc_name} kitchen User Role</label>
                                                                <div>
                                                                    <select
                                                                        className="form-select"
                                                                        name="kitchen_wise_role"
                                                                        onChange={(e) => changeKitchenWiseUserRole(e.target.value, item, i)}
                                                                        value={item.user_role_id}
                                                                    >
                                                                        <option value="">Default Global Role</option>
                                                                        {userList.map((user) => (
                                                                            <option
                                                                                key={user.user_role_id}
                                                                                value={user.user_role_id}
                                                                            >
                                                                                {user.user_role_name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-9">
                                            <div className="p-3 card_table h-100">
                                                <div className="row">
                                                    <div className="col-md-4 mb-3">
                                                        <label>Name</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="user_first_name"
                                                                type="text"
                                                                placeholder="Enter First Name"
                                                                {...formAttr(runform, 'user_first_name')}
                                                            />
                                                            {errorContainer(runform, 'user_first_name')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label>Last Name</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="user_last_name"
                                                                type="text"
                                                                placeholder="Enter Last Name"
                                                                {...formAttr(runform, 'user_last_name')}
                                                            />
                                                            {errorContainer(runform, 'user_last_name')}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-4 mb-1">
                                                        <div className="form-check form-switch form-switch-md mt-2">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_active"
                                                                onChange={handleChangeSwitch}
                                                                defaultChecked={runform.values?.is_active == 1}
                                                            />
                                                            <label
                                                                className="form-check-label d-flex align-items-center"
                                                                htmlFor="is_active"
                                                            >Is Active?</label>
                                                        </div>
                                                        <div className="form-check form-switch form-switch-md mt-1">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="receive_sms"
                                                                onChange={handleChangeSwitch}
                                                                defaultChecked={runform.values?.receive_sms == 1}
                                                            />
                                                            <label
                                                                className="form-check-label d-flex align-items-center"
                                                                htmlFor="receive_sms"
                                                            >Recieve SMS?</label>
                                                        </div>
                                                        <div className="form-check form-switch form-switch-md my-1">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="receive_email"
                                                                onChange={handleChangeSwitch}
                                                                defaultChecked={runform.values?.receive_email == 1}
                                                            />
                                                            <label
                                                                className="form-check-label d-flex align-items-center"
                                                                htmlFor="receive_email"
                                                            >Recieve EMAIl?</label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label>Kitchen Location</label>
                                                        <div>
                                                            <select
                                                                className="form-select"
                                                                name="kitchen_loc_id"
                                                                {...formAttr(runform, 'kitchen_loc_id')}
                                                            >
                                                                <option value="">
                                                                    --Select--
                                                                </option>
                                                                {kitchen_loc_list?.map((user) => (
                                                                    <option
                                                                        key={user.kitchen_location_id}
                                                                        value={user.kitchen_location_id}
                                                                    >
                                                                        {user.kitchen_loc_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label>Email</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="user_email"
                                                                type="email"
                                                                disabled={edit_data === 'edit'}
                                                                autoComplete="off"
                                                                placeholder="Enter E-mail"
                                                                {...formAttr(runform, 'user_email')}
                                                            />
                                                            {errorContainer(runform, 'user_email')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 me-1 mb-3">
                                                        <label>Password</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="password"
                                                                type="password"
                                                                autoComplete="new-password"
                                                                placeholder="Leave blank to keep current"
                                                                {...formAttr(runform, 'password')}
                                                            />
                                                            {errorContainer(runform, 'password')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label>Phone</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="phone_number"
                                                                type="tel"
                                                                placeholder="Enter Phone Number"
                                                                {...formAttr(runform, 'phone_number')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label>Birth Date</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="dob"
                                                                type="date"
                                                                {...formAttr(runform, 'dob')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className='d-flex align-items-center'>
                                                            User Loyalty Cashback (-1 to use default: 0%)
                                                            <div id='Tooltip_loyalty_cashback' className='d-inline-flex'>
                                                                <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'loyalty_cashback'}
                                                                placement={'right'}
                                                                target='Tooltip_loyalty_cashback'
                                                                toggle={() => toggle('loyalty_cashback')}
                                                            >
                                                                tooltip
                                                            </Tooltip>
                                                        </label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="loyalty_cashback"
                                                                type="number"
                                                                {...formAttr(runform, 'loyalty_cashback')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className='d-flex align-items-center'>
                                                            Digital Amount to Referring Customer (-1 to use default: $40.00)
                                                            <div id='Tooltip_digital_amount_to_referring_customer' className='d-inline-flex'>
                                                                <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'digital_amount_to_referring_customer'}
                                                                placement={'right'}
                                                                target='Tooltip_digital_amount_to_referring_customer'
                                                                toggle={() => toggle('digital_amount_to_referring_customer')}
                                                            >
                                                                tooltip
                                                            </Tooltip>
                                                        </label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="digital_amount_to_referring_customer"
                                                                type="number"
                                                                {...formAttr(runform, 'digital_amount_to_referring_customer')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className='d-flex align-items-center'>
                                                            Digital Amount to Referred Customer (-1 to use default: $40.00)
                                                            <div id='Tooltip_digital_amount_to_referred_customer' className='d-inline-flex'>
                                                                <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'digital_amount_to_referred_customer'}
                                                                placement={'right'}
                                                                target='Tooltip_digital_amount_to_referred_customer'
                                                                toggle={() => toggle('digital_amount_to_referred_customer')}
                                                            >
                                                                tooltip
                                                            </Tooltip>
                                                        </label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="digital_amount_to_referred_customer"
                                                                type="number"
                                                                {...formAttr(runform, 'digital_amount_to_referred_customer')}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className='d-flex align-items-center'>
                                                            Notes
                                                        </label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="notes"
                                                                type="text"
                                                                {...formAttr(runform, 'notes')}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {edit_data === 'edit' &&
                                            <>
                                                <div className='col-12 mt-3'>
                                                    <div className="card_table mt-3">
                                                        <div className="row align-items-center">
                                                            <div className="col-12 col-sm-4">
                                                                <h2 className="m-0">Billing Address</h2>
                                                            </div>
                                                            <div className="col-12 col-sm-4">
                                                                <div className="profileSelected">
                                                                    {
                                                                        (addresses.Billing?.street_address !== "" || addresses.Billing?.city !== "" || addresses.Billing?.zip !== "" || addresses.Billing?.state !== "") && (
                                                                            <span>
                                                                                {addresses.Billing?.street_address}, {addresses.Billing?.city}, {addresses.Billing?.zip} {states?.find((f) => f.delivery_state_id === addresses.Billing?.state)?.abbreviation}
                                                                            </span>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-4 text-end">
                                                                <button
                                                                    className="new_button_square_big btn back_admin w-50"
                                                                    type='button'
                                                                    onClick={() => setBillingAddressModal(true)}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-12 mt-2'>
                                                    <div className="card_table mt-3">
                                                        <div className="row align-items-center">
                                                            <div className="col-12 col-sm-4">
                                                                <h2 className="m-0">Shipping Address</h2>
                                                            </div>
                                                            <div className="col-12 col-sm-4">
                                                                <div className="profileSelected">
                                                                    {
                                                                        (addresses.Shipping?.street_address !== "" || addresses.Shipping?.street_address_2 !== "" || addresses.Shipping?.city !== "" || addresses.Shipping?.zip !== "" || addresses.Shipping?.state !== "") && (
                                                                            <span>
                                                                                {addresses.Shipping?.street_address}, {addresses.Shipping?.street_address_2}, {addresses.Shipping?.city}, {addresses.Shipping?.zip} {states?.find((f) => f.delivery_state_id === addresses.Shipping?.state)?.state_name}
                                                                            </span>
                                                                        )
                                                                    }
                                                                    <p className='m-0'>Delivery Notes: {addresses.Shipping?.delivery_notes}</p>
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-4 text-end">
                                                                <button
                                                                    className="new_button_square_big btn back_admin w-50"
                                                                    type='button'
                                                                    onClick={() => setShippingAddressModal(true)}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-12 mt-2'>
                                                    <div className="card_table mt-3">
                                                        <div className="row align-items-center">
                                                            <div className="col-12 col-sm-4">
                                                                <h2 className="m-0">Allergies</h2>
                                                            </div>
                                                            <div className="col-12 col-sm-4">
                                                                <div className="d-flex flex-wrap">
                                                                    {selectedAllergens?.main?.map((item, i) => {
                                                                        let allergen = allergens?.find((f) => f.ingredient_allergen_id === item);
                                                                        return (
                                                                            <div className="text-center profileSelected" key={item}>
                                                                                <span>{allergen?.ingredient_allergen_name}{(i !== selectedAllergens?.main.length - 1) && `,`}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-4 text-end">
                                                                <button
                                                                    className="new_button_square_big btn back_admin w-50"
                                                                    type='button'
                                                                    onClick={() => setSelectAllergenModal(true)}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-12 mt-2'>
                                                    <div className="card_table mt-3">
                                                        <div className="row align-items-center">
                                                            <div className="col-12 col-sm-4">
                                                                <h2 className="m-0">Dislikes</h2>
                                                            </div>
                                                            <div className="col-12 col-sm-4">
                                                                <div className="d-flex flex-wrap">
                                                                    {selectedDislikes?.main?.map((item, i) => {
                                                                        let dislike = dislikes?.find((f) => f.ingredient_dislike_id === item);
                                                                        return (
                                                                            <div className="text-center profileSelected" key={item}>
                                                                                <span>{dislike?.ingredient_dislike_name}{(i !== selectedDislikes?.main.length - 1) && ','}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-4 text-end">
                                                                <button
                                                                    className="new_button_square_big btn back_admin w-50"
                                                                    type='button'
                                                                    onClick={() => setSelectDislikeModal(true)}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-12 mt-2'>
                                                    <div className="card_table mt-3">
                                                        <div className="row align-items-center">
                                                            <div className="col-12 col-sm-8">
                                                                <h2 className="m-0">Diet Preferences - <small>OR</small></h2>
                                                            </div>

                                                            <div className="col-12 col-sm-4 text-end">
                                                                <button
                                                                    className="new_button_square_big btn back_admin w-50"
                                                                    type='button'
                                                                    onClick={() => setSelectDietPrefModal(true)}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-12 mt-2'>
                                                    <div className="card_table mt-3">
                                                        <div className="row align-items-center">
                                                            <div className="col-12">
                                                                <h2 className="m-0">Delivery Bags</h2>
                                                            </div>
                                                            <div className="col-12 pt-3">
                                                                <DataTable data={deliveryBagsData} options={deliveryBagsOptions} tableCallBack={deliveryBagsTableCallBack} columns={deliveryBagsColumns} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-12 mt-2'>
                                                    <div className="card_table mt-3">
                                                        <div className="row align-items-center">
                                                            <div className="col-12">
                                                                <h2 className="m-0">Subscriptions</h2>
                                                            </div>
                                                            <div className="col-12 pt-3">
                                                                <div className='d-flex align-items-center mt-2'>
                                                                    <div className={activeTab == '1' ? 'active' : ''} onClick={() => toggleSubscription('1')}>
                                                                        <button type='button' className={`btn ${activeTab == '1' ? 'btn-success' : 'border-success text-success'}`}>Automatic Renewal</button>
                                                                    </div>
                                                                    <div className={activeTab == '0' ? 'active' : ''} onClick={() => toggleSubscription('0')}>
                                                                        <button type='button' className={`btn ms-2 ${activeTab == '0' ? 'btn-success' : 'border-success text-success'}`}>Manual Renewal</button>
                                                                    </div>
                                                                </div>
                                                                <DataTable data={subscriptionData} options={subscriptionOptions} tableCallBack={subscriptionTableCallBack} columns={subscriptionColumns} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-12 mt-2">
                                                    <div className="card_table mt-3">
                                                        <div className="row">
                                                            <div className="col-md-6 col-12">
                                                                <h2>
                                                                    User Cards
                                                                    <span className="clean-badge primary-bg-cls ms-2 font-size-11">{context?.selected_location?.kitchen_loc_name}</span>
                                                                </h2>
                                                            </div>
                                                            <div className="col-md-6 col-12 text-end">
                                                                <button className="btn bg-dark new_button_square_big" type='button' onClick={() => setAddCardModal(true)}>
                                                                    Add new Card
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="row justify-content-between">
                                                            <div className="cart_new d-flex justify-content-start flex-wrap">
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
                                                                                    <p className="col-12 card_numer">***********{card.card_number?.slice(-4)}</p>
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
                                                <div className='col-12 mt-2'>
                                                    <div className="card_table mt-3">
                                                        <div className="row align-items-center">
                                                            <div className="col-6">
                                                                <h2 className="m-0">Customer Order Invoices</h2>
                                                            </div>
                                                            <div className="col-6 text-end">
                                                                <h2 className="m-0">Lifetime Value $25,973.01</h2>
                                                            </div>
                                                            <div className="col-12 pt-3">
                                                                <DataTable data={orderInvoiceData} options={orderInvoiceOptions} tableCallBack={orderInvoiceTableCallBack} columns={orderInvoiceColumns} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-12 mt-2'>
                                                    <div className="card_table mt-3">
                                                        <div className="row align-items-center">
                                                            <div className="col-12">
                                                                <h2 className="m-0">Transactions</h2>
                                                            </div>
                                                            <div className="col-12 pt-3">
                                                                <DataTable data={transactionsData} options={transactionsOptions} tableCallBack={transactionsTableCallBack} columns={transactionsColumns} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        }
                                    </div>
                                    <div className='text-end mx-4 mb-3'>
                                        <button
                                            type="submit"
                                            className="btn btn-success px-4"
                                            id="users-submit"
                                        >
                                            {runform.isSubmitting ? <IconLoader /> : 'SAVE'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>

            <Modal isOpen={selectAllergenModal} centered className="modal modal-650 modal-not-centered profile">
                <ModalBody>
                    <div className="row">
                        <div className="col-12 text-center modal_action_content">
                            <h1 className="text-uppercase fw-bolder font-size-24">SELECT CLIENT'S ALLERGENS</h1>
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
                            <h1 className="text-uppercase fw-bolder font-size-24">SELECT CLIENT'S DISLIKES</h1>
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

            <Modal isOpen={billingAddressModal} centered className="modal modal-650 modal-not-centered profile">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Billing Address</h5>
                    <button
                        type="button"
                        onClick={() => setBillingAddressModal(false)}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <ModalBody>
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
                                    <div className="col-12 col-sm-6">
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
                                    <div className="col-12 col-sm-6">
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
                                                        {state.abbreviation}
                                                    </option>
                                                ))}
                                            </select>
                                            {errorContainer(runform, 'state')}
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
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
                                    <div className="col-12 text-end border-top">
                                        <button type="submit" className="new_button_square_big btn btn-success mb-0">
                                            {runform.isSubmitting ? <IconLoader /> : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>

            <Modal isOpen={shippingAddressModal} centered className="modal modal-650 modal-not-centered profile">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Shipping Address</h5>
                    <button
                        type="button"
                        onClick={() => setShippingAddressModal(false)}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <ModalBody>
                    <Formik
                        enableReinitialize
                        initialValues={addresses.Shipping}
                        validationSchema={Yup.object({
                            street_address: Yup.string().required('Address is required!'),
                            city: Yup.string().required('City is required!'),
                            state: Yup.string().required('State is required!'),
                            zip: Yup.string().required('Zipcode is required!'),
                            phone: Yup.string().required('Phone is required!'),
                        })}
                        onSubmit={(values, { setSubmitting }) => {
                            handleSubmitAddress(values);
                            setSubmitting(false);
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row">
                                    <div className="col-12 col-sm-6">
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
                                    <div className="col-12 col-sm-6">
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
                                    <div className="col-12 col-sm-6">
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
                                            {errorContainer(runform, 'state')}
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
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
                                    <div className="col-12 col-sm-6">
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
                                    <div className="col-12 col-sm-6">
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
                                    <div className="col-12 col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">Transporter</label>
                                            <select
                                                className="form-select border-bottom-input form-control"
                                                {...formAttr(runform, 'transporter')}
                                                name="transporter"
                                            >
                                                <option>--Use default--</option>
                                            </select>
                                            {errorContainer(runform, 'transporter')}
                                        </div>
                                    </div>
                                    <div className="col-12">
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
                                    <div className="col-12 text-end border-top">
                                        <button type="submit" className="new_button_square_big btn btn-success mb-0">
                                            {runform.isSubmitting ? <IconLoader /> : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>

            <Modal isOpen={addCardModal} centered className="modal modal-not-centered profile">
                <ModalHeader>
                    <h5 className="modal-title mt-0">Add credit card</h5>
                    <button
                        type="button"
                        onClick={() => setAddCardModal(false)}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
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
        </React.Fragment >
    );
}
