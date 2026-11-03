import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../Tables/CustDataTable';
import { API_PATH } from '../../../constants/const';
import { PostApi } from '../../../../services/ApiService';
import Loader from '../../../Loader/Loader';
import { SettingsStore } from '../../../context/SettingsContext';

export default function AllSubscriptionCreation() {
    const navigate = useNavigate();
    const context = useContext(SettingsStore);

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState({
        page: 0,
        totalCount: 3,
        sizePerPage: 10,
        search: '',
    });

    useEffect(() => {
        if (context?.selected_location) GetAllSubscriptionCreation(options);
    }, [context?.selected_location]);

    const GetAllSubscriptionCreation = async (option) => {
        setIsLoading(true);
        const response = await PostApi(API_PATH.getAllSubscriptionPlans, {
            type: 'page',
            offset: option.page + 1,
            limit: option.sizePerPage,
            search_name: option.search,
            kitchen_location_id: context?.selected_location?.kitchen_location_id
        });
        if (response.statusCode === 200) {
            setData(response.data.data_result ?? []);
            setOptions({ ...option, totalCount: response.data?.data_count ?? 0 });
        } else {
            setData([]);
            setOptions({ ...option, totalCount: 0 });
        }
        setIsLoading(false);
    };

    const columns = [
        {
            name: 'Name',
            column: 'plan_nick_name',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="">
                            {data[i].plan_nick_name} (Sort: {data[i].display_order})
                        </div>
                    );
                },
            },
        },
        {
            name: 'Week',
            column: 'numbers_of_weeks',
        },
        {
            name: 'Active Subscription',
            column: 'active_subscriptions',
        },
        {
            name: 'Total Subscription',
            column: 'total_subscriptions',
        },
        {
            name: 'Buffer Days to Charge Before Renewal',
            column: 'better_days_before_renew',
        },
        {
            name: 'Status',
            column: 'is_active',
            options: {
                CustomBodyRender: (data, i) => {
                    return <div className="">{data[i].is_active == 1 ? 'Active' : 'Inactive'}</div>;
                },
            },
        },
        {
            name: 'Actions',
            column: 'subscription_plan_id',
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

    const handleRowClick = (data) => {
        navigate(`/admin/kitchen-settings/edit-subscription-creation/${data.subscription_plan_id}`);
    };

    const tableCallBack = (option) => {
        GetAllSubscriptionCreation(option);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Subscription Creation</h4>
                            <div className="page-title-right">
                                <Link to="/admin/kitchen-settings/add-subscription-creation">
                                    <button type="button" className="btn btn-primary ">
                                        + Add new
                                    </button>
                                </Link>
                            </div>
                        </div>
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
