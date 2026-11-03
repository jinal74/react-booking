import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../Tables/CustDataTable';
import Loader from '../../../../Loader/Loader';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH } from '../../../../constants/const';

export default function AllBagTypes() {
    const navigate = useNavigate();
    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'bag_name',
        order: 1,
    });

    useEffect(() => {
        GetAllBagTypes(options);
    }, []);

    const GetAllBagTypes = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getAllBagTypes, {
            bag_name: option.search,
            sort_by: option.sort,
            is_ascending: option.order,
            offset: option.page + 1,
            limit: option.sizePerPage,
            type: "page",
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
            column: 'bag_name',
            options: {
                className: "align-top",
                sort: true
            },
        },
        {
            name: 'Modules allowed',
            column: 'modules_allowed',
            options: {
                sort: true,
                className: "align-top",
                CustomBodyRender: (data, i) => {
                    let allowed = [];
                    if (data[i].is_allow_gift_card == 1) allowed.push('Gift Card');
                    if (data[i].is_allow_cart == 1) allowed.push('À la Carte');
                    if (data[i].is_allow_meal_packs == 1) allowed.push('Meal Packs');
                    if (data[i].is_allow_wholesale == 1) allowed.push('Wholesale');
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
            name: 'Pickup Points allowed',
            column: 'pickup_loc_name',
            options: {
                className: "align-top pickup-point-width",
                sort: true,
            },
        },
        // {
        //     name: 'Pickup Points allowed',
        //     column: 'pickup_points_bags',
        //     options: {
        //         className: "align-top",
        //         sort: true,
        //         CustomBodyRender: (data, i) => {
        //             let allowed = [];
        //             data[i].pickup_points_bags.map((p) => p.is_allow == 1 && allowed.push(p.pickup_loc_name))
        //             return <>
        //                 {allowed.map((item, index) => {
        //                     if (index == (allowed.length - 1)) return <div>{item}</div>;
        //                     else return <div>{item + ','}</div>;
        //                 })}
        //             </>;
        //         },
        //     },
        // },
        {
            name: 'Delivery Routes allowed',
            column: 'route_name',
            options: {
                className: "align-top",
                sort: true,
            },
        },
        // {
        //     name: 'Delivery Routes allowed',
        //     column: 'delivery_routes_bags',
        //     options: {
        //         className: "align-top",
        //         sort: true,
        //         CustomBodyRender: (data, i) => {
        //             let allowed = [];
        //             data[i].delivery_routes_bags.map((r) => r.is_allow == 1 && allowed.push(r.route_name))
        //             return <>
        //                 {allowed.map((item, index) => {
        //                     if (index == (allowed.length - 1)) return <div>{item}</div>;
        //                     else return <div>{item + ','}</div>;
        //                 })}
        //             </>;
        //         },
        //     },
        // },
        {
            name: 'Internal Description',
            column: 'internal_description',
            options: {
                className: "align-top",
                sort: true,
            },
        },
        {
            name: 'Status',
            column: 'is_active',
            options: {
                className: "align-top",
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span>{data[i].is_active == 1 ? 'Active' : 'Inactive'}</span>
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
        navigate(`/admin/delivery-settings/edit-bag-types/${data.bag_type_id}`);
    };

    const tableCallBack = (option) => {
        GetAllBagTypes(option);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Bag Types</h4>
                            <div className="page-title-right">
                                <Link to="/admin/delivery-settings/add-bag-types">
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
