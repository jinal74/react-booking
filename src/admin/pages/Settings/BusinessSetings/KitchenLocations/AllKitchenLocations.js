import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../Tables/CustDataTable';
import { useEffect } from 'react';
import Loader from '../../../../Loader/Loader';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH } from '../../../../constants/const';
import { useContext } from 'react';
import { SettingsStore } from '../../../../context/SettingsContext';

export default function AllKitchenLocations() {
    const navigate = useNavigate();
    const context = useContext(SettingsStore);
    const [activeTab, set_activeTab] = useState(context.kitchen_loc_status ?? '1');
    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'kitchen_loc_name',
        order: 1,
    });

    useEffect(() => {
        GetAllKitchenLocations(options);
    }, [activeTab]);

    const GetAllKitchenLocations = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getAllKitchenLocation, {
            kitchen_loc_name: option.search,
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

            let loc = response.data.data_result.find((a) => a.kitchen_location_id === context?.selected_location?.kitchen_location_id)
            if (!loc && context.kitchen_loc_status == 1) {
                context.setkitchen_loc_list(response.data.data_result ?? []);
                context.set_selected_location(response.data.data_result[0]);
            } else if (loc && context.kitchen_loc_status == 1) {
                context.setkitchen_loc_list(response.data.data_result ?? []);
                context.set_selected_location(loc);
            } else {
                context.GetAllKitchenLocations();
            }
        } else {
            set_data([])
            set_options({ ...option, totalCount: 0 })
        }
        set_isLoading(false);
    };

    const columns = [
        {
            name: 'Name',
            column: 'kitchen_loc_name',
            options: {
                sort: true,
            },
        },
        {
            name: 'Action',
            column: 'kitchen_location_id',
            options: {
                className: "w-50",
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
        navigate(`/admin/business-settings/edit-kitchen-locations/${data.kitchen_location_id}`);
    };

    const tableCallBack = (option) => {
        GetAllKitchenLocations(option);
    };

    const toggle = (tab) => {
        if (activeTab !== tab) {
            set_activeTab(tab);
            context.setkitchen_loc_status(tab)
        }
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Kitchen Locations</h4>
                            <div className="page-title-right">
                                <Link to="/admin/business-settings/add-kitchen-locations">
                                    <button type="button" className="btn btn-primary ">
                                        + Add new
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className='purchase-pickup-cls mb-4'>
                    You have only 1 active kitchen locations available. To get more please contact Sprwt. We charge $500 per kitchen location per month.
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
