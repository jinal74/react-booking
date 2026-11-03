import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../Tables/CustDataTable';
import { useEffect } from 'react';
import Loader from '../../../Loader/Loader';
import { PostApi } from '../../../../services/ApiService';
import { API_PATH } from '../../../constants/const';
import { useContext } from 'react';
import { SettingsStore } from '../../../context/SettingsContext';

export default function CouponsList() {
    const navigate = useNavigate();
    const context = useContext(SettingsStore);
    const [activeTab, setActiveTab] = useState(context.coupons_status ?? '1');
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'coupon_name',
        order: 1,
    });

    useEffect(() => {
        GetAllCoupons(options);
    }, [activeTab]);

    const GetAllCoupons = async (option) => {
        setIsLoading(true);
        const response = await PostApi(API_PATH.getAllCoupons, {
            search_name: option.search,
            sort_by: option.sort,
            is_ascending: option.order,
            offset: option.page + 1,
            limit: option.sizePerPage,
            type: "page",
            is_active: parseInt(activeTab),
            current_date: new Date().toLocaleDateString('en-CA')
        });
        if (response.statusCode === 200) {
            setData(response.data.data_result ?? []);
            setOptions({ ...option, totalCount: response.data?.data_count ?? 0 });
        } else {
            setData([])
            setOptions({ ...option, totalCount: 0 })
        }
        setIsLoading(false);
    };

    const columns = [
        {
            name: 'Name',
            column: 'coupon_name',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <>
                            <div className='mb-1'>{data[i].coupon_name}</div>
                            <span className='meal-recipe-tag ms-0 bg-secondary'>Exists: {data[i].coupon_exists}</span>
                        </>
                    );
                },
            },
        },
        {
            name: 'Code',
            column: 'coupon_code',
            options: {
                sort: true,
            },
        },
        {
            name: 'End of Coupon Date',
            column: 'end_date',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    let formattedDate = data[i].end_date ?? '';
                    if (data[i].end_date && data[i].end_date !== '') {
                        const inputDate = new Date(data[i].end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
                        formattedDate = inputDate;
                    }
                    return (
                        <div>{formattedDate}</div>
                    );
                },
            },
        },
        {
            name: 'Unique Code?',
            column: 'is_limited_one_use_per_customer',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div>{data[i].is_limited_one_use_per_customer === 1 ? 'Yes' : 'No'}</div>
                    );
                },
            },
        },
        {
            name: 'Fixed Amount',
            column: 'coupon_value',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div>{`${(data[i].coupon_type === 1 || data[i].coupon_type === 3) ? '$' : ''} ${data[i].coupon_value} ${(data[i].coupon_type === 1 || data[i].coupon_type === 3) ? '' : '%'}`}</div>
                    );
                },
            },
        },
        {
            name: 'Type',
            column: 'coupon_type',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div>{(data[i].coupon_type === 1 || data[i].coupon_type === 3) ? 'Value' : 'Percentage'}</div>
                    );
                },
            },
        },
        {
            name: 'Active?',
            column: 'is_active',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div>{data[i].is_active === 1 ? 'Yes' : 'No'}</div>
                    );
                },
            },
        },
        {
            name: 'Action',
            column: 'coupon_id',
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
        navigate(`/admin/edit-coupons/${data.coupon_id}`);
    };

    const tableCallBack = (option) => {
        GetAllCoupons(option);
    };

    const toggle = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            context.setcoupons_status(tab)
        }
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Coupons</h4>
                            <div className="page-title-right">
                                <Link to="/admin/add-coupons">
                                    <button type="button" className="btn btn-primary">
                                        + Add new
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

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
