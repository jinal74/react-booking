import React, { useContext, useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../../../helpers/func_helper';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IconLoader, SelectLoader } from '../../../../Loader/IconLoader';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH } from '../../../../constants/const';
import EditListModalsInSetting from '../common/EditListModalsInSetting';
import Loader from '../../../../Loader/Loader';
import { SettingsStore } from '../../../../context/SettingsContext';

export default function AddEditZipCodes() {
    const runforms = useRef();
    const navigate = useNavigate();
    const { id } = useParams();
    const context = useContext(SettingsStore);

    const [load_data, set_load_data] = useState(false);
    const [edit_data, set_edit_data] = useState(false);
    const [is_Delete_Loading, setis_Delete_Loading] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [delete_zipcode, set_delete_zipcode] = useState({ data: null, show: false });
    const [routes_list, set_routes_list] = useState([]);
    const [isLoading_routes, set_isLoading_routes] = useState(false);
    const [initialValues, set_initialValues] = useState({
        state_name: context?.oneState?.state_name ?? '',
        delivery_state_id: context?.oneState?.delivery_state_id ?? '',
        zip_code: '',
        country: '',
        delivery_route_id: '',
        delivery_price: 0,
        tax_percentage: 0,
        allow_gift_card: "1",
        allow_cart: "1",
        allow_meal_packs: "1",
        allow_subscription_creation: "1",
        allow_weekly_subscription: "1",
    });

    useEffect(() => {
        if (context?.selected_location) GetAllDeliveryRoutes();
    }, [context?.selected_location]);

    useEffect(() => {
        if (id) {
            set_edit_data(true)
            GetZipcodeById(id)
        }
    }, [id]);

    const GetZipcodeById = async (id) => {
        set_load_data(true)
        const response = await PostApi(API_PATH.getDeliveryZipcodeById, { delivery_zipcode_id: id });
        if (response.statusCode === 200) {
            set_load_data(false)
            let data = response.data;
            set_initialValues({
                state_name: data.state_name,
                delivery_zipcode_id: data.delivery_zipcode_id,
                delivery_state_id: data.delivery_state_id,
                zip_code: data.zip_code,
                country: data.country,
                delivery_route_id: data.delivery_route_id,
                delivery_price: data.delivery_price,
                tax_percentage: data.tax_percentage,
                allow_gift_card: data.allow_gift_card,
                allow_cart: data.allow_cart,
                allow_meal_packs: data.allow_meal_packs,
                allow_subscription_creation: data.allow_subscription_creation,
                allow_weekly_subscription: data.allow_weekly_subscription,
            });
        } else {
            set_load_data(false)
        }
    };

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? "1" : "0";
        runforms.current.setFieldValue(e.target.id, value);
        document.getElementById(e.target.id).checked = e.target.checked;
    };

    const handleSubmitForm = () => {
        document.getElementById('zipcodes-submit').click();
    };

    const GetAllDeliveryRoutes = async () => {
        set_isLoading_routes(true);
        const response = await PostApi(API_PATH.getallDeliveryRoutes, {
            type: "all",
            kitchen_location_id: context?.selected_location?.kitchen_location_id
        });
        if (response.statusCode === 200) {
            set_routes_list(response.data.data_result ?? []);
        }
        set_isLoading_routes(false);
    };

    const handleSubmit = async (formData, actions) => {
        delete formData.state_name
        set_isLoading(true);
        let api_path = '';
        let message = '';


        if (edit_data) {
            api_path = API_PATH.updateDeliveryZipcode;
            message = 'Zipcode updated successfully';
        } else {
            formData.kitchen_location_id = context?.selected_location?.kitchen_location_id;
            api_path = API_PATH.addDeliveryZipcode;
            message = 'Zipcode added successfully';
        }

        if (api_path != '') {
            const response = await PostApi(api_path, formData);
            if (response.statusCode === 200) {
                toast.success(message);
                navigate('/admin/delivery-settings/zipcodes');
                set_edit_data(null)
            }
            set_isLoading(false);
        }
    };

    const handleBack = () => {
        if (edit_data) {
            navigate(`/admin/delivery-settings/edit-zipcodes/${initialValues?.delivery_zipcode_id}/${initialValues?.zip_code}`, { state: { data: runforms.current.values } });
        } else navigate('/admin/delivery-settings/zipcodes');
    }

    const handleDeleteShow = async () => {
        set_delete_zipcode({ data: "", show: true })
    };

    const handleDelete = async () => {
        setis_Delete_Loading(true);
        const response = await PostApi(API_PATH.deleteDeliveryZipcode, { delivery_zipcode_id: [initialValues?.delivery_zipcode_id] });
        if (response.statusCode === 200) {
            navigate('/admin/delivery-settings/zipcodes');
            toast.success('Zipcode deleted successfully');
            setis_Delete_Loading(false);
        } else {
            setis_Delete_Loading(false);
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
                                onClick={handleBack}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data ? 'Edit' : 'Add'} Zip Codes</h4>
                            <div className="ms-auto">
                                <button type="submit" className="btn btn-success submit-button " onClick={handleSubmitForm}>
                                    {isLoading ? <IconLoader /> : 'Save'}
                                </button>
                                {id &&
                                    <button type="submit" className="btn btn-danger submit-button ms-1" onClick={() => handleDeleteShow()}>
                                        {is_Delete_Loading ? <IconLoader /> : 'Delete'}
                                    </button>
                                }
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
                                    zip_code: Yup.string().required('Please Enter Zipcode')
                                })}
                                onSubmit={(values, actions) => {
                                    handleSubmit(values, actions);
                                }}
                            >
                                {(runform) => (
                                    <form onSubmit={runform.handleSubmit}>
                                        <div className="row bg-light py-3 rounded shadow-sm m-2">
                                            <div className="col-md-3 mb-2">
                                                <label>State</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="state_name"
                                                        type="text"
                                                        readOnly
                                                        disabled
                                                        placeholder="Enter State Name"
                                                        {...formAttr(runform, 'state_name')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label>ZipCode</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="zip_code"
                                                        type="text"
                                                        placeholder="Enter ZipCode"
                                                        {...formAttr(runform, 'zip_code')}
                                                    />
                                                    {errorContainer(runform, 'zip_code')}
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label>Country</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="country"
                                                        type="text"
                                                        placeholder="Country"
                                                        {...formAttr(runform, 'country')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label>Delivery Route</label>
                                                <div>
                                                    {isLoading_routes ? (
                                                        <span className="form-select p-1">
                                                            <SelectLoader />
                                                        </span>
                                                    ) : (
                                                        <select
                                                            className="form-select"
                                                            name="delivery_route_id"
                                                            {...formAttr(runform, 'delivery_route_id')}
                                                        >
                                                            <option value="">
                                                                -- Select --
                                                            </option>
                                                            {routes_list.map((routes) =>
                                                                <option value={routes.delivery_route_id} key={routes.delivery_route_id}>{routes.route_name}</option>
                                                            )}
                                                        </select>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label>Delivery Price</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="delivery_price"
                                                        type="number"
                                                        placeholder='Add cost of delivery'
                                                        {...formAttr(runform, 'delivery_price')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label>Tax Percentage (-1 to use the state tax)</label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        name="tax_percentage"
                                                        type="number"
                                                        {...formAttr(runform, 'tax_percentage')}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <span className="heading-main-span mx-0">
                                                    Allow on
                                                </span>
                                                <div className="row">
                                                    <div className="col-md-3 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="allow_gift_card"
                                                                defaultChecked={initialValues.allow_gift_card == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="allow_gift_card">
                                                                Gift Card
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="allow_cart"
                                                                defaultChecked={initialValues.allow_cart == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="allow_cart">
                                                                À la Carte
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="allow_meal_packs"
                                                                defaultChecked={initialValues.allow_meal_packs == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="allow_meal_packs">
                                                                Meal Packs
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="allow_subscription_creation"
                                                                defaultChecked={initialValues.allow_subscription_creation == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="allow_subscription_creation">
                                                                Subscription Creation
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 mb-2">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="allow_weekly_subscription"
                                                                defaultChecked={initialValues.allow_weekly_subscription == 1}
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className='d-flex align-items-center form-check-label' htmlFor="allow_weekly_subscription">
                                                                Weekly Subscription
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-none">
                                            <button type="submit" id="zipcodes-submit">
                                                Submit
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </Formik>
                        </div>
                    )}
                </div>

                <EditListModalsInSetting
                    states={{
                        delete_zipcode,
                        set_delete_zipcode,
                    }}
                    functions={{ handleDelete }}
                />
            </div>
        </React.Fragment>
    );
}
