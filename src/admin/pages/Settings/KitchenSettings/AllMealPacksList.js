import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "../../Tables/CustDataTable";
import { PostApi } from "../../../../services/ApiService";
import { API_PATH } from "../../../constants/const";
import Loader from "../../../Loader/Loader";

export default function AllMealPacksList() {
    const navigate = useNavigate();
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        sort: "meal_pack_name",
        order: 1,
        search: "",
    });
    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);

    const columns = [
        {
            name: "Name",
            column: "meal_pack_name",
            options: {
                sort: true,
            },
        },
        {
            name: "Number of Meals",
            column: "number_of_meals",
            options: {
                sort: true,
            },
        },
        {
            name: "Selling Price",
            column: "selling_price",
            options: {
                sort: true,
            },
        },
        {
            name: "Regular Price",
            column: "regular_price",
            options: {
                sort: true,
            },
        },
        {
            name: "Status",
            column: "is_active",
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="">
                            {data[i].is_active == 1 ? "ACTIVE" : "DEACTIVE"}
                        </div>
                    );
                },
            },
        },
        {
            name: "Actions",
            column: "id",
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div
                            className="cursor-pointer"
                            onClick={() => handleRowClick(data[i])}
                        >
                            <i className="bx bxs-edit-alt fs-4"></i>
                        </div>
                    );
                },
            },
        },
    ];

    useEffect(() => {
        GetAllMealPackList(options);
    }, []);

    const GetAllMealPackList = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getAllMealPack, {
            type: "page",
            offset: option.page + 1,
            limit: option.sizePerPage,
            sort_by: option.sort,
            is_ascending: option.order,
            meal_pack_name: option.search
        });
        if (response.statusCode === 200) {
            set_data(response.data.data_result ?? []);
            set_options({ ...option, totalCount: response.data?.data_count ?? 0 });
        } else {
            set_data([]);
            set_options({ ...option, totalCount: 0 });
        }
        set_isLoading(false);
    };

    const handleRowClick = (data) => {
        navigate(`/admin/kitchen-settings/edit-meal-packs/${data.meal_pack_id}`);
    };

    const tableCallBack = (option) => {
        GetAllMealPackList(option);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Meal Packs</h4>
                            <div className="page-title-right">
                                <Link to="/admin/kitchen-settings/add-meal-packs">
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
                    <DataTable
                        data={data}
                        options={options}
                        tableCallBack={tableCallBack}
                        columns={columns}
                    />
                )}
            </div>
        </React.Fragment>
    );
}
