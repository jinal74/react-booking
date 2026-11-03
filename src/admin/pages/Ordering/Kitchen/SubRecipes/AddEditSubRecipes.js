import React, { useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FixedDecimal, errorContainer, formAttr, validatePercentage } from '../../../../../helpers/func_helper';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { IconLoader, SelectLoader } from '../../../../Loader/IconLoader';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH } from '../../../../constants/const';
import { toast } from 'react-toastify';
import FileIco from '../../../../assets/images/cloud-arrow-up2.svg';
import SubRecipeModal from './SubRecipeModal';
import DataTable from '../../../Tables/CustDataTable';
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Tooltip } from 'reactstrap';
import Loader from '../../../../Loader/Loader';

export default function AddEditSubRecipes() {
    const runforms = useRef();
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const subRecipeIngredientsRef = useRef(null);
    const subRecipeMacrosRef = useRef(null);

    const [ingredient_macros, set_ingredient_macros] = useState(null);
    const [all_macros, set_all_macros] = useState([]);
    const [is_auto_macro, set_is_auto_macro] = useState(0);
    const [edit_data, set_edit_data] = useState('add');
    const [ingredient_cat, set_ingredient_cat] = useState([]);
    const [ingredient_allergens, set_ingredient_allergens] = useState([]);
    const [ingredient_dislikes, set_ingredient_dislikes] = useState([]);
    const [units, set_units] = useState([]);
    const [selected_allergens, set_selected_allergens] = useState([]);
    const [selected_dislikes, set_selected_dislikes] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [isLoading_units, set_isLoading_units] = useState(false);
    const [isLoading_macros, set_isLoading_macros] = useState(false);
    const [opened_drp_id, set_opened_drp_id] = useState('');
    const [show_subrecipes, set_show_subrecipes] = useState({ data: null, show: false });
    const [initialValues, set_initialValues] = useState({
        sub_recipe_image: null,
        display_name: '',
        internal_name: '',
        ingredient_category_id: '',
        priority_order: '',
        base_weight: 1,
        base_unit_id: '',
        shrink_percentage: '',
        cooking_instructions: '',
        allergen_detail: [],
        dislike_detail: [],
        is_auto_macro: 0,
        sub_recipe_ingredients: [],
    });
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        show_header: false,
        show_footer: false,
    });
    const [tooltipOpen, setTooltipOpen] = useState('');

    const toggle = (key) => {
        setTooltipOpen(tooltipOpen == key ? '' : key);
    };

    useEffect(() => {
        GetIngredientCategories();
        GetAllAllergens();
        GetAllDislikes();
        GetAllUnits();
        GetAllMacros();
        document.getElementById('is_auto_macro').checked = false;
    }, []);

    useEffect(() => {
        const idToSend = id ?? (location?.state?.data ?? '');
        if (is_auto_macro != 1) GetMacrosData(idToSend);
    }, [is_auto_macro]);

    useEffect(() => {
        let data = location?.state?.data;
        if (id) {
            set_edit_data('edit');
            fetchEditData(id);
        } else if (data) {
            fetchEditData(data);
            set_edit_data('add');
        } else {
            set_edit_data('add');
        }
    }, [location]);

    function calculateQuantity(selectedIngredients, macros) {
        return selectedIngredients.reduce((acc, ingredient) => {
            const find = ingredient.macro_details?.find((f) => f.macro_id == macros.macro_id);
            const value = find?.value ?? 0;
            return acc + value;
        }, 0);
    }

    function updateIngredientMacros(selectedIngredients, allMacros) {
        return selectedIngredients.map((ingredient) => {
            const macroDetails = ingredient.macro_values != '' ? (ingredient.macro_values?.split(';') ?? []) : [];
            const macrosArr = macroDetails.map((detail) => {
                const detailedArr = detail.split(':');
                const filtered = allMacros?.find((f) => f.macro_id == detailedArr[0]);
                const finalValue = (ingredient.quantity * detailedArr[1]) / ingredient.base_weight;
                return { ...filtered, value: finalValue };
            });
            return { ...ingredient, macro_details: macrosArr };
        });
    }

    useEffect(() => {
        if (!subRecipeIngredientsRef.current) {
            const selectedIngredients = runforms.current?.values?.sub_recipe_ingredients ?? [];
            const updatedIngredients = updateIngredientMacros(selectedIngredients, all_macros);
            runforms.current.setFieldValue('sub_recipe_ingredients', updatedIngredients);
            subRecipeIngredientsRef.current = true;
        } else {
            subRecipeIngredientsRef.current = false;
        }
    }, [runforms.current?.values?.sub_recipe_ingredients, all_macros, subRecipeIngredientsRef.current]);

    useEffect(() => {
        if (is_auto_macro == 1 && subRecipeMacrosRef.current) {
            const filtered = all_macros.filter((f) => f.on_labels > 0 || f.on_front > 0);
            const tempArr = filtered.map((tempObj) => {
                const quantity = calculateQuantity(runforms.current?.values?.sub_recipe_ingredients ?? [], tempObj);
                return { ...tempObj, quantity };
            });
            set_ingredient_macros(tempArr);
            subRecipeMacrosRef.current = true;
        }
    }, [runforms.current?.values?.sub_recipe_ingredients, is_auto_macro]);

    const columns = [
        {
            name: 'Macro',
            column: 'macro_name',
        },
        {
            name: 'Qnt',
            column: 'quantity',
            options: {
                CustomBodyRender: (data, i) => {
                    if (is_auto_macro != 1) {
                        return (
                            <div className="d-flex align-items-center">
                                <input
                                    className="form-control me-2 qnt-input py-1"
                                    name="quantity"
                                    type="number"
                                    placeholder="Enter Quantity"
                                    onChange={(e) => handleChange(e, data, i)}
                                    value={data[i].quantity ?? 0}
                                />
                                {data[i].suffix}
                            </div>
                        );
                    } else {
                        return (
                            <div className="d-flex align-items-center">
                                {FixedDecimal(data[i].quantity ?? 0)} {data[i].suffix}
                            </div>
                        );
                    }
                },
            },
        },
        {
            name: 'Daily %',
            column: 'dislikes',
            options: {
                CustomBodyRender: (data, i) => {
                    let temp_val = (100 * data[i].quantity) / data[i].daily_value;
                    let Percentage = !isNaN(temp_val) ? (temp_val > 100 ? 100 : temp_val) : 0;
                    let display_pr = !isNaN(temp_val) ? temp_val : 0;

                    const containerStyles = {
                        width: '100px',
                        backgroundColor: '#e0e0de',
                        borderRadius: 50,
                        border: '0.5px solid #e0e0de',
                    };

                    const fillerStyles = {
                        height: '7px',
                        width: `${Math.ceil(Percentage)}%`,
                        backgroundColor: data[i].macro_color,
                        borderRadius: 'inherit',
                        textAlign: 'right',
                    };

                    const labelStyles = {
                        color: 'white',
                        fontWeight: 'bold',
                        padding: '1px',
                    };
                    return (
                        <div className={`cursor-pointer`}>
                            {Math.ceil(display_pr)} %
                            <div style={containerStyles}>
                                <div style={fillerStyles}>
                                    <span style={labelStyles}></span>
                                </div>
                            </div>
                        </div>
                    );
                },
            },
        },
    ];

    const GetMacrosData = async (id) => {
        set_isLoading_macros(true);
        const response = await PostApi(API_PATH.getIngredientMacros, { ...(id !== '' && { ingredient_id: id }) });
        if (response.statusCode === 200) {
            set_ingredient_macros(response.data ?? []);
            subRecipeMacrosRef.current = false;
        }
        set_isLoading_macros(false);
    };

    const GetAllMacros = async () => {
        const response = await PostApi(API_PATH.getAllMacros, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            let data = response.data.data_result ?? [];
            set_all_macros(data);
        }
    };

    const fetchEditData = async (sub_recipe_id) => {
        const response = await PostApi(API_PATH.getSubRecipesById, { sub_recipe_id });
        if (response.statusCode === 200) {
            let data = response.data;
            let sub_recipe = data.sub_recipe[0];

            let temp_allergens = sub_recipe?.allergens !== '' ? sub_recipe?.allergens?.split(',') ?? [] : [];
            let allergens = [];
            for (let i = 0; i < temp_allergens.length; i++) {
                let obj = temp_allergens[i]?.split(':');
                allergens.push({ label: obj[1], value: obj[0] });
            }
            let temp_dislikes = sub_recipe?.dislikes !== '' ? sub_recipe?.dislikes?.split(',') ?? [] : [];
            let dislikes = [];
            for (let i = 0; i < temp_dislikes.length; i++) {
                let obj = temp_dislikes[i]?.split(':');
                dislikes.push({ label: obj[1], value: obj[0] });
            }

            let sub_recipe_image = sub_recipe.sub_recipe_image;
            if (!id) {
                // convert image url to file
                let name = sub_recipe?.sub_recipe_image?.split('/').pop();
                let file_data = await fetch(sub_recipe.sub_recipe_image ?? '')
                    .then(async response => {
                        const contentType = response.headers.get('content-type')
                        const blob = await response.blob()
                        const file = new File([blob], name, { contentType })
                        return file;
                    })
                sub_recipe_image = file_data;
            }

            set_initialValues({
                sub_recipe_id: sub_recipe.sub_recipe_id,
                sub_recipe_image: sub_recipe_image,
                display_name: sub_recipe.display_name,
                internal_name: sub_recipe.internal_name,
                ingredient_category_id: sub_recipe.ingredient_category_id ?? '',
                priority_order: sub_recipe.priority_order ?? '',
                base_weight: sub_recipe.base_weight,
                base_unit_id: sub_recipe.base_unit_id ?? '',
                shrink_percentage: sub_recipe.shrink_percentage,
                cooking_instructions: sub_recipe.cooking_instructions,
                allergen_detail: allergens?.map((f) => f.value),
                dislike_detail: dislikes?.map((f) => f.value),
                is_auto_macro: sub_recipe.is_auto_macro,
                sub_recipe_ingredients: data.ingredients,
            });

            runforms.current.setFieldValue('sub_recipe_ingredients', data.ingredients);
            set_selected_dislikes(dislikes);
            set_selected_allergens(allergens);
            document.getElementById('is_auto_macro').checked = sub_recipe.is_auto_macro == 1;
            set_is_auto_macro(sub_recipe.is_auto_macro);

            if (sub_recipe.sub_recipe_image) {
                let img = document.getElementById('sub-recipes-img');
                img.className = 'w-100 h-100';
                img.src = sub_recipe.sub_recipe_image;
                document.getElementById('upload-image-area').style.display = 'none';
            }
        }
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

    const GetAllAllergens = async () => {
        const response = await PostApi(API_PATH.getIngredientAllergens, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            set_ingredient_allergens(response.data.data_result ?? []);
        }
    };

    const GetAllDislikes = async () => {
        const response = await PostApi(API_PATH.getIngredientDislikes, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            set_ingredient_dislikes(response.data.data_result ?? []);
        }
    };

    const GetAllUnits = async () => {
        set_isLoading_units(true);
        const response = await PostApi(API_PATH.getAllUnits, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            set_units(response.data.data_result ?? []);
        }
        set_isLoading_units(false);
    };

    const handleImg = (file, e) => {
        if (file.length < 0) {
            return;
        }
        if ((file.size / 1024 / 1024).toFixed(2) >= 1) {
            if (e) e.target.value = null;
            toast.error('please select less than 1mb size');
            return;
        } else if (!file.type.includes('image')) {
            if (e) e.target.value = null;
            toast.error('please select valid image');
            return;
        }

        if (file) {
            let img = document.getElementById('sub-recipes-img');
            if (file && file != '') {
                let reader = new FileReader();
                reader.onload = function () {
                    img.className = 'w-100 h-100';
                    img.src = reader.result;
                    runforms.current.setFieldValue('sub_recipe_image', file);
                    document.getElementById('upload-image-area').style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSelect = (value, name) => {
        if (name === 'allergen_detail') set_selected_allergens(value);
        else set_selected_dislikes(value);
        let val = value.map((m) => m.value);
        runforms.current.setFieldValue(name, val);
    };

    const handleChange = (e, data, index) => {
        let temp = [...data];
        let temp_obj = { ...temp[index] };
        Object.assign(temp_obj, { quantity: e.target.value });
        temp.splice(index, 1, temp_obj);
        set_ingredient_macros(temp);
    };

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? 1 : 0;
        runforms.current.setFieldValue(e.target.name, value);
        document.getElementById(e.target.id).checked = e.target.checked;
        if (e.target.name == 'is_auto_macro') {
            set_is_auto_macro(e.target.checked ? 1 : 0);
            subRecipeMacrosRef.current = true;
        }
    };

    const handleChangeQuantity = (e, item, index) => {
        subRecipeMacrosRef.current = true;

        let selected_ingredients = runforms.current?.values?.sub_recipe_ingredients ?? [];
        let temp_arr = [...selected_ingredients];
        let temp_obj = { ...item };

        let macro_details = item.macro_values !== '' ? (item.macro_values?.split(';') ?? []) : [];
        let macros_arr = [];
        for (let i = 0; i < macro_details.length; i++) {
            const detailed_arr = macro_details[i].split(':');
            const filtered = all_macros?.find((f) => f.macro_id == detailed_arr[0]);
            let final_value = (e.target.value * detailed_arr[1]) / item.base_weight;
            macros_arr.push({ ...filtered, value: final_value });
        }
        temp_obj.macro_details = macros_arr;
        temp_obj.quantity = e.target.value;
        temp_arr.splice(index, 1, temp_obj);
        runforms.current.setFieldValue('sub_recipe_ingredients', temp_arr);
        set_show_subrecipes({ ...show_subrecipes, data: temp_arr });
    };

    const handleSubmitModal = (item, i) => {
        subRecipeMacrosRef.current = true;

        let id = item.ingredient_id ? 'ingredient_id' : 'sub_recipe_id';
        let selected_ingredients_ids = runforms.current?.values?.sub_recipe_ingredients?.map((f) => f[id]) ?? [];
        let selected_ingredients = runforms.current?.values?.sub_recipe_ingredients ?? [];
        let macro_details = item.macro_values !== '' ? (item.macro_values?.split(';') ?? []) : [];
        let macros_arr = [];
        for (let i = 0; i < macro_details.length; i++) {
            const temp_arr = macro_details[i].split(':');
            const filtered = all_macros?.find((f) => f.macro_id == temp_arr[0]);
            let final_value = ((item.quantity ?? 1) * temp_arr[1]) / item.base_weight;
            macros_arr.push({ ...filtered, value: final_value });
        }

        let temp_arr = [...selected_ingredients];
        if (selected_ingredients_ids.includes(item[id])) {
            let index = temp_arr?.findIndex((f) => f[id] === item[id]);
            temp_arr.splice(index, 1);
            if (opened_drp_id == item[id]) set_opened_drp_id('');
        } else {
            temp_arr.push({ ...item, quantity: item.quantity ?? 1, macro_details: macros_arr });
        }

        runforms.current.setFieldValue('sub_recipe_ingredients', temp_arr);
        set_show_subrecipes({ ...show_subrecipes, data: temp_arr });
    };

    const handleSubmitForm = () => {
        document.getElementById('sub-recipes-submit').click();
    };

    const handleSubmit = async (formData) => {
        let api_path = '';
        let message = '';

        const form_data = new FormData();
        if (typeof formData.sub_recipe_image !== 'string') {
            form_data.append('file', formData.sub_recipe_image);
            // delete formData.sub_recipe_image;
        }

        formData.macro_detail =
            ingredient_macros.map((f) => ({
                macro_id: f.macro_id,
                quantity: f.quantity ?? 0,
            })) ?? [];

        formData.sub_recipe_ingredients =
            formData.sub_recipe_ingredients?.map((f) => {
                let id = f.ingredient_id ? 'ingredient_id' : 'sub_recipe_id';
                return ({
                    ingredient_id: f[id],
                    quantity: f.quantity,
                    ingredient_type: f.type,
                })
            }) ?? [];

        if (formData.sub_recipe_ingredients?.length > 0) {
            formData.allergen_detail = null
            formData.dislike_detail = null
        }

        if (edit_data == 'edit') {
            api_path = API_PATH.editSubRecipes;
            message = 'Sub Recipe updated successfully';
            form_data.append('sub_recipe_id', formData.sub_recipe_id);
            // delete formData.sub_recipe_id;
        } else {
            api_path = API_PATH.addSubRecipes;
            message = 'Sub Recipe added successfully';
        }

        form_data.append('props', JSON.stringify(formData));

        if (api_path != '') {
            const response = await PostApi(api_path, form_data);
            if (response.statusCode === 200) {
                toast.success(message);
                navigate('/admin/kitchen-ordering/sub-recipes');
                // if (edit_data == 'edit') navigate('/admin/kitchen-ordering/sub-recipes');
                // else navigate(`/admin/kitchen-ordering/edit-sub-recipes/${response.data.sub_recipe_id}`);
            } else {
            }
        }
    };

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
                                onClick={() => navigate('/admin/kitchen-ordering/sub-recipes')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data == 'edit' ? 'Edit' : 'Add'} Sub Recipes</h4>
                            <div className="ms-auto">
                                <button type="submit" className="btn btn-success" onClick={handleSubmitForm}>
                                    {isLoading ? <IconLoader /> : 'SAVE'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <Formik
                            innerRef={runforms}
                            enableReinitialize
                            initialValues={initialValues}
                            validationSchema={Yup.object({
                                display_name: Yup.string().required('Please Enter Name'),
                                base_weight: Yup.string().required('Please Enter Base Weight'),
                                base_unit_id: Yup.string().required('Please Select Base Unit'),
                                shrink_percentage: Yup.number().required('Please Enter Trim Percentage')
                            })}
                            onSubmit={(values, actions) => {
                                handleSubmit(values, actions);
                            }}
                        >
                            {(runform) => {
                                return (
                                    <form onSubmit={runform.handleSubmit}>
                                        <div className="mb-3 bg-light py-3 rounded shadow-sm m-2">
                                            <div className="row mx-2">
                                                <div className="col-md-4">
                                                    <div className="upload-file-dash-new position-relative">
                                                        <div className="file-selecter text-center position-relative">
                                                            <div className="file-area position-relative">
                                                                <input
                                                                    type="file"
                                                                    name="sub_recipe_image"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleImg(e.target.files[0], e)}
                                                                />
                                                                <div className="file-dummy">
                                                                    <img id="sub-recipes-img" loading="lazy" alt="" />
                                                                    <div id="upload-image-area">
                                                                        <div className="file-upload-content">
                                                                            <img className="file-dummy-image" loading="lazy" src={FileIco} alt="" />
                                                                        </div>
                                                                        <span>
                                                                            Drag and drop your files or{' '}
                                                                            <bdi style={{ textDecoration: 'underline' }}>Browse</bdi>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-8">
                                                    <div className="row">
                                                        <div className="col-md-6 mb-3">
                                                            <label>Display Name</label>
                                                            <div>
                                                                <input
                                                                    className="form-control"
                                                                    name="display_name"
                                                                    type="text"
                                                                    placeholder="Enter Name"
                                                                    {...formAttr(runform, 'display_name')}
                                                                />
                                                                {errorContainer(runform, 'display_name')}
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label>Internal Name (Only for Admin)</label>
                                                            <div>
                                                                <input
                                                                    className="form-control"
                                                                    name="internal_name"
                                                                    type="text"
                                                                    placeholder="Enter Name"
                                                                    {...formAttr(runform, 'internal_name')}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label>Category</label>
                                                            <div>
                                                                {isLoading ? (
                                                                    <span className="form-select p-1">
                                                                        <SelectLoader />
                                                                    </span>
                                                                ) : (
                                                                    <select
                                                                        className="form-select"
                                                                        name="ingredient_category_id"
                                                                        {...formAttr(runform, 'ingredient_category_id')}
                                                                    >
                                                                        <option value="">
                                                                            Select Category
                                                                        </option>
                                                                        {ingredient_cat?.map((item, i) => {
                                                                            return (
                                                                                <option key={`${item.ingredient_category_id}-${i}`} value={item.ingredient_category_id}>
                                                                                    {item.ingredient_category_name}
                                                                                </option>
                                                                            );
                                                                        })}
                                                                    </select>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <div className="d-flex">
                                                                <label>Priority Order</label>
                                                                <span className="priority-tags ms-2 px-2">1 -High Priority, 5 -Low Priority</span>
                                                            </div>

                                                            <div>
                                                                {isLoading ? (
                                                                    <span className="form-select p-1">
                                                                        <SelectLoader />
                                                                    </span>
                                                                ) : (
                                                                    <select
                                                                        className="form-select"
                                                                        name="priority_order"
                                                                        {...formAttr(runform, 'priority_order')}
                                                                    >
                                                                        <option value="">
                                                                            Select Priority Order
                                                                        </option>
                                                                        <option value="1"> 1 </option>
                                                                        <option value="2"> 2 </option>
                                                                        <option value="3"> 3 </option>
                                                                        <option value="4"> 4 </option>
                                                                        <option value="5"> 5 </option>
                                                                    </select>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-3 align-items-center bg-light py-3 rounded shadow-sm m-2">
                                            <span className="heading-main-span rounded ps-2 py-2 m-3 mt-2 d-block">
                                                Production Cost
                                            </span>
                                            <div className="row mx-2">
                                                <div className="col-md-6 mb-3">
                                                    <div className="d-flex justify-content-between">
                                                        <label>Cost per Quantity (Sum: $0.00)</label>
                                                        <div className="form-check form-switch form-switch-md ">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="cost_qty"
                                                                name="cost_qty"
                                                            />
                                                            <label className="form-check-label" htmlFor="cost_qty">
                                                                Auto Calculate Food Costs?
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <input
                                                            className="form-control"
                                                            name="cost_per_quantity"
                                                            type="number"
                                                            placeholder="Enter Cost per Quantity"
                                                        // {...formAttr(runform, 'cost_per_quantity')}
                                                        />
                                                        {/* {errorContainer(runform, 'cost_per_quantity')} */}
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-3">
                                                    <label>Cost per Hour</label>
                                                    <div>
                                                        <input
                                                            className="form-control"
                                                            name="cost_per_hour"
                                                            type="number"
                                                            placeholder="Enter Cost per Hour"
                                                        // {...formAttr(runform, 'cost_per_hour')}
                                                        />
                                                        {/* {errorContainer(runform, 'cost_per_hour')} */}
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-3">
                                                    <label>Time to Prepare</label>
                                                    <div>
                                                        <input
                                                            className="form-control"
                                                            name="time_to_prepare"
                                                            type="number"
                                                            placeholder="Enter prepare Time"
                                                        // {...formAttr(runform, 'time_to_prepare')}
                                                        />
                                                        {/* {errorContainer(runform, 'time_to_prepare')} */}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="heading-main-span">Base Info</span>
                                            <div className="row mx-2">
                                                <div className="col-md-4 mb-3">
                                                    <label className="d-flex align-items-center">
                                                        Base Weight
                                                        <div id="Tooltip-base_weight" className="d-inline-flex">
                                                            <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                        </div>
                                                        <Tooltip
                                                            isOpen={tooltipOpen == 'base_weight'}
                                                            placement={'right'}
                                                            target="Tooltip-base_weight"
                                                            toggle={() => toggle('base_weight')}
                                                        >
                                                            The Base Weight for raw ingredients should be set to 1. Sub-Recipes should be set to the
                                                            volume your recipe yields for a cooked ingredients. For example your ground turkey recipe
                                                            yields 10lb but you plate in ounces so convert to 160 oz(base weight). Then enter your
                                                            ingredients required to make that recipe.
                                                        </Tooltip>
                                                    </label>
                                                    <div>
                                                        <input
                                                            className="form-control"
                                                            name="base_weight"
                                                            type="number"
                                                            placeholder="Enter Base Weight"
                                                            {...formAttr(runform, 'base_weight')}
                                                        />
                                                        {errorContainer(runform, 'base_weight')}
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="d-flex align-items-center">
                                                        Base Unit
                                                        <div id="Tooltip-base_unit_id" className="d-inline-flex">
                                                            <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                        </div>
                                                        <Tooltip
                                                            isOpen={tooltipOpen == 'base_unit_id'}
                                                            placement={'right'}
                                                            target="Tooltip-base_unit_id"
                                                            toggle={() => toggle('base_unit_id')}
                                                        >
                                                            Select the Unit of Measure for this Sub-recipe
                                                        </Tooltip>
                                                    </label>
                                                    <div>
                                                        {isLoading_units ? (
                                                            <span className="form-select p-1">
                                                                <SelectLoader />
                                                            </span>
                                                        ) : (
                                                            <select className="form-select" name="base_unit_id" {...formAttr(runform, 'base_unit_id')}>
                                                                <option value="">
                                                                    Select Base Unit
                                                                </option>
                                                                {units?.map((item, i) => {
                                                                    return (
                                                                        <option key={`${item.unit_id}-${i}`} value={item.unit_id}>
                                                                            {item.unit_name}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                        )}
                                                        {errorContainer(runform, 'base_unit_id')}
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="d-flex align-items-center">
                                                        Trim/Shrinkage Percentage
                                                        <div id="Tooltip-shrink_percentage" className="d-inline-flex">
                                                            <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                        </div>
                                                        <Tooltip
                                                            isOpen={tooltipOpen == 'shrink_percentage'}
                                                            placement={'right'}
                                                            target="Tooltip-shrink_percentage"
                                                            toggle={() => toggle('shrink_percentage')}
                                                        >
                                                            % that an ingredient is trimmed or shrinks during the cooking process. Example, 1oz cut of
                                                            chicken would lose 25% during the cooking process. System will calculate automatically how
                                                            much you need to buy and add that info into the shopping list.
                                                        </Tooltip>
                                                    </label>
                                                    <div>
                                                        <input
                                                            className="form-control"
                                                            name="shrink_percentage"
                                                            type="number"
                                                            placeholder="Enter Trim/Shrinkage Percentage"
                                                            onInput={(e) => { runform.setFieldValue('shrink_percentage', (validatePercentage(e.target) ?? runform.values?.shrink_percentage)) }}
                                                            value={runform.values?.shrink_percentage}
                                                        />
                                                        {errorContainer(runform, 'shrink_percentage')}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="heading-main-span">Cooking Instructions</span>
                                            <div className="row mx-2">
                                                <div className="col-md-12 mb-3">
                                                    <div>
                                                        <textarea
                                                            className="form-control"
                                                            name="cooking_instructions"
                                                            placeholder="Enter Cooking Instructions Here..."
                                                            {...formAttr(runform, 'cooking_instructions')}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                            {
                                                runform.values?.sub_recipe_ingredients?.length <= 0 && (
                                                    <>
                                                        <span className="heading-main-span">Allergens and Dislikes</span>
                                                        <div className="row mx-2 modal-creation-reason">
                                                            <div className="col-md-6 mb-3">
                                                                <label className="d-flex align-items-center">
                                                                    Allergens
                                                                    <div id="Tooltip-allergen_detail" className="d-inline-flex">
                                                                        <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                                    </div>
                                                                    <Tooltip
                                                                        isOpen={tooltipOpen == 'allergen_detail'}
                                                                        placement={'right'}
                                                                        target="Tooltip-allergen_detail"
                                                                        toggle={() => toggle('allergen_detail')}
                                                                    >
                                                                        Select any alergen this ingredient may contain. system will check if client has this alergen
                                                                        and if true he will block any meal.
                                                                    </Tooltip>
                                                                </label>
                                                                <div>
                                                                    <Select
                                                                        name="allergen_detail"
                                                                        value={selected_allergens}
                                                                        isMulti={true}
                                                                        onChange={(val) => handleSelect(val, 'allergen_detail')}
                                                                        options={ingredient_allergens?.map((f) => ({
                                                                            label: f.ingredient_allergen_name,
                                                                            value: f.ingredient_allergen_id,
                                                                        }))}
                                                                        className="select2-selection"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6 mb-3">
                                                                <label className="d-flex align-items-center">
                                                                    Dislikes
                                                                    <div id="Tooltip-dislike_detail" className="d-inline-flex">
                                                                        <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                                    </div>
                                                                    <Tooltip
                                                                        isOpen={tooltipOpen == 'dislike_detail'}
                                                                        placement={'right'}
                                                                        target="Tooltip-dislike_detail"
                                                                        toggle={() => toggle('dislike_detail')}
                                                                    >
                                                                        Select any dislike this ingredient may have. System will check if client has this dislike
                                                                        and if true he will block any meal.
                                                                    </Tooltip>
                                                                </label>
                                                                <div>
                                                                    <Select
                                                                        name="dislike_detail"
                                                                        value={selected_dislikes}
                                                                        isMulti={true}
                                                                        onChange={(val) => handleSelect(val, 'dislike_detail')}
                                                                        options={ingredient_dislikes?.map((f) => ({
                                                                            label: f.ingredient_dislike_name,
                                                                            value: f.ingredient_dislike_id,
                                                                        }))}
                                                                        className="select2-selection"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )
                                            }

                                            <div className="row me-2">
                                                <div className="col-lg-6">
                                                    <span className="heading-main-span mb-5">
                                                        Sub-recipe (to make 1 Cup) (Prod. Price:$0.00)
                                                    </span>
                                                    <div className="ms-3 accordian-sub-rcp">
                                                        <Accordion
                                                            open={opened_drp_id}
                                                            toggle={(e) => set_opened_drp_id(opened_drp_id !== '' && opened_drp_id === e ? '' : e)}
                                                        >
                                                            {runform.values?.sub_recipe_ingredients?.map((item, index) => {
                                                                let id = item.ingredient_id ? 'ingredient_id' : 'sub_recipe_id';
                                                                return (
                                                                    <AccordionItem key={item?.[id]} className="mb-2">
                                                                        <AccordionHeader targetId={item?.[id]}>
                                                                            <span className="me-2 fw-medium">{item.display_name}</span>
                                                                            <bdi className="fw-light">
                                                                                ({FixedDecimal(item.quantity)} {item.unit_short_name})
                                                                            </bdi>
                                                                        </AccordionHeader>
                                                                        <AccordionBody accordionId={item?.[id]}>
                                                                            <div className="col-md-6 mb-3 pt-3 px-4">
                                                                                <label className="fw-normal">Quantity</label>
                                                                                <div className="d-flex align-items-center">
                                                                                    <input
                                                                                        className="form-control border-top-0 border-start-0 border-end-0 rounded-0 ps-0 me-2"
                                                                                        name="quantity"
                                                                                        type="number"
                                                                                        placeholder="Enter Quantity"
                                                                                        onChange={(e) => handleChangeQuantity(e, item, index)}
                                                                                        value={item.quantity}
                                                                                    />
                                                                                    {item.unit_short_name}
                                                                                </div>
                                                                            </div>
                                                                            <div className="mb-2 px-4">
                                                                                {item.macro_details?.map((f, i) => {
                                                                                    return (
                                                                                        <span key={f.macro_id || i}>
                                                                                            <bdi className="fw-medium">{f.macro_name}: </bdi>
                                                                                            {f.value} {f.suffix}
                                                                                            {i !== item.macro_details?.length - 1 && ', '}
                                                                                        </span>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                            <div className="accordian-ftr-sub-rcp">
                                                                                <span className="cursor-pointer">
                                                                                    <a href={`/admin/kitchen-ordering/edit-${item.type == 2 ? 'sub-recipes' : 'ingredients'}/${item?.[id]}`} target="_blank">
                                                                                        <span>
                                                                                            <i className="bx bx-link-external me-1"></i>Go to Ingredient
                                                                                        </span>
                                                                                    </a>{' '}
                                                                                    |
                                                                                    <bdi className="text-danger" onClick={() => handleSubmitModal(item, index)}>
                                                                                        <i className="bx bx-trash mx-1"></i>Delete
                                                                                    </bdi>
                                                                                </span>
                                                                            </div>
                                                                        </AccordionBody>
                                                                    </AccordionItem>
                                                                );
                                                            })}
                                                        </Accordion>
                                                    </div>
                                                    <span
                                                        className="heading-main-span mt-5 text-center cursor-pointer"
                                                        onClick={() =>
                                                            set_show_subrecipes({ data: runform.values?.sub_recipe_ingredients, show: true })
                                                        }
                                                    >
                                                        Add Ingredient
                                                    </span>
                                                </div>
                                                <div className="col-lg-6" style={{ marginTop: '55px' }}>
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input mb-3"
                                                            id="is_auto_macro"
                                                            name="is_auto_macro"
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className="form-check-label" htmlFor="is_auto_macro">
                                                            Auto Macros?
                                                        </label>
                                                    </div>
                                                    <div className="ingredients-tbl">
                                                        {
                                                            isLoading_macros ? (
                                                                <Loader />
                                                            ) : (
                                                                <DataTable
                                                                    data={ingredient_macros ?? []}
                                                                    options={options}
                                                                    tableCallBack={tableCallBack}
                                                                    columns={columns}
                                                                />
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <button type="submit" className="btn btn-success m-2 d-none" id="sub-recipes-submit">
                                                {runform.isSubmitting ? <IconLoader /> : 'SAVE'}
                                            </button>
                                        </div>
                                    </form>
                                )
                            }}
                        </Formik>
                    </div>

                    <SubRecipeModal
                        states={{
                            show_subrecipes,
                            set_show_subrecipes,
                        }}
                        functions={{ handleSubmitModal }}
                    />
                </div>
            </div>
        </React.Fragment>
    );
}
