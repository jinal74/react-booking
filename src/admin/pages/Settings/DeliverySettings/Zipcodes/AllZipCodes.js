import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Tables/CustDataTable';
import { useEffect } from 'react';
import Loader from '../../../../Loader/Loader';
import { API_PATH } from '../../../../constants/const';
import { PostApi } from '../../../../../services/ApiService';
import { useContext } from 'react';
import EditListModalsInSetting from '../common/EditListModalsInSetting';
import { toast } from 'react-toastify';
import { SettingsStore } from '../../../../context/SettingsContext';

export default function AllZipCodes() {
    const navigate = useNavigate();
    const context = useContext(SettingsStore);

    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [state_list, set_state_list] = useState([]);
    const [oneState, setOneState] = useState(context.oneState);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'zip_code',
        order: 1,
        selected_row: [],
        checkbox: true,
        unique_field: 'delivery_zipcode_id',
    });
    const [country, set_country] = useState({ data: null, show: false });
    const [delivery_price, set_delivery_price] = useState({ data: null, show: false });
    const [tax_percentage, set_tax_percentage] = useState({ data: null, show: false });
    const [allow_to, set_allow_to] = useState({ data: null, show: false });
    const [delete_zipcode, set_delete_zipcode] = useState({ data: null, show: false });

    useEffect(() => {
        GetAllDeliveryState();
    }, []);

    useEffect(() => {
        if (oneState?.delivery_state_id && context?.selected_location) {
            GetAllZipCodes(options);
        }
    }, [oneState, context?.selected_location]);

    const GetAllDeliveryState = async () => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getallDeliveryStates, { type: "all" });
        if (response.statusCode === 200) {
            set_state_list(response.data.data_result ?? []);
            if (!context.oneState) {
                setOneState(response.data.data_result[0])
            }
        }
        set_isLoading(false);
    };

    const GetAllZipCodes = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getallDeliveryZipcode, {
            delivery_state_id: oneState?.delivery_state_id,
            zip_code: option.search,
            sort_by: option.sort,
            is_ascending: option.order,
            offset: option.page + 1,
            limit: option.sizePerPage,
            type: "page",
            kitchen_location_id: context?.selected_location?.kitchen_location_id
        });
        if (response.statusCode === 200) {
            set_data(response.data.data_result ?? []);
            set_options({ ...option, totalCount: response.data?.data_count ?? 0 });
        } else {
            set_data([])
            set_options({ ...option, totalCount: 0 })
        }
        set_isLoading(false);
    };

    const columns = [
        {
            name: 'Zip Code',
            column: 'zip_code',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className='text-success cursor-pointer' onClick={() => handleRowClick(data[i])}>
                            {data[i].zip_code}
                        </div>
                    );
                },
            },
        },
        {
            name: 'Country',
            column: 'country',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span onClick={() => set_country({ data: data[i], show: true })} className={`${data[i].country === 'cursor-pointer' ? 'text-danger cursor-pointer' : 'cursor-pointer'}`}>
                            <span className='dotted-underline'>{data[i].country !== '' ? data[i].country : 'Empty'}</span>
                        </span>
                    );
                },
            },
        },
        {
            name: 'Transporter',
            column: 'route_name',
            options: {
                sort: true,
            },
        },
        {
            name: 'Price',
            column: 'delivery_price',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span onClick={() => set_delivery_price({ data: data[i], show: true })} className='cursor-pointer'><span className='dotted-underline'>{data[i].delivery_price}</span></span>
                    );
                },
            },
        },
        {
            name: 'Tax (%)',
            column: 'tax_percentage',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span onClick={() => set_tax_percentage({ data: data[i], show: true })} className='cursor-pointer'><span className='dotted-underline'>{data[i].tax_percentage}</span></span>
                    );
                },
            },
        },
        {
            name: 'Allow To?',
            column: 'modules_allowed',
            options: {
                sort: false,
                CustomBodyRender: (data, i) => {
                    let allowed = [];
                    if (data[i].allow_gift_card == 1) allowed.push('Gift Card');
                    if (data[i].allow_cart == 1) allowed.push('À la Carte');
                    if (data[i].allow_meal_packs == 1) allowed.push('Meal Packs');
                    if (data[i].allow_subscription_creation == 1) allowed.push('Subscription Creation');
                    if (data[i].allow_weekly_subscription == 1) allowed.push('Weekly Subscription');
                    return <div onClick={() => set_allow_to({ data: data[i], show: true })} className='cursor-pointer'>
                        {allowed.length > 0 ? allowed.map((item, index) => {
                            if (index == (allowed.length - 1)) return <div key={index}><span className='dotted-underline'>{item}</span></div>;
                            else return <div key={index}><span className='dotted-underline'>{item + ','}</span></div>;
                        }) : <div>-</div>}
                    </div>;
                },
            },
        },
    ];

    const handleRowClick = (data) => {
        navigate(`/admin/delivery-settings/edit-zipcodes/${data.delivery_zipcode_id}`);
    };

    const tableCallBack = (option) => {
        if (option.selected_row?.length !== options.selected_row?.length) set_options(option);
        else GetAllZipCodes(option);
    };

    const handleChangeState = (state) => {
        set_options({ ...options, page: 0 })
        setOneState(state)
        context.setOneState(state)
    };

    const handleSubmit = async (formData, actions, updatedData) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.updateDeliveryZipcode, formData);

        if (response.statusCode === 200) {
            let temp = [...data];
            let index = data.findIndex((f) => f.delivery_zipcode_id === formData.delivery_zipcode_id);
            let obj = temp[index];
            Object.assign(obj, formData);
            temp.splice(index, 1, obj);
            set_data(temp);
            toast.success('Zipcode updated successfully');
            actions.resetForm();
        }
        set_isLoading(false);
    };

    const handleDeleteShow = async () => {
        set_delete_zipcode({ data: options.selected_row, show: true })
    };

    const handleDelete = async () => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.deleteDeliveryZipcode, { delivery_zipcode_id: options.selected_row });
        if (response.statusCode === 200) {
            GetAllZipCodes({ ...options, selected_row: [] });
            toast.success('Zipcode deleted successfully');
        }
        set_isLoading(false);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <h4 className="font-size-18 mb-4">Zip Codes for <bdi className='text-info'>{context?.selected_location?.kitchen_loc_name}</bdi></h4>
                    <div className='col-6'>
                        <div className='zipcodes-bx-cls' onClick={() => navigate('/admin/delivery-settings/requested-zipcodes')}>
                            <span>
                                <i className='bx bxs-rectangle fs-4 align-middle me-3'></i>
                                Requested Zip Codes
                            </span>
                            <i className='bx bx-right-arrow-alt fs-2 right-arrow-cls'></i>
                        </div>
                    </div>
                    <div className='col-6'>
                        <div className='zipcodes-bx-cls'>
                            <span className=''>
                                <i className='bx bxs-bell-ring fs-4 align-middle me-3'></i>
                                Requested Zip Code Updates
                            </span>
                            <i className='bx bx-right-arrow-alt fs-2 right-arrow-cls'></i>
                        </div>
                    </div>

                    <div className='text-end mt-2'>
                        <div className="d-flex justify-content-end">
                            {options.selected_row.length > 0 && (
                                <button
                                    className="btn btn-danger d-flex align-items-center me-3"
                                    onClick={() => handleDeleteShow()}
                                >
                                    <i className="bx bxs-trash me-2"></i>Delete
                                </button>

                            )}
                            {/* <button type="button" className="btn btn-dark ">
                                <i className='bx bxs-file-plus fs-5 align-middle me-1'></i>
                                Upload Zipcodes
                            </button> */}
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="top-trending-custom-check mb-3 d-flex suggestions-box">
                            {state_list.map((state) =>
                                <label className="cust-chk-bx-soc p-0" key={state.delivery_state_id}>
                                    <input type="radio" value={state.delivery_state_id} id={state.delivery_state_id} name="privet" defaultChecked={state.delivery_state_id === oneState?.delivery_state_id} onChange={() => handleChangeState(state)} />
                                    <span className="cust-trend-chkbox">
                                        {state.state_name}
                                    </span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                <div className='zipcodes-main-cls'>
                    <div className='d-flex align-items-center justify-content-between custom-table-top pb-0'>
                        <div>
                            <input
                                type="checkbox"
                                className="form-check-input me-1"
                                id="select_all"
                            />
                            <label className='form-check-label' htmlFor="select_all">
                                Select all zipcodes in {oneState?.state_name}?
                            </label>
                        </div>
                        <button className='btn btn-dark' onClick={() => navigate(`/admin/delivery-settings/add-zipcodes`)}>
                            Add zipcode in {oneState?.state_name}
                        </button>
                    </div>

                    {isLoading ? (
                        <Loader />
                    ) : (
                        <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                    )}
                </div>

                <EditListModalsInSetting
                    states={{
                        country,
                        delivery_price,
                        tax_percentage,
                        allow_to,
                        delete_zipcode,
                        set_country,
                        set_delivery_price,
                        set_tax_percentage,
                        set_allow_to,
                        set_delete_zipcode,
                    }}
                    functions={{ handleSubmit, handleDelete }}
                />
            </div>
        </React.Fragment>
    );
}