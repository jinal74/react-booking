import React, { useEffect, useState } from 'react';
import { Modal, Tooltip } from 'reactstrap';
import DataTable from '../../../Tables/CustDataTable';
import { API_PATH } from '../../../../constants/const';
import { PostApi } from '../../../../../services/ApiService';
import Loader from '../../../../Loader/Loader';
import { useNavigate } from 'react-router-dom';
import EditListModals from '../common/EditListModals';
import { toast } from 'react-toastify';
import { FixedDecimal } from '../../../../../helpers/func_helper';
import { SelectLoader } from '../../../../Loader/IconLoader';

export default function MealPricesList() {
    const navigate = useNavigate();
    const [modal_show, set_modal_show] = useState(false);
    const [meal_prices, set_meal_prices] = useState({
        is_by_val: "1",
        regular_meal_prep_price: 0,
        regular_meal_surcharge: 0,
        regular_price: 0,
        meal_portion_prices: null
    });
    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [isLoadingPortion, set_isLoadingPortion] = useState(false);
    const [regular_portions, set_regular_portions] = useState({ data: null, show: false, title: '', field_name: '' });
    const [other_portions, set_other_portions] = useState({ data: null, show: false, title: '', field_name: '', key: '' });
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        selected_row: [],
        checkbox: true,
        sort: 'display_name',
        order: 0,
        unique_field: 'ingredient_id',
    });
    const [tooltipOpen, setTooltipOpen] = useState('');

    useEffect(() => {
        GetAllMealPrices(options);
        GetAllMealPricesColumn();
    }, []);

    const [columns, set_column] = useState([
        {
            name: 'Meal',
            column: 'display_name',
            options: {
                className: 'text-start',
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className='d-flex align-items-center'>
                            <div className='text-success cursor-pointer me-1' onClick={() => handleRowClick(data[i])}>{data[i].display_name}</div>
                            {data[i]?.is_chef_fav == 1 && <i className='bx bxs-bookmark text-danger fs-5' title='Chef'></i>}
                            {data[i]?.is_new == 1 &&
                                <div title='New Item'>
                                    <svg height="15" fill="#ff8501" width="11" viewBox="0 0 384 512"><path d="M173.8 5.5c11-7.3 25.4-7.3 36.4 0L228 17.2c6 3.9 13 5.8 20.1 5.4l21.3-1.3c13.2-.8 25.6 6.4 31.5 18.2l9.6 19.1c3.2 6.4 8.4 11.5 14.7 14.7L344.5 83c11.8 5.9 19 18.3 18.2 31.5l-1.3 21.3c-.4 7.1 1.5 14.2 5.4 20.1l11.8 17.8c7.3 11 7.3 25.4 0 36.4L366.8 228c-3.9 6-5.8 13-5.4 20.1l1.3 21.3c.8 13.2-6.4 25.6-18.2 31.5l-19.1 9.6c-6.4 3.2-11.5 8.4-14.7 14.7L301 344.5c-5.9 11.8-18.3 19-31.5 18.2l-21.3-1.3c-7.1-.4-14.2 1.5-20.1 5.4l-17.8 11.8c-11 7.3-25.4 7.3-36.4 0L156 366.8c-6-3.9-13-5.8-20.1-5.4l-21.3 1.3c-13.2 .8-25.6-6.4-31.5-18.2l-9.6-19.1c-3.2-6.4-8.4-11.5-14.7-14.7L39.5 301c-11.8-5.9-19-18.3-18.2-31.5l1.3-21.3c.4-7.1-1.5-14.2-5.4-20.1L5.5 210.2c-7.3-11-7.3-25.4 0-36.4L17.2 156c3.9-6 5.8-13 5.4-20.1l-1.3-21.3c-.8-13.2 6.4-25.6 18.2-31.5l19.1-9.6C65 70.2 70.2 65 73.4 58.6L83 39.5c5.9-11.8 18.3-19 31.5-18.2l21.3 1.3c7.1 .4 14.2-1.5 20.1-5.4L173.8 5.5zM272 192a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM1.3 441.8L44.4 339.3c.2 .1 .3 .2 .4 .4l9.6 19.1c11.7 23.2 36 37.3 62 35.8l21.3-1.3c.2 0 .5 0 .7 .2l17.8 11.8c5.1 3.3 10.5 5.9 16.1 7.7l-37.6 89.3c-2.3 5.5-7.4 9.2-13.3 9.7s-11.6-2.2-14.8-7.2L74.4 455.5l-56.1 8.3c-5.7 .8-11.4-1.5-15-6s-4.3-10.7-2.1-16zm248 60.4L211.7 413c5.6-1.8 11-4.3 16.1-7.7l17.8-11.8c.2-.1 .4-.2 .7-.2l21.3 1.3c26 1.5 50.3-12.6 62-35.8l9.6-19.1c.1-.2 .2-.3 .4-.4l43.2 102.5c2.2 5.3 1.4 11.4-2.1 16s-9.3 6.9-15 6l-56.1-8.3-32.2 49.2c-3.2 5-8.9 7.7-14.8 7.2s-11-4.3-13.3-9.7z" /></svg>
                                </div>
                            }
                        </div>
                    );
                },
            }
        },
        {
            name: 'Regular Selling Price',
            column: 'regular_meal_prep_price',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div>
                            <span className='cursor-pointer' onClick={() => handleOpenRegularModal(data[i], true, 'Regular Selling Price', 'regular_meal_prep_price')}>
                                <span className='dotted-underline'>{FixedDecimal(data[i].regular_meal_prep_price)}</span>
                            </span><br />
                            <bdi className='fw-light'>($0.00)</bdi>
                        </div>
                    );
                },
            }
        },
        {
            name: 'Regular Surcharge',
            column: 'regular_meal_surcharge',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span className='cursor-pointer' onClick={() => handleOpenRegularModal(data[i], true, 'Regular Surcharge', 'regular_meal_surcharge')}>
                            <span className='dotted-underline'>{FixedDecimal(data[i].regular_meal_surcharge)}</span>
                        </span>
                    );
                },
            }
        },
        {
            name: 'Regular Regular Price',
            column: 'regular_price',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span className='cursor-pointer' onClick={() => handleOpenRegularModal(data[i], true, 'Regular Regular Price', 'regular_price')}>
                            <span className='dotted-underline'>{FixedDecimal(data[i].regular_price)}</span>
                        </span>
                    );
                },
            }
        },
    ]);

    const GetAllMealPricesColumn = async () => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getMealPortionPriceColumn);
        if (response.statusCode === 200) {
            let column_obj = response.data?.[0]?.[0] ?? [];
            let temp_arr = [...columns];

            Object.keys(column_obj)?.forEach((item) => {
                temp_arr.push({
                    name: column_obj[item]?.split(':')?.[2],
                    column: item,
                    options: {
                        sort: true,
                        CustomBodyRender: (data, i) => {
                            return (
                                <div>
                                    <span className='cursor-pointer' onClick={() => handleOpenOtherModal(data[i], true, column_obj[item]?.split(':')?.[2], column_obj[item]?.split(':')?.[1], column_obj[item]?.split(':')?.[0], item)}>
                                        <span className='dotted-underline'>{FixedDecimal(data[i][item])}</span>
                                    </span><br />
                                    {column_obj[item]?.includes('upgrade') && <bdi className='fw-light'>($0.00)</bdi>}
                                </div>
                            );
                        },
                    },
                })
            })
            set_column(temp_arr)
        }
        set_isLoading(false);
    };

    const GetAllPortionSize = async () => {
        set_isLoadingPortion(true);
        const response = await PostApi(API_PATH.getActivePortionSize);
        if (response.statusCode === 200) {
            let meal_price = { ...meal_prices };
            let temp_data = response.data?.filter((f) => f.is_default != 1)
                ?.map((f) => ({
                    ...f,
                    upgrade_price: 0,
                    surcharge: 0
                }))

            meal_price['meal_portion_prices'] = temp_data ?? [];
            set_meal_prices(meal_price);
        }
        set_isLoadingPortion(false);
    };

    const GetAllMealPrices = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getMealPortionPrice, {
            offset: option.page + 1,
            limit: option.sizePerPage,
            search_text: option.search,
            sort_by: option.sort,
            is_ascending: option.order?.toString()
        });
        if (response.statusCode === 200) {
            set_data(response.data?.data_result?.[0]);
            set_options({ ...option, totalCount: response.data?.data_count });
        }
        set_isLoading(false);
    };

    const handleChangePortionPrices = (e, value, index) => {
        let main_obj = { ...meal_prices };
        let temp_arr = [...main_obj.meal_portion_prices];
        let temp_obj = temp_arr[index];
        Object.assign(temp_obj, { [e.target.name]: value });
        temp_arr.splice(index, 1, temp_obj);
        main_obj.meal_portion_prices = temp_arr;
        set_meal_prices(main_obj);
    }

    const handleChange = (e, value) => {
        set_meal_prices({ ...meal_prices, [e.target.name]: value ?? e.target.value })
    }

    const toggle = (key) => {
        setTooltipOpen(tooltipOpen == key ? '' : key);
    }

    const handleRowClick = (data) => {
        navigate(`/admin/kitchen-ordering/edit-meal-recipes/${data.ingredient_id}`);
    };

    const tableCallBack = (option) => {
        if (option.selected_row !== options.selected_row) set_options(option);
        else GetAllMealPrices(option);
    };

    const handleBulkEditOpen = () => {
        if (options.selected_row?.length > 0) {
            set_modal_show(true);
            if (!meal_prices?.meal_portion_prices) GetAllPortionSize();
        }
    }

    const handleOpenRegularModal = (data, show, title, field_name) => {
        set_regular_portions({ data, show, title, field_name })
    }

    const handleOpenOtherModal = (item, show, title, field_name, portion_size_id, key) => {
        let data = { ...item, portion_size_id }
        set_other_portions({ data, show, title, field_name, key })
    }

    const handleSubmit = async (formData, type) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.editMealPortionPrice, formData);
        if (response.statusCode === 200) {
            let temp = [...data];
            let index = data.findIndex((f) => f.ingredient_id === formData.ingredient_id);
            let obj = temp[index];
            let form_data = formData;
            if (type === 'other') form_data = { [`${formData.portion_size_id}_${formData.surcharge ? 'surcharge' : 'upgrade'}`]: formData.surcharge ?? formData.upgrade_price }
            Object.assign(obj, form_data);
            temp.splice(index, 1, obj);
            set_data(temp);

            toast.success('Meal Prices updated successfully');
        }
        set_isLoading(false);
    };

    const handleUpdateBulk = async () => {
        let data = {
            ...meal_prices,
            ingredientIds: options.selected_row,
            meal_portion_prices: meal_prices.meal_portion_prices?.map((f) => ({
                portion_size_id: f.portion_size_id,
                upgrade_price: f.upgrade_price,
                surcharge: f.surcharge
            }))
        }
        set_isLoading(true);
        const response = await PostApi(API_PATH.editBulkMealPortionPrice, data);
        if (response.statusCode === 200) {
            GetAllMealPrices({ ...options, selected_row: [] });
            set_meal_prices({
                is_by_val: "1",
                regular_meal_prep_price: 0,
                regular_meal_surcharge: 0,
                regular_price: 0,
                meal_portion_prices: null
            })
            toast.success('Meal Prices updated successfully');
            set_modal_show(false);
        }
        set_isLoading(false);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Meal Prices</h4>
                            <div className="page-title-right" id='Tooltip_bulk_edit_btn'>
                                {options.selected_row?.length > 0 && <span className='me-2'>{options.selected_row?.length} Meal{options.selected_row?.length !== 1 && 's'} Selected</span>}
                                <button type="button" className="btn btn-success" onClick={handleBulkEditOpen}>
                                    Bulk Edit Pricing
                                </button>
                            </div>
                            {
                                options.selected_row?.length == 0 &&
                                <Tooltip
                                    className='bulk-edit-btn'
                                    isOpen={tooltipOpen == 'bulk_edit_btn'}
                                    placement={'left'}
                                    target='Tooltip_bulk_edit_btn'
                                    toggle={() => toggle('bulk_edit_btn')}
                                >
                                    Please select at least 1 option to bulk edit.
                                </Tooltip>
                            }
                        </div>
                    </div>
                </div>
                <div className='meal-price-table'>
                    {isLoading ? (
                        <Loader />
                    ) : (
                        <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                    )}
                </div>
            </div>

            <Modal isOpen={modal_show} className='modal-lg'>
                <div className="modal-header border-0 pb-0">
                    <h5 className="modal-title mt-0">Edit prices for the selected meals</h5>
                    <button
                        type="button"
                        onClick={() => set_modal_show(false)}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body meal-price-list">
                    <p>
                        Edit the fields below that you want to alter for the selected rows. These edits will update all the current data with the newly inputted data.
                    </p>
                    <div>
                        <span className="heading-main-span mx-0">
                            Config
                        </span>
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <p className='m-0'>How would you like to Increase or Decrease<br /> the prices?</p>
                            </div>
                            <div className="col-md-6" onChange={handleChange}>
                                <div className="form-check mb-2">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="is_by_val"
                                        id="by_value"
                                        defaultChecked={meal_prices?.is_by_val === "1"}
                                        value={"1"}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="by_value"
                                    >
                                        By Value ($)
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="is_by_val"
                                        id="by_percentage"
                                        defaultChecked={meal_prices?.is_by_val === "0"}
                                        value={"0"}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="by_percentage"
                                    >
                                        By Percentage %
                                    </label>
                                </div>
                            </div>
                        </div>
                        <span className="heading-main-span mx-0">
                            Normal Prices
                        </span>
                        <div className="row">
                            <div className="col-md-4">
                                <label>Regular Selling Price</label>
                                <div>
                                    <input
                                        className="form-control"
                                        name="regular_meal_prep_price"
                                        type="number"
                                        placeholder="Enter Regular Selling Price"
                                        onChange={(e) => handleChange(e, Number(e.target.value === '' ? 0 : e.target.value).toString())}
                                        value={meal_prices?.regular_meal_prep_price}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label>Regular Surcharge</label>
                                <div>
                                    <input
                                        className="form-control"
                                        name="regular_meal_surcharge"
                                        type="number"
                                        placeholder="Enter Regular Surcharge"
                                        onChange={(e) => handleChange(e, Number(e.target.value === '' ? 0 : e.target.value).toString())}
                                        value={meal_prices?.regular_meal_surcharge}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label>Regular Original Price</label>
                                <div>
                                    <input
                                        className="form-control"
                                        name="regular_price"
                                        type="number"
                                        placeholder="Enter Regular Original Price"
                                        onChange={(e) => handleChange(e, Number(e.target.value === '' ? 0 : e.target.value).toString())}
                                        value={meal_prices?.regular_price}
                                    />
                                </div>
                            </div>
                        </div>
                        <span className="heading-main-span mx-0">
                            Portion Prices
                        </span>
                        <div className='text-center'>
                            {
                                isLoadingPortion ?
                                    <SelectLoader /> :
                                    <table className='w-100'>
                                        <thead className='border-bottom'>
                                            <tr>
                                                <th></th>
                                                <th className='px-1'>
                                                    <label className='d-flex align-items-centers'>Upgrade</label>
                                                </th>
                                                <th className='px-1'>
                                                    <label className='d-flex align-items-center'>Surcharge</label>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                meal_prices?.meal_portion_prices?.map((item, i) => {
                                                    return (
                                                        <tr key={item.portion_size_id}>
                                                            <td>
                                                                {item.portion_size_name}
                                                            </td>
                                                            <td className='p-1'>
                                                                <input
                                                                    className="form-control"
                                                                    name="upgrade_price"
                                                                    type="number"
                                                                    placeholder="Enter Upgrade Price"
                                                                    onChange={(e) => handleChangePortionPrices(e, Number(e.target.value === '' ? 0 : e.target.value).toString(), i)}
                                                                    value={item?.upgrade_price}
                                                                />
                                                            </td>
                                                            <td className='p-1'>
                                                                <input
                                                                    className="form-control"
                                                                    name="surcharge"
                                                                    type="number"
                                                                    placeholder="Enter selling price"
                                                                    onChange={(e) => handleChangePortionPrices(e, Number(e.target.value === '' ? 0 : e.target.value).toString(), i)}
                                                                    value={item?.surcharge}
                                                                />
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                            }
                        </div>
                    </div>
                </div>
                <div className='modal-footer upld-mls-btn p-0'>
                    <button type='button' className='col-6 border-end' onClick={() => set_modal_show(false)}>
                        Cancel
                    </button>
                    <button type='button' className='col-6' onClick={handleUpdateBulk}>
                        Submit
                    </button>
                </div>
            </Modal>

            <EditListModals
                id={'ingredient_id'}
                states={{
                    regular_portions,
                    other_portions,
                    set_other_portions,
                    set_regular_portions
                }}
                functions={{ handleSubmit }}
            />
        </React.Fragment>
    );
}
