import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../Tables/CustDataTable';
import Placeholder from '../../../../assets/images/placeholder.png';
import Loader from '../../../../Loader/Loader';
import { API_PATH } from '../../../../constants/const';
import { PostApi } from '../../../../../services/ApiService';
import EditListModals from '../common/EditListModals';
import { toast } from 'react-toastify';
import { CardImg, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import DataTableGrid from '../../../Tables/DataTableGrid';

export default function IngredientsList() {
    const navigate = useNavigate();
    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [toggle_drp, set_toggle_drp] = useState('');
    const [ingredient_cat, set_ingredient_cat] = useState([]);
    const [selected_ingredient_category, set_selected_ingredient_category] = useState([]);
    const [show_deleted, set_show_deleted] = useState(0);
    const [ingredient_category_id, set_ingredient_category_id] = useState({ data: null, show: false });
    const [base_weight, set_base_weight] = useState({ data: null, show: false });
    const [display_name, set_display_name] = useState({ data: null, show: false });
    const [allergens, set_allergens] = useState({ data: null, show: false });
    const [dislikes, set_dislikes] = useState({ data: null, show: false });
    const [table_view, set_table_view] = useState('list');
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        selected_row: [],
        checkbox: true,
        sort: 'display_name',
        order: 1,
        unique_field: 'ingredient_id',
    });

    useEffect(() => {
        GetIngredientCategories();
    }, []);

    useEffect(() => {
        GetAllIngredients(options);
    }, [show_deleted, selected_ingredient_category]);

    const GetAllIngredients = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getIngredient, {
            display_name: option.search,
            sort_by: option.sort,
            is_ascending: option.order,
            show_deleted: show_deleted,
            ingredient_category_id: selected_ingredient_category,
            offset: option.page + 1,
            limit: option.sizePerPage,
        });
        if (response.statusCode === 200) {
            set_data(response.data.data_result ?? []);
            set_options({ ...option, totalCount: response.data?.data_count ?? 0 });
        } else {
            set_options({ ...option, totalCount: 0 });
            set_data([]);
        }
        set_isLoading(false);
    };

    const GetIngredientCategories = async () => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getIngredientCategory, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            set_ingredient_cat(response.data.data_result ?? []);
        }
        set_isLoading(false);
    };

    const columns = [
        {
            name: '',
            column: 'ingredient_image',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div>
                            <img src={data[i].ingredient_image ?? Placeholder} className="object-fit-cover border rounded" height="50" width="50" />
                        </div>
                    );
                },
            },
        },
        {
            name: 'Ingredients',
            column: 'display_name',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className={`cursor-pointer`}>
                            <div className="mb-1">
                                {data[i]?.base_weight && (
                                    <span
                                        className="bg-warning ingredients-tags me-2"
                                        onClick={() => set_base_weight({ data: data[i], show: true })}
                                    >
                                        <span className='dotted-underline border-white'>{Number(data[i]?.base_weight)?.toFixed() + ' ' + data[i]?.unit_short_name}</span>
                                    </span>
                                )}
                                {data[i]?.ingredient_category_name && (
                                    <span
                                        className="bg-success ingredients-tags"
                                        onClick={() => set_ingredient_category_id({ data: data[i], show: true })}
                                    >
                                        <span className='dotted-underline border-white'>{data[i]?.ingredient_category_name}</span>
                                    </span>
                                )}
                            </div>
                            <div onClick={() => set_display_name({ data: data[i], show: true })}>
                                <span className='dotted-underline'>{data[i].display_name}</span>
                            </div>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Allergens',
            column: 'allergens',
            options: {
                CustomBodyRender: (data, i) => {
                    let temp_allergens = data[i].allergens !== '' ? (data[i].allergens?.split(',') ?? []) : [];
                    let allergens = [];
                    for (let i = 0; i < temp_allergens?.length; i++) {
                        let obj = temp_allergens[i]?.split(':');
                        allergens.push(obj[1]);
                    }
                    return (
                        <div className={`cursor-pointer ${allergens?.length > 0 ? '' : 'text-danger'}`} onClick={() => set_allergens({ data: data[i], show: true })}>
                            <span className='dotted-underline'>{allergens?.length > 0 ? allergens?.join(', ') : 'Empty'}</span>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Dislikes',
            column: 'dislikes',
            options: {
                CustomBodyRender: (data, i) => {
                    let temp_dislikes = data[i].dislikes !== '' ? (data[i].dislikes?.split(',') ?? []) : [];
                    let dislikes = [];
                    for (let i = 0; i < temp_dislikes?.length; i++) {
                        let obj = temp_dislikes[i]?.split(':');
                        dislikes.push(obj[1]);
                    }
                    return (
                        <div className={`cursor-pointer ${dislikes?.length > 0 ? '' : 'text-danger'}`} onClick={() => set_dislikes({ data: data[i], show: true })}>
                            <span className='dotted-underline'>{dislikes?.length > 0 ? dislikes?.join(', ') : 'Empty'}</span>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Actions',
            column: 'ingredient_id',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <Dropdown
                            isOpen={toggle_drp === data[i].ingredient_id}
                            toggle={() => set_toggle_drp(toggle_drp === '' ? data[i].ingredient_id : '')}
                        >
                            <DropdownToggle className="bg-transparent border-0">
                                <i className="bx bx-dots-vertical-rounded text-dark fs-4" />
                            </DropdownToggle>
                            <DropdownMenu className="shadow-sm">
                                <DropdownItem onClick={() => handleRowClick(data[i].ingredient_id, 'edit')}>
                                    <i className="bx bxs-pencil me-2"></i>Edit
                                </DropdownItem>
                                <DropdownItem onClick={() => convertToSubRecipe(data[i].ingredient_id)}>
                                    <i className="bx bx-transfer-alt me-1 fs-5"></i>Convert to Subrecipe
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
                    );
                },
            },
        },
    ];

    const columns_grid = [
        {
            name: '',
            column: 'sub_recipe_image',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div className='w-100'>
                            <CardImg top height="150px" className='object-fit-cover w-100' src={data[i].sub_recipe_image ?? Placeholder} alt="" />
                        </div>
                    );
                },
            },
        },
        {
            name: '',
            column: 'display_name',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className={`cursor-pointer`}>
                            <div onClick={() => set_display_name({ data: data[i], show: true })}>
                                <span className='dotted-underline'>{data[i].display_name}</span>
                            </div>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Category',
            column: 'ingredient_category_name',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className={`cursor-pointer`}>
                            <div className="mb-1">
                                {data[i]?.ingredient_category_name && (
                                    <span
                                        className="bg-success ingredients-tags"
                                        onClick={() => set_ingredient_category_id({ data: data[i], show: true })}
                                    >
                                        <span className='dotted-underline border-white'>{data[i]?.ingredient_category_name}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Base Wight',
            column: 'base_weight',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className={`cursor-pointer`}>
                            <span
                                className="bg-warning ingredients-tags me-2"
                                onClick={() => set_base_weight({ data: data[i], show: true })}
                            >
                                <span className='dotted-underline border-white'>{(Number(data[i]?.base_weight)?.toFixed() ?? 0) + ' ' + (data[i]?.unit_short_name ?? '')}</span>
                            </span>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Allergens',
            column: 'allergens',
            options: {
                CustomBodyRender: (data, i) => {
                    let temp_allergens = data[i].allergens !== '' ? (data[i].allergens?.split(',') ?? []) : [];
                    let allergens = [];
                    for (let i = 0; i < temp_allergens?.length; i++) {
                        let obj = temp_allergens[i]?.split(':');
                        allergens.push(obj[1]);
                    }
                    return (
                        <div className={`cursor-pointer ${allergens?.length > 0 ? '' : 'text-danger'}`} onClick={() => set_allergens({ data: data[i], show: true })}>
                            <span className='dotted-underline'>{allergens?.length > 0 ? allergens?.join(', ') : 'Empty'}</span>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Dislikes',
            column: 'dislikes',
            options: {
                CustomBodyRender: (data, i) => {
                    let temp_dislikes = data[i].dislikes !== '' ? (data[i].dislikes?.split(',') ?? []) : [];
                    let dislikes = [];
                    for (let i = 0; i < temp_dislikes?.length; i++) {
                        let obj = temp_dislikes[i]?.split(':');
                        dislikes.push(obj[1]);
                    }
                    return (
                        <div className={`cursor-pointer ${dislikes?.length > 0 ? '' : 'text-danger'}`} onClick={() => set_dislikes({ data: data[i], show: true })}>
                            <span className='dotted-underline'>{dislikes?.length > 0 ? dislikes?.join(', ') : 'Empty'}</span>
                        </div>
                    );
                },
            },
        },
        {
            name: '',
            column: 'ingredient_id',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <Dropdown
                            isOpen={toggle_drp === data[i].ingredient_id}
                            toggle={() => set_toggle_drp(toggle_drp === '' ? data[i].ingredient_id : '')}
                        >
                            <DropdownToggle className="bg-transparent border-0">
                                <i className="bx bx-dots-vertical-rounded text-dark fs-4" />
                            </DropdownToggle>
                            <DropdownMenu className="shadow-sm">
                                <DropdownItem onClick={() => handleRowClick(data[i].ingredient_id, 'edit')}>
                                    <i className="bx bxs-pencil me-2"></i>Edit
                                </DropdownItem>
                                <DropdownItem onClick={() => convertToSubRecipe(data[i].ingredient_id)}>
                                    <i className="bx bx-transfer-alt me-1 fs-5"></i>Convert to Subrecipe
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
                    );
                },
            },
        },
    ];

    const handleRowClick = (data, page) => {
        if (page == 'add') navigate(`/admin/kitchen-ordering/add-ingredients`, { state: { data } });
        else navigate(`/admin/kitchen-ordering/edit-ingredients/${data}`);
    };

    const tableCallBack = (option) => {
        if (option.selected_row !== options.selected_row) set_options(option);
        else GetAllIngredients({ ...option, selected_row: [] });
    };

    const handleChangeView = (type) => {
        set_table_view(type)
    }

    const handleSorting = (e) => {
        let option = JSON.parse(e.target.value);
        GetAllIngredients({ ...options, ...option })
    }

    const handleDelete = async (id, deleted) => {
        let ingredient_id = id ? [id] : options.selected_row;
        let is_delete = deleted ? deleted : show_deleted == 0 ? '1' : '0';
        set_isLoading(true);
        const response = await PostApi(API_PATH.deleteIngredient, {
            ingredient_id,
            is_delete,
        });
        if (response.statusCode === 200) {
            let option = { ...options, selected_row: [] };
            GetAllIngredients(option);
            toast.success(response.data);
        }
        set_isLoading(false);
    };


    const convertToSubRecipe = async (id) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.convertToSubRecipe, {
            ingredient_id: id,
        });
        if (response.statusCode === 200) {
            GetAllIngredients(options);
            toast.success(response.data);
        }
        set_isLoading(false);
    };

    const handleSelectFilterCat = (e) => {
        if (e.target.name === 'show_deleted') {
            set_show_deleted(e.target.checked ? 1 : 0);
        } else {
            let temp_selected = [...selected_ingredient_category];
            if (e.target.checked) temp_selected.push(e.target.value);
            else {
                let index = temp_selected?.findIndex((f) => f === e.target.value);
                temp_selected.splice(index, 1);
            }
            set_selected_ingredient_category(temp_selected);
        }
        set_options({ ...options, page: 0, selected_row: [] });
    };

    const handleSubmit = async (formData, actions, key) => {
        set_isLoading(true);
        const form_data = new FormData()

        form_data.append('ingredient_id', formData.ingredient_id);
        form_data.append('props', JSON.stringify(formData));

        const response = await PostApi(API_PATH.editIngredient, form_data);
        if (response.statusCode === 200) {
            // let temp = [...data];
            // let index = data.findIndex((f) => f.ingredient_id === formData.ingredient_id);
            // let obj = temp[index];
            // Object.assign(obj, formData);
            // temp.splice(index, 1, obj);
            // set_data(temp);
            GetAllIngredients(options);
            toast.success('Ingredient updated successfully');
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
                            <h4 className="mb-sm-0 font-size-18">Ingredients</h4>
                            <div className="page-title-right">
                                <Link to="/admin/kitchen-ordering/add-ingredients">
                                    <button type="button" className="btn btn-primary">
                                        + Add new
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-sm-12 filter-light rounded shadow-sm">
                        <div className="my-4">
                            <h5 className="font-size-14">Filter Preferences</h5>
                            <div>
                                <span className="bg-light d-block rounded ps-2 py-2 my-3">General</span>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="show_deleted"
                                        id="inredient-cat-delete"
                                        onChange={handleSelectFilterCat}
                                    />
                                    <label className="form-check-label" htmlFor="inredient-cat-delete">
                                        Deleted Ingredients
                                    </label>
                                </div>
                            </div>
                            <div>
                                <span className="bg-light d-block rounded ps-2 py-2 my-3">Categories</span>
                                {ingredient_cat?.map((item, i) => (
                                    <div className="form-check form-check-end mb-1" key={i}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            value={item.ingredient_category_id}
                                            id={`inredient-cat-${i}`}
                                            onChange={handleSelectFilterCat}
                                            name="ingredient_category_id"
                                        />
                                        <label className="form-check-label" htmlFor={`inredient-cat-${i}`}>
                                            {item.ingredient_category_name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-9 col-sm-12">
                        <div className='d-flex align-items-center'>
                            <button
                                className={`btn ${table_view == 'grid' ? 'border-dark bg-light' : 'bg-dark text-light'} me-2 d-flex align-items-center`}
                                onClick={() => handleChangeView('list')}
                            >
                                <i className='bx bx-list-ul fs-5'></i>
                            </button>
                            <button
                                className={`btn ${table_view == 'list' ? 'border-dark bg-light' : 'bg-dark text-light'} me-2 d-flex align-items-center`}
                                onClick={() => handleChangeView('grid')}
                            >
                                <i className='bx bx-grid-alt fs-5'></i>
                            </button>
                            <div>
                                <select className="form-select" onChange={handleSorting} value={JSON.stringify({ order: options.order, sort: options.sort })}>
                                    <option value={JSON.stringify({ order: 1, sort: 'display_name' })}>Sort Alphabeticaly A-Z</option>
                                    <option value={JSON.stringify({ order: 0, sort: 'display_name' })}>Sort Alphabeticaly Z-A</option>
                                </select>
                            </div>
                            {options.selected_row?.length > 0 && (
                                <div className='ms-2'>
                                    <button
                                        className={`${options.show_header ? 'delete-btn-tbl' : ''} btn ${show_deleted == 0 ? 'btn-danger' : 'btn-success'
                                            } d-flex align-items-center`}
                                        onClick={() => handleDelete()}
                                    >
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

                        {isLoading ? (
                            <Loader />
                        ) : (
                            <>{
                                table_view == 'list' ?
                                    <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} /> :
                                    <DataTableGrid data={data} options={options} tableCallBack={tableCallBack} columns={columns_grid} />
                            }</>
                        )}
                    </div>
                </div>

                <EditListModals
                    id={'ingredient_id'}
                    states={{
                        base_weight,
                        ingredient_category_id,
                        display_name,
                        allergens,
                        dislikes,
                        set_base_weight,
                        set_ingredient_category_id,
                        set_display_name,
                        set_allergens,
                        set_dislikes,
                    }}
                    functions={{ handleSubmit }}
                />
            </div>
        </React.Fragment>
    );
}
