import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../Tables/CustDataTable';
import Loader from '../../../../Loader/Loader';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH } from '../../../../constants/const';

export default function AllStatesList() {
    const navigate = useNavigate();
    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'state_name',
        order: 1
    });

    useEffect(() => {
        GetAllStates(options);
    }, []);

    const GetAllStates = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getallDeliveryStates, {
            state_name: option.search,
            sort_by: option.sort,
            is_ascending: option.order,
            offset: option.page + 1,
            limit: option.sizePerPage,
            type: 'page',
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
            name: 'State',
            column: 'state_name',
            options: {
                sort: true
            },
        },
        {
            name: 'Abbreviation',
            column: 'abbreviation',
            options: {
                sort: true
            },
        },
        {
            name: 'Country',
            column: 'country',
            options: {
                sort: true
            },
        },
        {
            name: 'Tax',
            column: 'tax',
            options: {
                sort: true
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
        navigate(`/admin/delivery-settings/edit-states/${data.delivery_state_id}`);
    };

    const tableCallBack = (option) => {
        GetAllStates(option);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">States</h4>
                            <div className="page-title-right">
                                <Link to="/admin/delivery-settings/add-states">
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
