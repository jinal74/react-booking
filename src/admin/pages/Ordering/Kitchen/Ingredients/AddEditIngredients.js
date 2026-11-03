import React, { useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr, validatePercentage } from '../../../../../helpers/func_helper';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { IconLoader, SelectLoader } from '../../../../Loader/IconLoader';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH } from '../../../../constants/const';
import { toast } from 'react-toastify';
import DataTable from '../../../Tables/CustDataTable';
import FileIco from '../../../../assets/images/cloud-arrow-up2.svg';
import { Tooltip } from 'reactstrap';

export default function AddEditIngredients() {
    const runforms = useRef();
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    const [edit_data, set_edit_data] = useState('add');
    const [ingredient_macros, set_ingredient_macros] = useState([]);
    const [ingredient_cat, set_ingredient_cat] = useState([]);
    const [ingredient_allergens, set_ingredient_allergens] = useState([]);
    const [ingredient_dislikes, set_ingredient_dislikes] = useState([]);
    const [units, set_units] = useState([]);
    const [selected_allergens, set_selected_allergens] = useState([]);
    const [selected_dislikes, set_selected_dislikes] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [isLoading_units, set_isLoading_units] = useState(false);
    const [isLoading_cat, set_isLoading_cat] = useState(false);
    const [initialValues, set_initialValues] = useState({
        ingredient_image: null,
        display_name: '',
        internal_name: '',
        ingredient_category_id: '',
        base_weight: '',
        base_unit_id: '',
        shrink_percentage: '',
        cooking_instructions: '',
        allergen_detail: [],
        dislike_detail: [],
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
    }

    useEffect(() => {
        GetIngredientCategories();
        GetAllAllergens();
        GetAllDislikes();
        GetAllUnits();
    }, []);

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
        GetMacrosData(id ?? '');
    }, [location]);

    const columns = [
        {
            name: 'Macro',
            column: 'macro_name',
        },
        {
            name: 'Qnt',
            column: 'allergens',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="d-flex align-items-center">
                            <input
                                type="number"
                                className="form-control me-2 qnt-input"
                                onChange={(e) => handleChange((Number(e.target.value === '' ? 0 : e.target.value).toString()), data, i)}
                                value={data[i].quantity ?? 0}
                            />
                            {data[i].suffix}
                        </div>
                    );
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

    const fetchEditData = async (sub_recipe_id) => {
        const response = await PostApi(API_PATH.getSubRecipesById, { sub_recipe_id });
        if (response.statusCode === 200) {
            let data = response.data.sub_recipe[0];

            let temp_allergens = data?.allergens !== '' ? (data?.allergens?.split(',') ?? []) : [];
            let allergens = [];
            for (let i = 0; i < temp_allergens.length; i++) {
                let obj = temp_allergens[i]?.split(':');
                allergens.push({ label: obj[1], value: obj[0] });
            }
            let temp_dislikes = data?.dislikes !== '' ? (data?.dislikes?.split(',') ?? []) : [];
            let dislikes = [];
            for (let i = 0; i < temp_dislikes.length; i++) {
                let obj = temp_dislikes[i]?.split(':');
                dislikes.push({ label: obj[1], value: obj[0] });
            }

            let ingredient_image = data.sub_recipe_image;
            if (!id) {
                // convert image url to file
                let name = data?.sub_recipe_image?.split('/').pop();
                let file_data = await fetch(data.sub_recipe_image ?? '')
                    .then(async response => {
                        const contentType = response.headers.get('content-type')
                        const blob = await response.blob()
                        const file = new File([blob], name, { contentType })
                        return file;
                    })
                ingredient_image = file_data;
            }

            set_initialValues({
                ingredient_id: data.sub_recipe_id,
                ingredient_image: ingredient_image,
                display_name: data.display_name,
                internal_name: data.internal_name,
                ingredient_category_id: data.ingredient_category_id,
                base_weight: data.base_weight,
                base_unit_id: data.base_unit_id,
                shrink_percentage: data.shrink_percentage,
                cooking_instructions: data.cooking_instructions,
                allergen_detail: allergens?.map((f) => f.value),
                dislike_detail: dislikes?.map((f) => f.value),
            });
            set_selected_dislikes(dislikes);
            set_selected_allergens(allergens);

            if (data.sub_recipe_image) {
                let img = document.getElementById('ingredient-img');
                img.className = 'w-100 h-100';
                img.src = data.sub_recipe_image;
                document.getElementById('upload-img-area').style.display = 'none';
            }
        }
    };

    const GetMacrosData = async (id) => {
        const response = await PostApi(API_PATH.getIngredientMacros, { ...(id !== '' && { ingredient_id: id }) });
        if (response.statusCode === 200) {
            set_ingredient_macros(response.data ?? []);
        }
    };

    const GetIngredientCategories = async () => {
        set_isLoading_cat(true);
        const response = await PostApi(API_PATH.getIngredientCategory, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            set_ingredient_cat(response.data.data_result ?? []);
        }
        set_isLoading_cat(false);
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

    const handleChange = (value, data, index) => {
        let temp = [...data];
        let temp_obj = { ...temp[index] };
        Object.assign(temp_obj, { quantity: Number(value) });
        temp.splice(index, 1, temp_obj);
        set_ingredient_macros(temp);
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
            let img = document.getElementById('ingredient-img');
            if (file && file != '') {
                let reader = new FileReader();
                reader.onload = function () {
                    img.className = 'w-100 h-100';
                    img.src = reader.result;
                    runforms.current.setFieldValue('ingredient_image', file);
                    document.getElementById('upload-img-area').style.display = 'none';
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

    const handleSubmitForm = () => {
        document.getElementById('ingredients-submit').click();
    };

    const handleSubmit = async (formData, actions) => {
        set_isLoading(true);
        let api_path = '';
        let message = '';

        const form_data = new FormData()
        if (formData.ingredient_image) {
            if (typeof formData.ingredient_image !== 'string') form_data.append('file', formData.ingredient_image);
            // delete formData.ingredient_image;
        }

        formData.macro_detail =
            ingredient_macros.map((f) => ({
                macro_id: f.macro_id,
                quantity: f.quantity,
            })) ?? [];

        if (edit_data == 'edit') {
            api_path = API_PATH.editIngredient;
            message = 'Ingredient updated successfully';
            form_data.append('ingredient_id', formData.ingredient_id);
            // delete formData.ingredient_id;
        } else {
            api_path = API_PATH.addIngredient;
            message = 'Ingredient added successfully';
        }

        form_data.append('props', JSON.stringify(formData));

        if (api_path != '') {
            const response = await PostApi(api_path, form_data);
            if (response.statusCode === 200) {
                toast.success(message);
                navigate('/admin/kitchen-ordering/ingredients');
            }
            set_isLoading(false);
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
                                onClick={() => navigate('/admin/kitchen-ordering/ingredients')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data == 'edit' ? 'Edit' : 'Add'} Ingredients</h4>
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
                                shrink_percentage: Yup.string().required('Please Enter Trim/Shrinkage Percentage')
                            })}
                            onSubmit={(values, actions) => {
                                handleSubmit(values, actions);
                            }}
                        >
                            {(runform) => (
                                <form onSubmit={runform.handleSubmit}>
                                    <div className="mb-3 bg-light py-3 rounded shadow-sm m-2">
                                        <div className="row mx-2">
                                            <div className="col-md-4">
                                                <div className="upload-file-dash-new position-relative">
                                                    <div className="file-selecter text-center position-relative">
                                                        <div className="file-area position-relative">
                                                            <input
                                                                type="file"
                                                                name="ingredient_image"
                                                                accept="image/*"
                                                                onChange={(e) => handleImg(e.target.files[0], e)}
                                                            />
                                                            <div className="file-dummy">
                                                                <img id="ingredient-img" loading="lazy" alt="" />
                                                                <div id='upload-img-area'>
                                                                    <div className="file-upload-content">
                                                                        <img
                                                                            className="file-dummy-image"
                                                                            loading="lazy"
                                                                            src={FileIco}
                                                                            alt=""
                                                                        />
                                                                    </div>
                                                                    <span>
                                                                        Drag and drop your files or{' '}
                                                                        <bdi
                                                                            style={{ textDecoration: 'underline' }}
                                                                        >
                                                                            Browse
                                                                        </bdi>
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
                                                            {isLoading_cat ? (
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
                                                                            <option
                                                                                key={i}
                                                                                value={item.ingredient_category_id}
                                                                            >
                                                                                {item.ingredient_category_name}
                                                                            </option>
                                                                        );
                                                                    })}
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
                                                <label>Supplier</label>
                                                <div>
                                                    <select
                                                        className="form-select"
                                                        name="supplier"
                                                    // {...formAttr(runform, 'supplier')}
                                                    >
                                                        <option value="" disabled>
                                                            Select Supplier
                                                        </option>
                                                        <option value="large">Large</option>
                                                        <option value="regular">Medium</option>
                                                        <option value="small">Small</option>
                                                    </select>
                                                    {/* {errorContainer(runform, 'supplier')} */}
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label>Cost per Quantity (Sum: $0.00)</label>
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
                                        </div>
                                        <span className="heading-main-span">
                                            Base Info
                                        </span>
                                        <div className="row mx-2">
                                            <div className="col-md-4 mb-3">
                                                <label className='d-flex align-items-center'>
                                                    Base Weight
                                                    <div id='Tooltip_base_weight' className='d-inline-flex'>
                                                        <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                    </div>
                                                    <Tooltip
                                                        isOpen={tooltipOpen == 'base_weight'}
                                                        placement={'right'}
                                                        target='Tooltip_base_weight'
                                                        toggle={() => toggle('base_weight')}
                                                    >
                                                        The Base Weight for raw ingredients should be set to 1. Sub-Recipes should be set to the volume your recipe yields for a cooked ingredients. For example your ground turkey recipe yields 10lb but you plate in ounces so convert to 160 oz(base weight). Then enter your ingredients required to make that recipe.
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
                                                <label className='d-flex align-items-center'>
                                                    Base Unit
                                                    <div id='Tooltip_base_unit_id' className='d-inline-flex'>
                                                        <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                    </div>
                                                    <Tooltip
                                                        isOpen={tooltipOpen == 'base_unit_id'}
                                                        placement={'right'}
                                                        target='Tooltip_base_unit_id'
                                                        toggle={() => toggle('base_unit_id')}
                                                    >
                                                        Select the Unit of Measure for this Ingredient.
                                                    </Tooltip>
                                                </label>
                                                <div>
                                                    {isLoading_units ? (
                                                        <span className="form-select p-1">
                                                            <SelectLoader />
                                                        </span>
                                                    ) : (
                                                        <select
                                                            className="form-select"
                                                            name="base_unit_id"
                                                            {...formAttr(runform, 'base_unit_id')}
                                                        >
                                                            <option value="">
                                                                Select Base Unit
                                                            </option>
                                                            {units?.map((item, i) => {
                                                                return (
                                                                    <option key={i} value={item.unit_id}>
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
                                                <label className='d-flex align-items-center'>
                                                    Trim/Shrinkage Percentage
                                                    <div id='Tooltip_shrink_percentage' className='d-inline-flex'>
                                                        <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                    </div>
                                                    <Tooltip
                                                        isOpen={tooltipOpen == 'shrink_percentage'}
                                                        placement={'right'}
                                                        target='Tooltip_shrink_percentage'
                                                        toggle={() => toggle('shrink_percentage')}
                                                    >
                                                        % that an ingredient is trimmed or shrinks during the cooking process. Example, 1oz cut of chicken would lose 25% during the cooking process. System will calculate automatically how much you need to buy and add that info into the shopping list.
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
                                        <span className="heading-main-span">
                                            Cooking Instructions
                                        </span>
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
                                        <span className="heading-main-span">
                                            Allergens and Dislikes
                                        </span>
                                        <div className="row mx-2 modal-creation-reason">
                                            <div className="col-md-6 mb-3">
                                                <label className='d-flex align-items-center'>
                                                    Allergens
                                                    <div id='Tooltip_allergen_detail' className='d-inline-flex'>
                                                        <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                    </div>
                                                    <Tooltip
                                                        isOpen={tooltipOpen == 'allergen_detail'}
                                                        placement={'right'}
                                                        target='Tooltip_allergen_detail'
                                                        toggle={() => toggle('allergen_detail')}
                                                    >
                                                        Select any alergen this ingredient may contain.
                                                        system will check if client has this alergen and if true he will block any meal.
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
                                                <label className='d-flex align-items-center'>
                                                    Dislikes
                                                    <div id='Tooltip_dislike_detail' className='d-inline-flex'>
                                                        <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                    </div>
                                                    <Tooltip
                                                        isOpen={tooltipOpen == 'dislike_detail'}
                                                        placement={'right'}
                                                        target='Tooltip_dislike_detail'
                                                        toggle={() => toggle('dislike_detail')}
                                                    >
                                                        Select any dislike this ingredient may have.
                                                        System will check if client has this dislike and if true he will block any meal.
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
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            className="btn btn-success m-2 d-none"
                                            id="ingredients-submit"
                                        >
                                            {runform.isSubmitting ? <IconLoader /> : 'SAVE'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </Formik>
                    </div>
                    <div className="col-md-6 mx-auto ingredients-tbl">
                        <DataTable
                            data={ingredient_macros}
                            options={options}
                            tableCallBack={tableCallBack}
                            columns={columns}
                        />
                    </div>
                </div>
            </div>
        </React.Fragment >
    );
}
