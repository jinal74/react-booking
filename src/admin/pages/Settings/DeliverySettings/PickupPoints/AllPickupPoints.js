import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../../Tables/CustDataTable';
import { useEffect } from 'react';
import Loader from '../../../../Loader/Loader';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH } from '../../../../constants/const';
import { SettingsStore } from '../../../../context/SettingsContext';

export default function AllPickupPoints() {
    const navigate = useNavigate();
    const location = useLocation();
    const context = useContext(SettingsStore);

    const [activeTab, set_activeTab] = useState(context.pickup_loc_status);
    const [kitchen_loc, set_kitchen_loc] = useState({});
    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'pickup_loc_name',
        order: 1,
    });

    useEffect(() => {
        if (location?.state?.selected_location) {
            set_kitchen_loc(context.selected_location)
            set_options({ ...options, page: 0 })
        }
    }, [context.selected_location]);

    useEffect(() => {
        if (context.selected_location) {
            GetAllPickupPoints(options);
        }
    }, [context.selected_location, kitchen_loc, activeTab]);

    const GetAllPickupPoints = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getAllPickupLocation, {
            kitchen_location_id: context?.selected_location?.kitchen_location_id,
            pickup_loc_name: option.search,
            sort_by: option.sort,
            is_ascending: option.order,
            offset: option.page + 1,
            limit: option.sizePerPage,
            type: "page",
            is_active: activeTab,
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
            name: 'Name',
            column: 'pickup_loc_name',
            options: {
                className: "align-top",
                sort: true,
                // CustomBodyRender: (data, i) => {
                //     let tag = data[i].name.split(' ').map(word => word.charAt(0)).join('')
                //     return (
                //         <div>
                //             <span className="border border-dark rounded px-2 py-1 me-1">
                //                 {tag}
                //             </span>
                //             {data[i].name}
                //         </div>
                //     );
                // },
            },
        },
        {
            name: 'Location',
            column: 'location',
            options: {
                className: "align-top",
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span>{data[i].pickup_address + ", " + data[i].zipcode + " " + data[i].city}</span>
                    );
                },
            },
        },
        {
            name: 'Modules allowed',
            column: 'modules_allowed',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    let allowed = [];
                    if (data[i].is_allow_giftcard == 1) allowed.push('Gift Card');
                    if (data[i].is_allow_cart == 1) allowed.push('À la Carte');
                    if (data[i].is_allow_mealpacks == 1) allowed.push('Meal Packs');
                    if (data[i].is_allow_subscription_creation == 1) allowed.push('Subscription Creation');
                    if (data[i].is_allow_weekly_subscription == 1) allowed.push('Weekly Subscription');
                    return <>
                        {allowed.map((item, index) => {
                            if (index == (allowed.length - 1)) return <div key={index}>{item}</div>;
                            else return <div key={index}>{item + ','}</div>;
                        })}
                    </>;
                },
            },
        },
        {
            name: 'Active?',
            column: 'is_active',
            options: {
                className: "align-top",
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span>{data[i].is_active == 1 ? 'Yes' : 'No'}</span>
                    );
                },
            },
        },
        {
            name: 'Action',
            column: 'id',
            options: {
                className: "align-top text-center",
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

    const handleRowClick = (data) => {
        navigate(`/admin/delivery-settings/edit-pickup-points/${data.pickup_location_id}`);
    };

    const tableCallBack = (option) => {
        GetAllPickupPoints(option);
    };

    const toggle = (tab) => {
        if (activeTab !== tab) {
            set_activeTab(tab);
            context.setpickup_loc_status(tab)
        }
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Pickup Locations for <span className='text-info' style={{ fontWeight: "800", fontSize: "17px" }}>{context.selected_location?.kitchen_loc_name}</span></h4>
                            <div className="page-title-right">
                                <button type="button" className="btn btn-primary" onClick={() => navigate(`/admin/delivery-settings/add-pickup-points`)}>
                                    + Add new
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* <div className='purchase-pickup-cls mb-4'>
                    You have 1 active pickup location(s), to get additional please contact us at support@sprwt.io. We charge $10 per pickup location per month.
                    <button className='btn btn-success ms-1'>Click here to buy</button>
                </div> */}

                <div className='d-flex align-items-center mt-2'>
                    <div className={activeTab == '1' ? 'active' : ''} onClick={() => toggle('1')}>
                        <button className={`btn ${activeTab == '1' ? 'btn-success' : 'border-success text-success'}`}>Active</button>
                    </div>
                    <div className={activeTab == '0' ? 'active' : ''} onClick={() => toggle('0')}>
                        <button className={`btn ms-2 ${activeTab == '0' ? 'btn-success' : 'border-success text-success'}`}>Inactive</button>
                    </div>
                </div>

                {isLoading ? (
                    <Loader />
                ) : (
                    <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                )}
            </div>
        </React.Fragment>
    );
}
