import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../Tables/CustDataTable';
import Loader from '../../../../Loader/Loader';
import { API_PATH } from '../../../../constants/const';
import { PostApi } from '../../../../../services/ApiService';
import { SettingsStore } from '../../../../context/SettingsContext';

export default function AllTransporters() {
    const navigate = useNavigate();
    const context = useContext(SettingsStore);

    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'route_name',
        order: 1,
    });

    useEffect(() => {
        if (context?.selected_location) GetAllTransporters(options);
    }, [context?.selected_location]);

    const GetAllTransporters = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getallDeliveryRoutes, {
            route_name: option.search,
            sort_by: option.sort,
            is_ascending: option.order,
            offset: option.page + 1,
            limit: option.sizePerPage,
            type: 'page',
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
            name: 'Name',
            column: 'route_name',
            options: {
                sort: true,
            },
        },
        {
            name: 'Tag',
            column: 'route_tag',
            options: {
                sort: true
            },
        },
        {
            name: 'Is Active',
            column: 'is_active',
            options: {
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
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="cursor-pointer" onClick={() => handleRowClick(data[i], 'edit')}>
                            <i className="bx bxs-edit-alt fs-4"></i>
                        </div>
                    );
                },
            },
        },
    ];

    const handleRowClick = (data) => {
        navigate(`/admin/delivery-settings/edit-transporters/${data.delivery_route_id}`);
    };

    const tableCallBack = (option) => {
        GetAllTransporters(option);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Delivery Routes & Methods ({context?.selected_location?.kitchen_loc_name})</h4>
                            <div className="page-title-right">
                                <Link to="/admin/delivery-settings/add-transporters">
                                    <button type="button" className="btn btn-primary ">
                                        + Add new Delivery Route
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