import React, { useEffect, useState } from 'react';
import { Modal, ModalFooter } from 'reactstrap';
import 'react-quill/dist/quill.snow.css';
import DataTable from '../../../Tables/CustDataTable';
import Loader from '../../../../Loader/Loader';
import { API_PATH } from '../../../../constants/const';
import { PostApi } from '../../../../../services/ApiService';
import Placeholder from '../../../../assets/images/placeholder.png';
import { SelectLoader } from '../../../../Loader/IconLoader';

let height = 0;

export default function SubRecipeModal({ states, functions }) {
    const [isLoading_btn, set_isLoading_btn] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [ingredients, set_ingredients] = useState([]);
    const [selected_ingredients, set_selected_ingredients] = useState([]);
    const [selected_ingredient_category, set_selected_ingredient_category] = useState([]);
    const [sub_recipe_show, set_sub_recipe_show] = useState(0);
    const [ingredient_cat, set_ingredient_cat] = useState([]);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 5,
        is_sizePerPage: false,
        search: '',
        selected_row: [],
        show_footer: false,
    });

    useEffect(() => {
        if (states.show_subrecipes.show) GetIngredientCategories();
    }, [states.show_subrecipes.show]);

    useEffect(() => {
        if (states.show_subrecipes.show) {
            if (document.getElementsByClassName('sub-recipe-mdl-main')) {
                const subRecipeMain = document.getElementsByClassName('sub-recipe-mdl-main')?.[0];
                if (subRecipeMain && subRecipeMain.getElementsByClassName('table')) {
                    const table = subRecipeMain.getElementsByClassName('table')?.[0];
                    if (table) {
                        const tableBody = table.querySelector('tbody');
                        if (tableBody) {
                            setTimeout(() => {
                                height += table.scrollHeight;
                                tableBody.scrollTo({
                                    top: height ?? 0,
                                    behavior: 'smooth',
                                });
                            }, 500);
                        }
                    }
                }
            }
        }
    }, [states.show_subrecipes.show, ingredients])

    useEffect(() => {
        let ingredients_arr = states.show_subrecipes.data?.map((f) => f?.ingredient_id ?? f?.sub_recipe_id);
        set_selected_ingredients(ingredients_arr ?? []);
    }, [states.show_subrecipes.data, sub_recipe_show]);

    useEffect(() => {
        set_isLoading(true);
        GetAllIngredients(options);
    }, [selected_ingredient_category, sub_recipe_show]);

    const GetAllIngredients = async (option, type) => {
        let data = {
            display_name: option.search,
            ingredient_category_id: selected_ingredient_category,
            offset: option.page + 1,
            limit: option.sizePerPage,
            ...sub_recipe_show == 1 && { type: 2 },
        };

        const response = await PostApi(API_PATH.getIngredientsSubRecipe, data);
        if (response.statusCode === 200) {
            if (type) {
                set_ingredients([...ingredients, ...response.data.data_result] ?? []);
            } else {
                set_ingredients(response.data.data_result ?? []);
            }
            set_options({ ...option, totalCount: response.data?.data_count });
        } else {
            set_options(option);
            set_ingredients([]);
        }
        set_isLoading(false);
        set_isLoading_btn(false);
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
            name: 'Image',
            column: 'ingredient_image',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div>
                            <img
                                src={data[i].ingredient_image ?? Placeholder}
                                className="object-fit-cover border rounded"
                                height="50"
                                width="50"
                            />
                        </div>
                    );
                },
            },
        },
        {
            name: 'Ingredient',
            column: 'display_name',
        },
        {
            name: 'type',
            column: 'type',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div>
                            {data[i].type == 2 ? 'Sub Recipe' : 'Ingredient'}
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
                    let is_include = selected_ingredients?.includes(data[i]?.ingredient_id ?? data[i]?.sub_recipe_id);
                    return (
                        <div className="d-flex justify-content-end me-4">
                            <span
                                className={`green-pls-icon ${is_include ? 'bg-danger' : 'bg-success'}`}
                                onClick={() => handleAddData(data[i], i)}
                            >
                                {is_include ? '-' : '+'}
                            </span>
                        </div>
                    );
                },
            },
        },
    ];

    const handleAddData = (item, index) => {
        functions.handleSubmitModal(item, index);
    };

    const handleSelectFilterCat = (e) => {
        if (e.target.name === 'sub_recipe') {
            set_sub_recipe_show(e.target.checked ? 1 : 0);
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

    const handleLoadMoreData = () => {
        set_isLoading_btn(true);
        GetAllIngredients({ ...options, page: options.page + 1 }, 1);
    };

    const tableCallBack = (option) => {
        if (option.selected_row !== options.selected_row) set_options(option);
        else {
            set_isLoading(true);
            GetAllIngredients({ ...option, selected_row: [] });
        }
    };

    return (
        <Modal isOpen={states.show_subrecipes.show} centered size="xl" className="modal">
            <div className="modal-header">
                <h5 className="modal-title mt-0">CHOOSE SUB-RECIPE OR INGREDIENT</h5>
                <button
                    type="button"
                    onClick={() => {
                        states.set_show_subrecipes({ data: null, show: false });
                    }}
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div className="modal-body">
                <div className="row">
                    <div className="col-lg-3 col-sm-12 filter-light rounded shadow-sm">
                        <div className="my-4">
                            <h5 className="font-size-14">Filter Preferences</h5>
                            <div>
                                <span className="bg-light d-block rounded ps-2 py-2 my-3">General</span>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="sub_recipe"
                                        id="sub-recipe-select"
                                        defaultChecked={sub_recipe_show == 1}
                                        onChange={handleSelectFilterCat}
                                    />
                                    <label className="form-check-label" htmlFor="sub-recipe-select">
                                        Sub-Recipe
                                    </label>
                                </div>
                            </div>
                            <div>
                                <span className="bg-light d-block rounded ps-2 py-2 my-3">Categories</span>
                                <div className="ingredient-cat-scrl">
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
                    </div>
                    {isLoading ? (
                        <Loader />
                    ) : (
                        <div className="col-md-9">
                            <div className="sub-recipe-mdl-tbl sub-recipe-mdl-main">
                                <DataTable data={ingredients} options={options} tableCallBack={tableCallBack} columns={columns} />
                                {options.page + 1 < Math.ceil(options.totalCount / options.sizePerPage) && (
                                    <button
                                        className="btn btn-white border-secondary w-100 d-flex align-items-center justify-content-center"
                                        onClick={handleLoadMoreData}
                                    >
                                        {isLoading_btn ? (
                                            <SelectLoader />
                                        ) : (
                                            <>
                                                Load More
                                                <i className="bx bx-down-arrow-circle fs-4 ms-2"></i>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ModalFooter className="d-flex justify-content-center">
                <button className="close-btn-white" onClick={() => states.set_show_subrecipes({ data: null, show: false })}>
                    Close
                </button>
            </ModalFooter>
        </Modal>
    );
}
