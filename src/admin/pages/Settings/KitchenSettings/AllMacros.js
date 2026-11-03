import React, { useEffect, useState } from 'react';
import DataTable from '../../Tables/CustDataTable';
import MacrosModals from './MacrosModals';
import { PostApi } from '../../../../services/ApiService';
import { API_PATH } from '../../../constants/const';
import Loader from '../../../Loader/Loader';
import { toast } from 'react-toastify';

export default function AllMacros() {
    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [on_front, set_on_front] = useState({ data: null, show: false });
    const [on_labels, set_on_labels] = useState({ data: null, show: false });
    const [round_decimal, set_round_decimal] = useState({ data: null, show: false });
    const [macro_color, set_macro_color] = useState({ data: null, show: false });
    const [ingredient_api_id, set_ingredient_api_id] = useState({ data: null, show: false });
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        is_search: false,
        is_sizePerPage: false,
        search: '',
        sort: 'macro_name',
        order: 0,
    });

    useEffect(() => {
        GetAllMacros(options);
    }, []);

    const GetAllMacros = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getAllMacros, {
            type: 'page',
            offset: option.page + 1,
            limit: option.sizePerPage
        });
        if (response.statusCode === 200) {
            set_data(response.data.data_result ?? []);
            set_options({ ...option, totalCount: response.data?.data_count ?? 0 });
        }
        set_isLoading(false);
    };

    const columns = [
        {
            name: 'Macro',
            column: 'macro_name',
            options: {
                // sort: true,
            },
        },
        {
            name: 'Daily Value',
            column: 'daily_value',
            options: {
                // sort: true,
            },
        },
        {
            name: 'Sufix',
            column: 'suffix',
            options: {
                // sort: true,
            },
        },
        {
            name: 'Front',
            column: 'on_front',
            options: {
                // sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="cursor-pointer" onClick={() => set_on_front({ data: data[i], show: true })}>
                            <span className='dotted-underline'>
                                {data[i].on_front == 0
                                    ? 'Hide'
                                    : data[i].on_front == 1
                                        ? 'Show in calories'
                                        : data[i].on_front == 2
                                            ? 'Show as primary information'
                                            : data[i].on_front == 3
                                                ? 'Show as sub information'
                                                : '-'}
                            </span>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Labels',
            column: 'on_labels',
            options: {
                // sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="cursor-pointer" onClick={() => set_on_labels({ data: data[i], show: true })}>
                            <span className='dotted-underline'>
                                {data[i].on_labels == 0
                                    ? 'Hide'
                                    : data[i].on_labels == 1
                                        ? 'Show in calories'
                                        : data[i].on_labels == 2
                                            ? 'Show as primary information'
                                            : data[i].on_labels == 3
                                                ? 'Show as sub information'
                                                : '-'}
                            </span>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Round Decimal',
            column: 'round_decimal',
            options: {
                // sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div
                            className="cursor-pointer"
                            onClick={() => set_round_decimal({ data: data[i], show: true })}
                        >
                            <span className='dotted-underline'>{data[i].round_decimal}</span>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Color',
            column: 'macro_color',
            options: {
                // sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="cursor-pointer" onClick={() => set_macro_color({ data: data[i], show: true })}>
                            <span className='dotted-underline'>{data[i].macro_color}</span>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Ingredients API',
            column: 'ingredient_api_id',
            options: {
                // sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div
                            className="cursor-pointer"
                            onClick={() => set_ingredient_api_id({ data: data[i], show: true })}
                        >
                            <span className={`${data[i].ingredient_api_id ? '' : 'text-danger'} dotted-underline`}>
                                {data[i].ingredient_api_id && data[i].ingredient_api_id !== ''
                                    ? data[i].ingredient_api_id
                                    : 'Empty'}
                            </span>
                        </div>
                    );
                },
            },
        },
    ];

    const tableCallBack = (option) => {
        if (option.page !== options.page) GetAllMacros(option);
        else set_options(option);
    };

    const handleSubmit = async (formData, actions) => {
        set_isLoading(true);

        formData.ingredient_api_id = null;

        const response = await PostApi(API_PATH.editMacros, formData);
        if (response.statusCode === 200) {
            let temp = [...data];
            let index = data.findIndex((f) => f.macro_id === formData.macro_id);
            let obj = temp[index];
            Object.assign(obj, formData);
            temp.splice(index, 1, obj);
            set_data(temp);
            toast.success('Macros updated successfully');
            actions.resetForm();
        }
        set_isLoading(false);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Macros</h4>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <Loader />
                ) : (
                    <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                )}
            </div>

            <MacrosModals
                states={{
                    on_labels,
                    on_front,
                    round_decimal,
                    macro_color,
                    ingredient_api_id,
                    set_on_labels,
                    set_on_front,
                    set_round_decimal,
                    set_macro_color,
                    set_ingredient_api_id,
                }}
                functions={{ handleSubmit }}
            />
        </React.Fragment>
    );
}
