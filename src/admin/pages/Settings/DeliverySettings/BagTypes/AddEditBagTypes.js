import React, { useContext, useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../../../helpers/func_helper';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IconLoader, SelectLoader } from '../../../../Loader/IconLoader';
import { API_PATH } from '../../../../constants/const';
import { PostApi } from '../../../../../services/ApiService';
import Loader from '../../../../Loader/Loader';
import { SettingsStore } from '../../../../context/SettingsContext';

export default function AddEditBagTypes() {
    const runforms = useRef();
    const context = useContext(SettingsStore);
    const navigate = useNavigate();
    const { id } = useParams();

    const [isLoading, set_isLoading] = useState(false);
    const [load_data, set_load_data] = useState(false);
    const [edit_data, set_edit_data] = useState(false);
    const [allow_routes, set_allow_routes] = useState([]);
    const [routes_list, set_routes_list] = useState([]);
    const [pickup_point_list, set_pickup_point_list] = useState([]);
    const [allow_pickup_points, set_allow_pickup_points] = useState([]);
    const [isLoading_routes, set_isLoading_routes] = useState(false);
    const [initialValues, set_initialValues] = useState({
        bag_name: '',
        is_active: "1",
        max_meal_into_bag: '',
        bag_price: '',
        bag_return_fee: '',
        one_time_fee: '',
        internal_description: '',
        is_allow_gift_card: "1",
        is_allow_cart: "1",
        is_allow_wholesale: "1",
        is_allow_meal_packs: "1",
        is_allow_weekly_subscription: "1",
        delivery_routes_bags: [],
        pickup_location_bags: []
    });

    useEffect(() => {
        if (context?.selected_location) GetAllDeliveryRoutes();
        if (id) {
            set_edit_data(true)
            GetBagTypeById(id)
        }
    }, [context?.selected_location, id]);

    useEffect(() => {
        GetAllPickupPoints();
    }, []);

    useEffect(() => {
        if (!edit_data) {
            const pickupLocationArray = pickup_point_list.map((pickupPoint) => ({
                pickup_location_id: pickupPoint.pickup_location_id,
                is_allow: "1",
            }));
            set_allow_pickup_points(pickupLocationArray)

            const routesArray = routes_list.map((routes) => ({
                delivery_route_id: routes.delivery_route_id,
                is_allow: "1",
            }));
            set_allow_routes(routesArray)
        }
    }, [pickup_point_list, routes_list]);

    const GetBagTypeById = async (id) => {
        set_load_data(true)
        const response = await PostApi(API_PATH.getBagTypeById, { bag_type_id: id });
        if (response.statusCode === 200) {
            let data = response.data;
            set_initialValues({
                bag_type_id: data.bag_type_id,
                is_active: data.is_active,
                bag_name: data.bag_name,
                max_meal_into_bag: data.max_meal_into_bag,
                bag_price: data.bag_price,
                bag_return_fee: data.bag_return_fee,
                one_time_fee: data.one_time_fee,
                internal_description: data.internal_description,
                is_allow_gift_card: data.is_allow_gift_card,
                is_allow_cart: data.is_allow_cart,
                is_allow_meal_packs: data.is_allow_meal_packs,
                is_allow_wholesale: data.is_allow_wholesale,
                is_allow_weekly_subscription: data.is_allow_weekly_subscription,
            });

            let deliveryRoutesBag = data.delivery_routes_bags?.map(routeBag => {
                return { ...routeBag, is_allow: String(routeBag.is_allow) };
            });
            let pickupPointsBag = data.pickup_points_bags?.map(route_point => {
                return { ...route_point, is_allow: String(route_point.is_allow) };
            });
            set_allow_routes(deliveryRoutesBag)
            set_allow_pickup_points(pickupPointsBag)
        }
        set_load_data(false)
    };

    const GetAllDeliveryRoutes = async () => {
        set_isLoading_routes(true);
        const response = await PostApi(API_PATH.getallDeliveryRoutes, { type: "all", kitchen_location_id: context?.selected_location?.kitchen_location_id });
        if (response.statusCode === 200) {
            set_routes_list(response.data.data_result ?? []);
        }
        set_isLoading_routes(false);
    };

    const GetAllPickupPoints = async () => {
        set_isLoading_routes(true);
        const response = await PostApi(API_PATH.getAllPickupLocation, {
            type: "all",
            is_active: "1",
        });
        if (response.statusCode === 200) {
            set_pickup_point_list(response.data.data_result ?? []);
        }
        set_isLoading_routes(false);
    };

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? "1" : "0";
        runforms.current.setFieldValue(e.target.id, value);
        document.getElementById(e.target.id).checked = e.target.checked;
    };

    const handleChangeSwitch_points = (event) => {
        const { id, checked } = event.target;
        set_allow_pickup_points((prevAllowPickupPoints) =>
            prevAllowPickupPoints.map((point) => {
                if (point.pickup_location_id === id) {
                    return {
                        ...point,
                        is_allow: checked ? '1' : '0',
                    };
                }
                return point;
            })
        );
    };

    const handleChangeSwitch_routes = (event) => {
        const { id, checked } = event.target;
        set_allow_routes((prevAllow_route) =>
            prevAllow_route.map((route) => {
                if (route.delivery_route_id === id) {
                    return {
                        ...route,
                        is_allow: checked ? '1' : '0',
                    };
                }
                return route;
            })
        );
    };

    const handleSubmitForm = () => {
        document.getElementById('bag-types-submit').click();
    };

    const handleSubmit = async (formData, actions) => {
        if (edit_data) {
            formData.delivery_routes_bags = allow_routes.map(({ route_name, ...rest }) => rest);
            formData.pickup_location_bags = allow_pickup_points.map(({ pickup_loc_name, ...rest }) => rest);
        } else {
            formData.delivery_routes_bags = allow_routes
            formData.pickup_location_bags = allow_pickup_points
        }
        set_isLoading(true);
        let api_path = '';
        let message = '';

        if (edit_data) {
            api_path = API_PATH.updateBagTypes;
            message = 'Bag type updated successfully';
        } else {
            api_path = API_PATH.addBagTypes;
            message = 'Bag type added successfully';
        }

        if (api_path != '') {
            const response = await PostApi(api_path, formData);
            if (response.statusCode === 200) {
                toast.success(message);
                navigate('/admin/delivery-settings/bag-types');
                set_edit_data(null)
            }
            set_isLoading(false);
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center">
                            <span
                                className="d-flex align-items-center p-0 me-3 cursor-pointer"
                                onClick={() => navigate('/admin/delivery-settings/bag-types')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data ? 'Edit' : 'Add'} Bag Type</h4>
                            <div className="ms-auto">
                                <button type="submit" className="btn btn-success submit-button" onClick={handleSubmitForm}>
                                    {isLoading ? <IconLoader /> : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </div>
                    {load_data ? (
                        <Loader />
                    ) : (
                        <div className="col-12">
                            <Formik
                                innerRef={runforms}
                                enableReinitialize
                                initialValues={initialValues}
                                validationSchema={Yup.object({
                                    bag_name: Yup.string().required('Please Enter Name')
                                })}
                                onSubmit={(values, actions) => {
                                    handleSubmit(values, actions);
                                }}
                            >
                                {(runform) => (
                                    <form onSubmit={runform.handleSubmit}>
                                        <div className="row bg-light py-3 rounded shadow-sm m-2">
                                            <div className="col-md-9 mb-2">
                                                <label>Name</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="bag_name"
                                                        type="text"
                                                        placeholder="Enter Name"
                                                        {...formAttr(runform, 'bag_name')}
                                                    />
                                                    {errorContainer(runform, 'bag_name')}
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <div className="form-check form-switch form-switch-md">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id="is_active"
                                                        defaultChecked={initialValues.is_active == 1}
                                                        onChange={handleChangeSwitch}
                                                    />
                                                    <label className='d-flex align-items-center form-check-label' htmlFor="is_active">
                                                        Is Active?
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label>Max Meals into Bag</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="max_meal_into_bag"
                                                        type="number"
                                                        placeholder="Enter Max Meals into Bag"
                                                        {...formAttr(runform, 'max_meal_into_bag')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label>Price</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="bag_price"
                                                        type="number"
                                                        {...formAttr(runform, 'bag_price')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label>Return Fee</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="bag_return_fee"
                                                        type="number"
                                                        {...formAttr(runform, 'bag_return_fee')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label>One Time Fee</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="one_time_fee"
                                                        type="number"
                                                        {...formAttr(runform, 'one_time_fee')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <label>Internal Description</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="internal_description"
                                                        type="text"
                                                        {...formAttr(runform, 'internal_description')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row bg-light py-3 rounded shadow-sm m-2 px-3">
                                            <span className="heading-main-span mx-0">
                                                Modules allowed
                                            </span>
                                            <div className="row">
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allow_gift_card"
                                                            defaultChecked={initialValues.is_allow_gift_card == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_gift_card">
                                                            Gift Card
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allow_cart"
                                                            defaultChecked={initialValues.is_allow_cart == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_cart">
                                                            À la Carte
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allow_meal_packs"
                                                            defaultChecked={initialValues.is_allow_meal_packs == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_meal_packs">
                                                            Meal Packs
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allow_wholesale"
                                                            defaultChecked={initialValues.is_allow_wholesale == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_wholesale">
                                                            Wholesale
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_allow_weekly_subscription"
                                                            defaultChecked={initialValues.is_allow_weekly_subscription == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="is_allow_weekly_subscription">
                                                            Weekly Subscription
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="heading-main-span mx-0">
                                                Which Pickup Point can use this Bag
                                            </span>
                                            <div className="row">
                                                {isLoading_routes ?
                                                    <SelectLoader /> :
                                                    pickup_point_list.length > 0 && allow_pickup_points.length > 0 &&
                                                    pickup_point_list.map((point) =>
                                                        <div className="col-md-3 mb-2" key={point.pickup_location_id}>
                                                            <div className="form-check form-switch form-switch-md">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id={point.pickup_location_id}
                                                                    onChange={handleChangeSwitch_points}
                                                                    defaultChecked={allow_pickup_points.some((allowPoint) => allowPoint.pickup_location_id === point.pickup_location_id && allowPoint.is_allow == '1')}
                                                                />
                                                                <label className='d-flex align-items-center form-check-label' htmlFor="ttpfitness">
                                                                    {point.pickup_loc_name}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                            <span className="heading-main-span mx-0">
                                                Which Delivery Routes/Methods use this Bag
                                            </span>
                                            <div className="row">
                                                {isLoading_routes ?
                                                    <SelectLoader /> :
                                                    routes_list.length > 0 && allow_routes.length > 0 &&
                                                    routes_list.map((route) =>
                                                        <div className="col-md-3 mb-2" key={route.delivery_route_id}>
                                                            <div className="form-check form-switch form-switch-md">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id={route.delivery_route_id}
                                                                    onChange={handleChangeSwitch_routes}
                                                                    defaultChecked={allow_routes.some((allow_route) => allow_route.delivery_route_id === route.delivery_route_id && allow_route.is_allow == '1')}
                                                                />
                                                                <label className='d-flex align-items-center form-check-label' htmlFor="route1">
                                                                    {route.route_name}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>

                                        <div className="d-none">
                                            <button type="submit" id="bag-types-submit">
                                                Submit
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </Formik>
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
}
