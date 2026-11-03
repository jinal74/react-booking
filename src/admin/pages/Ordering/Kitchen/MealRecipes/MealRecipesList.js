import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../Tables/CustDataTable';
import Placeholder from '../../../../assets/images/placeholder.png';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal } from 'reactstrap';
import { Rating } from 'react-simple-star-rating';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH } from '../../../../constants/const';
import { IconLoader } from '../../../../Loader/IconLoader';
import { toast } from 'react-toastify';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function MealRecipesList() {
    const navigate = useNavigate();

    const [elementHeight, setElementHeight] = useState(null);
    const [toggleFilter, setToggleFilter] = useState(false);
    const [data, set_data] = useState([]);
    const [isDownloadLoading, set_isDownloadLoading] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [toggle_drp, set_toggle_drp] = useState('');
    const [portion_sizes, set_portion_sizes] = useState([]);
    const [meal_categories, set_meal_categories] = useState([]);
    const [selected_meal_categories, set_selected_meal_categories] = useState([]);
    const [selected_portion_sizes, set_selected_portion_sizes] = useState([]);
    const [show_deleted, set_show_deleted] = useState(0);
    const [csv_show, set_csv_show] = useState(false);
    const [file, setFile] = useState(null);
    const [isLastData, setIsLastData] = useState(true);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 5,
        search: '',
        selected_row: [],
        checkbox: true,
        sort: 'display_name',
        order: 1,
        is_sizePerPage: false,
        unique_field: 'ingredient_id',
    });

    useEffect(() => {
        GetAllMealRecipes({ ...options, page: 0, selected_row: [] });
    }, [show_deleted, selected_meal_categories, selected_portion_sizes])

    useEffect(() => {
        GetAllPortionSize();
        GetMealCategories();
    }, []);

    useEffect(() => {
        const element = document.getElementById('scroll-table-data');
        if (element && data.length > 0) {
            const height = element.clientHeight;
            setElementHeight(height);
        }
    }, [data]);

    const GetAllMealRecipes = async (option, type) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getMealRecipes, {
            display_name: option.search,
            sort_by: option.sort,
            is_ascending: option.order,
            show_deleted: show_deleted,
            meal_category_id: selected_meal_categories,
            portion_size_id: selected_portion_sizes,
            offset: option.page + 1,
            limit: option.sizePerPage,
        });
        if (response.statusCode === 200) {
            if (type == 'scroll') set_data([...data, ...(response.data ?? [])]);
            else set_data(response.data ?? []);
            setIsLastData(true);
            if (response.data?.length < 5) setIsLastData(false);
        } else {
            if (type != 'scroll') set_data([]);
            setIsLastData(false);
        }
        set_options(option);
        set_isLoading(false);
    };

    const GetAllPortionSize = async () => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getActivePortionSize);
        if (response.statusCode === 200) {
            set_portion_sizes(response.data ?? []);
        }
        set_isLoading(false);
    };

    const GetMealCategories = async () => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getMealCategories, { type: 'all' });
        if (response.statusCode === 200) {
            const result = response.data.data_result?.reduce((acc, obj) => {
                const key = obj.meal_category_group_name;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);
                return acc;
            }, {});
            set_meal_categories(result);
        }
        set_isLoading(false);
    };

    const columns = [
        {
            name: '',
            column: 'ingredient_image',
            options: {
                className: 'align-top',
                CustomBodyRender: (data, i) => {
                    return (
                        <div>
                            <img
                                src={data[i].ingredient_image ?? Placeholder}
                                className="object-fit-cover border rounded"
                                height="80"
                                width="80"
                                onError={(e) => e.target.src = Placeholder}
                            />
                        </div>
                    );
                },
            },
        },
        {
            name: 'Meal Recipes',
            column: 'display_name',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    let temp_allergens = data[i].allergens !== '' ? data[i].allergens?.split(',') ?? [] : [];
                    let allergens = [];
                    for (let i = 0; i < temp_allergens?.length; i++) {
                        let obj = temp_allergens[i]?.split(':');
                        allergens.push(obj[1]);
                    }

                    let temp_dislikes = data[i].dislikes !== '' ? data[i].dislikes?.split(',') ?? [] : [];
                    let dislikes = [];
                    for (let i = 0; i < temp_dislikes?.length; i++) {
                        let obj = temp_dislikes[i]?.split(':');
                        dislikes.push(obj[1]);
                    }

                    let temp_mealcategories = data[i].mealcategories !== '' ? data[i].mealcategories?.split(',') ?? [] : [];
                    let mealcategories = [];
                    for (let i = 0; i < Object.keys(meal_categories)?.length; i++) {
                        let obj = Object.keys(meal_categories)[i]
                        for (let j = 0; j < meal_categories[obj].length; j++) {
                            const element = meal_categories[obj][j];
                            if (temp_mealcategories?.includes(element.meal_category_id)) mealcategories.push(element);
                        }
                    }

                    let portion_prices = [];
                    let temp_arr = data[i]?.portion_prices !== '' ? data[i]?.portion_prices?.split(',') : [];
                    for (let i = 0; i < temp_arr.length; i++) {
                        let temp = temp_arr[i]?.split(':');
                        portion_prices.push({
                            id: temp[0],
                            name: temp[1],
                            upgrade_price: temp[2],
                            regular_price: temp[3]
                        })
                    }

                    return (
                        <div className='row'>
                            <div className='col-xl-8 col-lg-12 mb-md-2'>
                                <div className='d-flex align-items-center flex-wrap'>
                                    <p className="fw-medium mb-0 me-2 cursor-pointer" onClick={() => handleRowClick(data[i].ingredient_id, 'edit')}>{data[i].display_name}</p>
                                    {data[i]?.should_show_ratings == 1 &&
                                        <span className='me-2'>
                                            <Rating
                                                size={25}
                                                initialValue={Number(data[i].rate ?? 0) / 5}
                                                readonly
                                                allowFraction
                                                iconsCount={1}
                                                fillClassName="text-warning"
                                                onClick={function noRefCheck() { }}
                                            />
                                            <bdi className="text-warning">{data[i].rate ?? 0}/5</bdi> (0)
                                        </span>
                                    }
                                    <div className='circle-18'>
                                        {
                                            mealcategories?.map((f) => (
                                                <span className="text-light bg-dark" title={f.meal_category_name} key={f.meal_category_id}>
                                                    {f.meal_category_name?.[0]}
                                                </span>
                                            ))
                                        }
                                    </div>
                                    {data[i]?.is_new == 1 &&
                                        <span className="meal-recipe-tag">New Item</span>
                                    }
                                </div>
                                <div className='d-flex align-items-end justify-content-between'>
                                    <div>
                                        <div className="grey-txt-light-cls">Allergens: {allergens?.length > 0 ? allergens?.join(', ') : ''}</div>
                                        <div className="grey-txt-light-cls">Dislikes: {dislikes?.length > 0 ? dislikes?.join(', ') : ''}</div>
                                    </div>
                                    <div className=''>
                                        <Dropdown
                                            className="text-end"
                                            isOpen={toggle_drp === data[i].ingredient_id}
                                            toggle={() => set_toggle_drp(toggle_drp === '' ? data[i].ingredient_id : '')}
                                        >
                                            <DropdownToggle className="bg-transparent border-0 pe-0 pb-0">
                                                <i className="bx bx-dots-vertical-rounded text-dark fs-4" />
                                            </DropdownToggle>
                                            <DropdownMenu className="shadow-sm">
                                                <DropdownItem onClick={() => handleRowClick(data[i].ingredient_id, 'edit')}>
                                                    <i className="bx bxs-pencil me-2"></i>Edit
                                                </DropdownItem>
                                                <DropdownItem onClick={() => handleRowClick(data[i].ingredient_id, 'add')}>
                                                    <i className="bx bxs-copy me-2"></i>Clone
                                                </DropdownItem>
                                                <DropdownItem onClick={() => handleDelete(data[i].ingredient_id, data[i]?.is_deleted == 0 ? 1 : 0)}>
                                                    {data[i]?.is_deleted == 0 ? (
                                                        <>
                                                            <i className="bx bxs-trash me-2"></i>Delete
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bx bxs-archive-out me-2 fs-5"></i> Restore
                                                        </>
                                                    )}
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                            <div className='col-xl-4 col-lg-12 d-none d-md-block border-start p-2'>
                                <div className="mb-2 d-flex align-items-center">
                                    <div className="grey-txt-light-cls col-6">Regular</div>
                                    <div className="col-6">
                                        ${data[i]?.regular_meal_prep_price}
                                        {/* <p className="grey-txt-light-cls mb-0">($0.00)</p> */}
                                    </div>
                                    {/* <div className="col-3">
                                        <bdi className="text-success">$10.50</bdi>
                                        <p className="grey-txt-light-cls mb-0">(100.00%)</p>
                                    </div> */}
                                </div>
                                {
                                    portion_prices?.map((f, index) => {
                                        let price = Number(f.upgrade_price) + Number(data[i]?.regular_meal_prep_price);
                                        return (
                                            <div className="mt-2 d-flex align-items-center flex-wrap" key={index}>
                                                <div className="grey-txt-light-cls col-6">{f.name}</div>
                                                <div className="col-6">
                                                    ${price?.toFixed(2)}
                                                    {/* <p className="grey-txt-light-cls mb-0">($0.00)</p> */}
                                                </div>
                                                {/* <div className="col-3">
                                                    <bdi className="text-success">$12.50</bdi>
                                                    <p className="grey-txt-light-cls mb-0">(100.00%)</p>
                                                </div> */}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    );
                },
            },
        },
    ];

    const handleRowClick = (data, page) => {
        if (page == 'add') navigate(`/admin/kitchen-ordering/add-meal-recipes`, { state: { data } });
        else navigate(`/admin/kitchen-ordering/edit-meal-recipes/${data}`);
    };

    const tableCallBack = (option) => {
        if (option.selected_row !== options.selected_row) set_options(option);
        else GetAllMealRecipes({ ...option, selected_row: [] });
    };

    const handleDelete = async (id, deleted) => {
        let ingredient_id = id ? [id] : options.selected_row;
        let is_delete = deleted || show_deleted == 0 ? '1' : '0';
        set_isLoading(true);
        const response = await PostApi(API_PATH.deleteIngredient, {
            ingredient_id,
            is_delete,
        });
        if (response.statusCode === 200) {
            let option = { ...options, selected_row: [] };
            let filtered = data?.filter((f) => !ingredient_id.includes(f.ingredient_id));
            set_data(filtered);
            document.getElementById('all-checked').checked = false;
            ingredient_id?.forEach((f) => document.getElementById(f).checked = false);
            set_options(option)
            set_isLoading(false);
        }
        toast.success(response.data);
    };

    const handleSelectFilterCat = (e, def) => {
        if (e.target.name === 'show_deleted') {
            set_show_deleted(e.target.checked ? 1 : 0);
        } else if (e.target.name === 'meal_category_id') {
            let temp_selected = [...selected_meal_categories];
            if (e.target.checked) temp_selected.push(e.target.value);
            else {
                let index = temp_selected?.findIndex((f) => f === e.target.value);
                temp_selected.splice(index, 1);
            }
            set_selected_meal_categories(temp_selected);
        } else {
            let temp_selected = [...selected_portion_sizes];
            if (e.target.checked && def != 1) temp_selected.push(e.target.value);
            else {
                let index = temp_selected?.findIndex((f) => f === e.target.value);
                if (index != -1) temp_selected?.splice(index, 1);
            }
            set_selected_portion_sizes(temp_selected);
        }
        set_options({ ...options, page: 0, selected_row: [] });
    };

    const handleSorting = (e) => {
        let option = JSON.parse(e.target.value);
        GetAllMealRecipes({ ...options, ...option, page: 0 });
    };

    const handleOnChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        if (file) {
            let formData = new FormData();
            formData.append('csvFile', file);

            const response = await PostApi(API_PATH.uploadMealRecipeCSV, formData);
            if (response) {
                toast.success(response.data);
                GetAllMealRecipes(options);
                set_csv_show(false);
            } else {
                toast.error(response.data);
            }
            setFile(null);
        } else {
            toast.error('Please upload file');
        }
    };

    const handleDownload = async () => {
        set_isDownloadLoading(true);
        const response = await PostApi(API_PATH.downLoadMealRecipeCSV);
        if (response.statusCode === 200) {
            const blob = new Blob([response.data], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'meal-recipe.csv';
            link.click();
        }
        set_csv_show(false);
        set_isDownloadLoading(false);
    }

    return (
        <React.Fragment>
            <div className="page-content meal-recipe-main">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18 col-6">Meal Recipes</h4>
                            <div className="col-6 text-end">
                                <Link to="/admin/kitchen-ordering/add-meal-recipes">
                                    <button type="button" className="btn btn-primary">
                                        + Add New Meal
                                    </button>
                                </Link>
                                <button type="button" className="btn btn-transparent border-primary text-primary ms-2" onClick={() => set_csv_show(true)}>
                                    <i className='bx bxs-file-plus me-1 fs-5 align-middle'></i>
                                    <span>Upload Meals</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-sm-12 filter-light rounded shadow-sm mb-3">
                        <div className="my-3">
                            <div className='d-flex align-items-center justify-content-between'>
                                <h5 className="font-size-14 mb-0">Filter Preferences</h5>
                                <div className='d-block d-lg-none' onClick={() => setToggleFilter(!toggleFilter)}>
                                    <i className='bx bx-filter fs-2'></i>
                                </div>
                            </div>
                            <div className={`${toggleFilter ? '' : 'd-none'} d-lg-block`}>
                                <div>
                                    <span className="bg-light d-block rounded ps-2 py-2 my-3">General</span>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="show_deleted"
                                            id="meal-recipes-cat-delete"
                                            onChange={handleSelectFilterCat}
                                        />
                                        <label className="form-check-label" htmlFor="meal-recipes-cat-delete">
                                            Show Inactive Meals
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <span className="bg-light d-block rounded ps-2 py-2 my-3">Portions</span>
                                    {portion_sizes?.map((item) => (
                                        <div key={item.portion_size_id} className="form-check form-check-end mb-1">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                value={item.portion_size_id}
                                                id={`portion-sizes-${item.portion_size_id}`}
                                                onChange={(e) => handleSelectFilterCat(e, item.is_default)}
                                                name="portion_size_id"
                                            />
                                            <label className="form-check-label" htmlFor={`portion-sizes-${item.portion_size_id}`}>
                                                {item.portion_size_name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    {Object.keys(meal_categories)?.map((name, index) => (
                                        <React.Fragment key={index}>
                                            <span className="bg-light d-block rounded ps-2 py-2 my-3">{name}</span>
                                            {meal_categories[name]?.map((item) => (
                                                <div className="form-check form-check-end mb-1" key={item.meal_category_id}>
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        value={item.meal_category_id}
                                                        id={item.meal_category_id}
                                                        onChange={handleSelectFilterCat}
                                                        name="meal_category_id"
                                                    />
                                                    <label className="form-check-label" htmlFor={item.meal_category_id}>
                                                        {item.meal_category_name}
                                                    </label>
                                                </div>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-9 col-sm-12">
                        <div id='scroll-table-data' style={{ height: elementHeight - 10, overflowY: 'scroll' }}>
                            <div className="d-flex align-items-center">
                                <div>
                                    <select
                                        className="form-select"
                                        onChange={handleSorting}
                                        value={JSON.stringify({ order: options.order, sort: options.sort })}
                                    >
                                        <option value={JSON.stringify({ order: 1, sort: 'display_name' })}>Sort Alphabeticaly A-Z</option>
                                        <option value={JSON.stringify({ order: 0, sort: 'display_name' })}>Sort Alphabeticaly Z-A</option>
                                    </select>
                                </div>
                                {options.selected_row?.length > 0 && (
                                    <div>
                                        <button className={`${options.show_header ? 'delete-btn-tbl' : 'ms-2'} btn ${show_deleted == 0 ? 'btn-danger' : 'btn-success'} d-flex align-items-center`} onClick={() => handleDelete()}>
                                            {show_deleted == 0 ? (
                                                <>
                                                    <i className="bx bxs-trash me-2"></i>Delete
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bx bx-archive-out fs-5 me-2"></i>Restore
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <InfiniteScroll
                                dataLength={data.length}
                                next={() => isLastData && GetAllMealRecipes({ ...options, page: options.page + 1 }, 'scroll')}
                                hasMore={true}
                                loader={isLoading && <IconLoader />}
                                scrollableTarget='scroll-table-data'
                            >
                                <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                            </InfiniteScroll>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={csv_show} centered className="modal">
                <div className="modal-header align-items-center">
                    <h5 className="modal-title mt-0">UPLOAD MEALS</h5>
                    <button
                        type="button"
                        onClick={() => {
                            set_csv_show(false);
                        }}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body text-center">
                    <p>Please make sure that the file matches the current template and is on <bdi className='text-danger'>.csv</bdi> format.</p>
                    <button type='button' className='btn btn-dark mx-auto d-block mb-2 w-50 py-3' onClick={handleDownload}>
                        {
                            isDownloadLoading ? <IconLoader /> :
                                <>
                                    <i className='bx bxs-download align-middle fs-5 me-1'></i>
                                    Download Template
                                </>
                        }
                    </button>
                    <div className='upload-btn-cls'>
                        <div className="upload-file-dash-new position-relative w-50 mx-auto">
                            <div className="file-selecter text-center position-relative">
                                <div className="file-area position-relative">
                                    <div className="file-dummy">
                                        {
                                            file ?
                                                <div className='d-flex justify-content-between align-items-center w-100 px-2'>
                                                    {file.name}
                                                    <span className='cursor-pointer' onClick={() => setFile(null)}>
                                                        <i className="mdi mdi-close fs-5" />
                                                    </span>
                                                </div> :
                                                <>
                                                    <input
                                                        type="file"
                                                        name="csv"
                                                        accept=".csv"
                                                        onChange={handleOnChange}
                                                    />
                                                    <div className="file-upload-content text-success fw-bold mb-2">
                                                        <i className='bx bxs-cloud-upload align-middle me-1 fs-3'></i>
                                                        Upload Meals
                                                    </div>
                                                    <span>Drag a file here or browse for a file to upload.</span>
                                                </>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='modal-footer upld-mls-btn p-0'>
                    <button className='col-6 border-end' onClick={() => set_csv_show(false)}>
                        Cancel
                    </button>
                    <button className='col-6' onClick={(e) => handleOnSubmit(e)}>
                        Import Meals
                    </button>
                </div>
            </Modal>
        </React.Fragment >
    );
}
