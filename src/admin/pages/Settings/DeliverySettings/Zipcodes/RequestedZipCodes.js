import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../Tables/CustDataTable';
import { useEffect } from 'react';
import Select from 'react-select';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH } from '../../../../constants/const';
import { SelectLoader } from '../../../../Loader/IconLoader';

export default function RequestedZipCodes() {
    const navigate = useNavigate();
    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [state_Loading, set_state_Loading] = useState(false);
    const [state_list, set_state_list] = useState([]);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        show_header: false,
    });

    useEffect(() => {
        GetAllDeliveryState();
    }, []);

    const GetAllDeliveryState = async () => {
        set_state_Loading(true);
        const response = await PostApi(API_PATH.getallDeliveryStates, { type: 'all' });
        if (response.statusCode === 200) {
            set_state_list(
                response.data.data_result.map((s) => ({
                    label: s.state_name,
                    value: s.delivery_state_id,
                }))
            );
        }
        set_state_Loading(false);
    };

    const handleSelect = (value) => {
        let val = value.map((m) => m.value);
    };

    const columns = [
        {
            name: 'State',
            column: 'state',
        },
        {
            name: 'Zipcode',
            column: 'zip_code',
        },
        {
            name: 'Counts',
            column: 'counts',
        },
        {
            name: 'Last Query',
            column: 'last_query',
        },
        {
            name: 'First Query',
            column: 'first_query',
        },
    ];

    const tableCallBack = (option) => {
        set_options(option);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center">
                            <span
                                className="d-flex align-items-center p-0 me-3 cursor-pointer"
                                onClick={() => navigate('/admin/delivery-settings/zipcodes')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h3 className="mb-sm-0 font-size-18">Requested zipcodes</h3>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="zipcodes-main-cls">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label>States</label>
                                    <div>
                                        {state_Loading ? (
                                            <span className="form-select p-1">
                                                <SelectLoader />
                                            </span>
                                        ) : (
                                            <Select
                                                name="states"
                                                isMulti={true}
                                                onChange={(val) => handleSelect(val)}
                                                options={state_list}
                                                className="select2-selection"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label>Search</label>
                                    <div className="search-icn-main">
                                        <span className="search-icn">
                                            <i className="bx bx-search-alt-2 fs-4"></i>
                                        </span>
                                        <input className="form-control" name="search" type="search" placeholder="Search" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="zipcodes-main-cls">
                    <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                </div>
            </div>
        </React.Fragment>
    );
}
