import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../Tables/CustDataTable';
import { API_PATH } from '../../../constants/const';
import { PostApi } from '../../../../services/ApiService';
import { useEffect } from 'react';
import { useContext } from 'react';
import { Context } from '../../../../context/GeneralContext';
import Loader from '../../../Loader/Loader';

export default function AllMealCategories() {
    const navigate = useNavigate();
    const context = useContext(Context);
    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        show_header: false,
    });

    useEffect(() => {
        GetMealCategories(options);
    }, []);

    const GetMealCategories = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getMealCategories, {
            page: option.page,
        });
        if (response.statusCode === 200) {
            set_data(response.data.data_result ?? []);
            set_options({ ...option, totalCount: response.data?.data_count ?? 0 });
        }
        set_isLoading(false);
    };

    const columns = [
        {
            name: 'Category',
            column: 'meal_category_name',
        },
        {
            name: 'Group',
            column: 'meal_category_group_id',
            options: {
                CustomBodyRender: (data, i) => {
                    return <span>{data[i]?.meal_category_group_name}</span>;
                },
            },
        },
        {
            name: 'Show diet categories on profile',
            column: 'show_diet_category_on_profile',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div
                            className={`${data[i].show_diet_category_on_profile == 1 ? 'text-success' : 'text-danger'}`}
                        >
                            {data[i].show_diet_category_on_profile == 1 ? 'YES' : 'No'}
                        </div>
                    );
                },
            },
        },
        {
            name: 'Show on website',
            column: 'show_on_website',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div className={`${data[i].show_on_website == 1 ? 'text-success' : 'text-danger'}`}>
                            {data[i].show_on_website == 1 ? 'YES' : 'No'}
                        </div>
                    );
                },
            },
        },
        {
            name: 'Show in header',
            column: 'show_in_header',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div className={`${data[i].show_in_header == 1 ? 'text-success' : 'text-danger'}`}>
                            {data[i].show_in_header == 1 ? 'YES' : 'No'}
                        </div>
                    );
                },
            },
        },
        {
            name: 'Show on anchor',
            column: 'show_on_anchor',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div className={`${data[i].show_on_anchor == 1 ? 'text-success' : 'text-danger'}`}>
                            {data[i].show_on_anchor == 1 ? 'YES' : 'No'}
                        </div>
                    );
                },
            },
        },
        {
            name: 'Show in labels',
            column: 'show_in_labels',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div className={`${data[i].show_in_labels == 1 ? 'text-success' : 'text-danger'}`}>
                            {data[i].show_in_labels == 1 ? 'YES' : 'No'}
                        </div>
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
                        <div className="cursor-pointer" onClick={() => handleRowClick(data[i])}>
                            <i className="bx bxs-edit-alt fs-4"></i>
                        </div>
                    );
                },
            },
        },
    ];

    const handleRowClick = (data) => {
        navigate(`/admin/kitchen-settings/edit-meal-categories/${data.meal_category_id}`);
    };

    const tableCallBack = (option) => {
        if (option.page !== options.page) GetMealCategories(option);
        else set_options(option);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Meal Categories</h4>
                            <div className="page-title-right">
                                <Link to="/admin/kitchen-settings/add-meal-categories">
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
