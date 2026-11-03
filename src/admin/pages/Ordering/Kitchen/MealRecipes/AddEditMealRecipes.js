import React, { useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Makeid, errorContainer, formAttr } from '../../../../../helpers/func_helper';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { IconLoader, SelectLoader } from '../../../../Loader/IconLoader';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH } from '../../../../constants/const';
import { toast } from 'react-toastify';
import FileIco from '../../../../assets/images/cloud-arrow-up2.svg';
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Tooltip } from 'reactstrap';
import DataTable from '../../../Tables/CustDataTable';
import SubRecipeModal from '../SubRecipes/SubRecipeModal';
import Placeholder from '../../../../assets/images/placeholder.png';

export default function AddEditMealRecipes() {
    const runforms = useRef();
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    const [selected_portion_size, set_selected_portion_size] = useState('');
    const [portion_sizes, set_portion_sizes] = useState(null);
    const [edit_data, set_edit_data] = useState('add');
    const [display_images, set_display_images] = useState([]);
    const [is_auto_macro, set_is_auto_macro] = useState(0);
    const [ingredient_macros, set_ingredient_macros] = useState([]);
    const [all_macros, set_all_macros] = useState([]);
    const [meal_categories, set_meal_categories] = useState(null);
    const [isLoading, set_isLoading] = useState(false);
    const [opened_drp_id, set_opened_drp_id] = useState('');
    const [show_subrecipes, set_show_subrecipes] = useState({ data: null, show: false });
    const [tooltipOpen, setTooltipOpen] = useState('');
    const [edit_image_data, set_edit_image_data] = useState({
        mainfile: null,
        additionfiles: null,
        remove_ingredient_image_ids: [],
    });
    const [initialValues, set_initialValues] = useState({
        ingredient_image: null,
        is_chef_fav: 0,
        is_new: 0,
        should_show_ratings: 0,
        is_deleted: 1,
        display_name: '',
        internal_name: '',
        meal_expiration_days: 5,
        net_weight: '',
        meal_description: '',
        regular_meal_prep_price: 0,
        regular_meal_surcharge: 0,
        regular_price: 0,
        meal_heating_instruction: '',
        meal_packaging_instruction: '',
        cooking_instructions: '',
        is_auto_macro: 0,
        ingredientcategoryids: [],
        sub_recipe_ingredients: [],
        meal_portion_prices: [],
        macro_detail: [],
    });
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        show_header: false,
        show_footer: false,
    });

    useEffect(() => {
        GetMealCategories();
        GetAllMacros();
        GetAllPortionSize();
    }, []);

    useEffect(() => {
        if (meal_categories) {
            let data = location?.state?.data;
            document.getElementById('is_auto_macro').checked = initialValues.is_auto_macro == 1;
            document.getElementById('is_new').checked = initialValues.is_new == 1;
            document.getElementById('is_deleted').checked = initialValues.is_deleted == 0;
            document.getElementById('is_chef_fav').checked = initialValues.is_chef_fav == 1;
            document.getElementById('should_show_ratings').checked = initialValues.should_show_ratings == 1;
            let editData = 'add';
            if ((id || data) && portion_sizes) {
                if (id) editData = 'edit';
                fetchEditData(id || data);
            }
            set_edit_data(editData);
        }
    }, [location, meal_categories, portion_sizes]);

    useEffect(() => {
        if (is_auto_macro == 1) {
            let temp_ingredient_macros = [...ingredient_macros];
            let selected_ingredients = runforms.current?.values?.sub_recipe_ingredients ?? [];

            for (let j = 0; j < temp_ingredient_macros.length; j++) {
                let temp_ingredient_macros_obj = { ...temp_ingredient_macros[j] };
                let quantity_arr = [];
                for (let i = 0; i < selected_ingredients.length; i++) {
                    let find = selected_ingredients[i].macro_details?.find(
                        (f) => f.macro_id == temp_ingredient_macros_obj.macro_id
                    );
                    if (find?.value) quantity_arr.push({ id: find.macro_id, arr: find?.value });
                }
                let transformedArray = [];
                if (selected_ingredients?.length > 0) transformedArray = TransformQntArray(quantity_arr);
                else {
                    transformedArray = (portion_sizes || [])?.map((item) => {
                        return {
                            macro_id: temp_ingredient_macros_obj.macro_id,
                            quantity: 0,
                            portion_size_id: item.portion_size_id,
                        };
                    });
                }

                temp_ingredient_macros_obj.quantity_arr = transformedArray;
                temp_ingredient_macros.splice(j, 1, temp_ingredient_macros_obj);
            }
            set_ingredient_macros(temp_ingredient_macros);
        }
    }, [runforms.current?.values?.sub_recipe_ingredients, show_subrecipes.data, is_auto_macro]);

    useEffect(() => {
        let selected_ingredients = runforms.current?.values?.sub_recipe_ingredients ?? [];
        let temp_arr = [...selected_ingredients];

        for (let i = 0; i < temp_arr.length; i++) {
            let temp_obj = { ...temp_arr[i] };
            let macro_details = temp_obj.macro_values !== '' ? temp_obj.macro_values?.split(';') ?? [] : [];
            let macros_arr = [];
            let portion_quantity = temp_obj?.portion_quantity !== '' ? temp_obj?.portion_quantity?.split(';') ?? [] : [];
            let quantity_arr = portion_quantity?.map((f) => {
                let val = f?.split(':');
                return { portion_size_id: val[0], quantity: val[1] };
            });
            let temp_qnt_arr = temp_obj?.quantity_arr ?? quantity_arr;
            for (let j = 0; j < macro_details.length; j++) {
                const detailed_arr = macro_details[j].split(':');
                const filtered = all_macros?.find((f) => f.macro_id == detailed_arr[0]);
                let final_value = temp_qnt_arr?.map((f) => {
                    return {
                        ...f,
                        value: ((f.quantity ?? 1) * detailed_arr[1]) / temp_obj.base_weight,
                    };
                });
                macros_arr.push({ ...filtered, value: final_value });
            }
            temp_obj.macro_details = macros_arr;
            temp_obj.quantity_arr = temp_qnt_arr;
            temp_arr.splice(i, 1, temp_obj);
        }

        runforms.current.setFieldValue('sub_recipe_ingredients', temp_arr);
        set_show_subrecipes({ ...show_subrecipes, data: temp_arr });
    }, [initialValues, all_macros]);

    useEffect(() => {
        let idToSend = id ?? location?.state?.data ?? '';
        if (portion_sizes && is_auto_macro != 1) GetMacrosData(idToSend);
    }, [is_auto_macro, portion_sizes]);

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
                    let find = data[i].quantity_arr?.find((f) => f.portion_size_id == selected_portion_size);
                    if (is_auto_macro != 1) {
                        return (
                            <div className="d-flex align-items-center">
                                <input
                                    type="number"
                                    className="form-control me-2 qnt-input py-1"
                                    onChange={(e) => handleChange((Number(e.target.value === '' ? 0 : e.target.value).toString()), data, i)}
                                    value={find?.quantity ?? 0}
                                />
                                {data[i].suffix}
                            </div>
                        );
                    } else {
                        return (
                            <div className="d-flex align-items-center">
                                {find?.quantity ?? 0} {data[i].suffix}
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
                    let find_quantity = data[i]?.quantity_arr?.find((f) => f.portion_size_id == selected_portion_size);
                    let temp_val = (100 * (find_quantity?.quantity ?? 0)) / data[i].daily_value;
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

    const groupStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    };

    const GetAllMacros = async () => {
        const response = await PostApi(API_PATH.getAllMacros, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            let data = response.data.data_result ?? [];
            let filtered = data.filter((f) => f.on_labels > 0 || f.on_front > 0);
            set_all_macros(data);
            set_ingredient_macros(filtered);
        }
    };

    const GetAllPortionSize = async () => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getActivePortionSize);
        if (response.statusCode === 200) {
            let data = response.data?.map((f) => {
                if (f.is_default != 1) return f;
                else return { ...f, portion_size_id: '00000000000000000000000000000000' };
            });

            set_portion_sizes(data ?? []);
            set_selected_portion_size(data?.[0]?.portion_size_id);

            if (!id && !location?.state?.data) {
                let portion_prices = [];
                data?.forEach((data) => {
                    if (data.is_default != 1) {
                        portion_prices.push({
                            portion_size_id: data.portion_size_id,
                            upgrade_price: 0,
                            is_active: 0,
                            surcharge: 0,
                            regular_price: 0,
                        });
                    }
                });

                runforms?.current?.setFieldValue('meal_portion_prices', portion_prices);
            }
        }
        set_isLoading(false);
    };

    const GetMacrosData = async (id) => {
        const response = await PostApi(API_PATH.getIngredientMacros, { ...(id !== '' && { ingredient_id: id }) });
        if (response.statusCode === 200) {
            let data = response.data ?? [];

            if (id || location?.state?.data) {
                data = TransformMacroData(response.data);
            } else {
                data = response.data?.map((f) => {
                    return {
                        ...f,
                        quantity_arr: (portion_sizes || [])?.map((item) => {
                            return {
                                macro_id: f.macro_id,
                                quantity: f.quantity ?? 1,
                                portion_size_id: item.portion_size_id,
                            };
                        }),
                    };
                });
            }
            set_ingredient_macros(data ?? []);
        }
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
            let options = [];
            let temp_arr = Object.keys(result);
            for (let i = 0; i < temp_arr.length; i++) {
                let opt = result[temp_arr[i]]?.map((f) => {
                    return { label: f.meal_category_name, value: f.meal_category_id };
                });
                options.push({
                    label: temp_arr[i],
                    options: opt || [],
                });
            }
            set_meal_categories(options);
        }
        set_isLoading(false);
    };

    const fetchEditData = async (ingredient_id) => {
        const response = await PostApi(API_PATH.getMealRecipesById, { ingredient_id });
        if (response.statusCode === 200) {
            let data = response.data;
            let meal_recipe = data.meal_recipe[0];

            let ingredient_image_main = [];
            if (meal_recipe?.ingredient_image)
                ingredient_image_main.push({ ingredient_image_id: Makeid(4), image_name: meal_recipe.ingredient_image });
            if (data?.images_detail) ingredient_image_main = ingredient_image_main.concat(data?.images_detail);

            set_display_images(ingredient_image_main);

            let ingredient_image = [];
            if (!id && ingredient_image_main?.length > 0) {
                let file_data = null;
                for (let i = 0; i < ingredient_image_main.length; i++) {
                    let name = ingredient_image_main[i].image_name?.split('/').pop();
                    file_data = await fetch(ingredient_image_main[i].image_name ?? '').then(async (response) => {
                        const contentType = response.headers.get('content-type');
                        const blob = await response.blob();
                        const file = new File([blob], name, { contentType });
                        return file;
                    });
                    if (file_data) ingredient_image.push(file_data);
                }
            } else {
                ingredient_image = ingredient_image_main;
            }

            let ingredientcategoryids = [];
            let meal_categories_arr = meal_recipe?.meal_category_ids?.split(',');
            for (let j = 0; j < meal_categories?.length; j++) {
                for (let i = 0; i < meal_categories[j].options.length; i++) {
                    if (meal_categories_arr?.includes(meal_categories[j].options[i]?.value))
                        ingredientcategoryids.push({
                            label: meal_categories[j].options[i].label,
                            value: meal_categories[j].options[i]?.value,
                        });
                }
            }

            let portion_prices = [];
            portion_sizes?.forEach((portion) => {
                let find = data?.meal_portion_detail?.find((f) => f.portion_size_id === portion.portion_size_id);
                if (portion.is_default != 1) {
                    portion_prices.push(find ?? {
                        portion_size_id: portion.portion_size_id,
                        upgrade_price: 0,
                        is_active: 0,
                        surcharge: 0,
                        regular_price: 0,
                    });
                }
            });

            runforms?.current?.setFieldValue('meal_portion_prices', portion_prices);

            set_is_auto_macro(meal_recipe.is_auto_macro);
            set_initialValues({
                ingredient_id: meal_recipe.ingredient_id,
                ingredient_image: ingredient_image,
                is_chef_fav: meal_recipe.is_chef_fav,
                is_new: meal_recipe.is_new,
                is_deleted: meal_recipe.is_deleted,
                should_show_ratings: meal_recipe.should_show_ratings,
                display_name: meal_recipe.display_name,
                internal_name: meal_recipe.internal_name,
                ingredientcategoryids: ingredientcategoryids,
                meal_expiration_days: meal_recipe.meal_expiration_days,
                net_weight: meal_recipe.net_weight,
                meal_description: meal_recipe.meal_description,
                regular_meal_prep_price: meal_recipe.regular_meal_prep_price,
                regular_meal_surcharge: meal_recipe.regular_meal_surcharge,
                regular_price: meal_recipe.regular_price,
                meal_heating_instruction: meal_recipe.meal_heating_instruction,
                meal_packaging_instruction: meal_recipe.meal_packaging_instruction,
                cooking_instructions: meal_recipe.cooking_instructions ?? '',
                is_auto_macro: meal_recipe.is_auto_macro,
                sub_recipe_ingredients: data.ingredients,
                meal_portion_prices: portion_prices,
            });

            runforms?.current?.setFieldValue('sub_recipe_ingredients', data.ingredients);
            document.getElementById('is_auto_macro').checked = meal_recipe.is_auto_macro == 1;
            document.getElementById('is_new').checked = meal_recipe.is_new == 1;
            document.getElementById('is_deleted').checked = meal_recipe.is_deleted == 0;
            document.getElementById('is_chef_fav').checked = meal_recipe.is_chef_fav == 1;
            document.getElementById('should_show_ratings').checked = meal_recipe.should_show_ratings == 1;
        }
    };

    const TransformMacroData = (data) => {
        let groupedData = {};
        data?.forEach((item) => {
            let macroId = item.macro_id;
            if (!groupedData[macroId]) {
                groupedData[macroId] = { ...item };
                groupedData[macroId].quantity_arr = [];
            }
            let quantityObj = {
                macro_id: item.macro_id,
                quantity: item.quantity,
                portion_size_id: item.portion_size_id,
            };
            groupedData[macroId].quantity_arr.push(quantityObj);
        });

        let transformedData = Object.values(groupedData);
        transformedData = transformedData?.map((f) => {
            if (f.quantity_arr?.length !== (portion_sizes || [])?.length) {
                return {
                    ...f,
                    quantity_arr: (portion_sizes || [])?.map((item) => {
                        return {
                            macro_id: f.macro_id,
                            quantity: f.quantity ?? 1,
                            portion_size_id: item.portion_size_id,
                        };
                    }),
                };
            } else return f;
        });

        return transformedData;
    };

    const TransformQntArray = (arr) => {
        const resultMap = new Map();
        arr.forEach((item) => {
            item.arr.forEach((subItem) => {
                const { portion_size_id, value } = subItem;
                const key = `${item.id}-${portion_size_id}`;
                if (resultMap.has(key)) {
                    resultMap.set(key, resultMap.get(key) + value);
                } else {
                    resultMap.set(key, value);
                }
            });
        });
        const resultArr = [];
        resultMap.forEach((value, key) => {
            const [macro_id, portion_size_id] = key.split('-');
            resultArr.push({ macro_id, quantity: value ?? 1, portion_size_id });
        });
        return resultArr;
    };

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? 1 : 0;
        if (e.target.id == 'is_deleted') value = e.target.checked ? "0" : "1";
        runforms.current.setFieldValue(e.target.id, value);
        document.getElementById(e.target.id).checked = e.target.checked;
        if (e.target.name == 'is_auto_macro') set_is_auto_macro(e.target.checked ? 1 : 0);
    };

    const handleChange = (value, data, index) => {
        let temp = [...data];
        let temp_obj = { ...temp[index] };
        let temp_quantity_arr = [...temp_obj?.quantity_arr];
        let temp_quantity_obj = temp_quantity_arr?.find((f) => f.portion_size_id == selected_portion_size);
        let temp_quantity_ind = temp_quantity_arr?.findIndex((f) => f.portion_size_id == selected_portion_size);
        temp_quantity_obj.quantity = Number(value);
        temp_quantity_arr.splice(temp_quantity_ind, 1, temp_quantity_obj);
        Object.assign(temp_obj, { quantity_arr: temp_quantity_arr });
        temp.splice(index, 1, temp_obj);
        set_ingredient_macros(temp);
    };

    const handleChangeQuantity = (e, item, id, index) => {
        let selected_ingredients = runforms.current?.values?.sub_recipe_ingredients ?? [];
        let temp_arr = [...selected_ingredients];
        let temp_obj = { ...item };

        let temp_qnt_arr = temp_obj?.quantity_arr;
        let temp_qnt_obj = temp_qnt_arr?.find((f) => f.portion_size_id === id);
        let temp_qnt_ind = temp_qnt_arr?.findIndex((f) => f.portion_size_id === id);
        if (temp_qnt_obj) {
            temp_qnt_obj.quantity = e.target.value;
            temp_qnt_arr?.splice(temp_qnt_ind, 1, temp_qnt_obj);
        }
        temp_obj.quantity_arr = temp_qnt_arr;

        let macro_details = temp_obj.macro_values !== '' ? temp_obj.macro_values?.split(';') ?? [] : [];
        let macros_arr = [];
        for (let i = 0; i < macro_details.length; i++) {
            const detailed_arr = macro_details[i].split(':');
            const filtered = all_macros?.find((f) => f.macro_id == detailed_arr[0]);
            let final_value = temp_qnt_arr?.map((f) => {
                return {
                    ...f,
                    value: ((f.quantity ?? 1) * detailed_arr[1]) / temp_obj.base_weight,
                };
            });
            macros_arr.push({ ...filtered, value: final_value });
        }
        temp_obj.macro_details = macros_arr;

        temp_arr.splice(index, 1, temp_obj);
        runforms.current.setFieldValue('sub_recipe_ingredients', temp_arr);
        set_show_subrecipes({ ...show_subrecipes, data: temp_arr });
    };

    const handleDisplayRemove = (type, i) => {
        document.getElementById(`image-${i}`).style.display = type == 'enter' ? 'block' : 'none';
    };

    const handleImg = (e, type) => {
        let image_arr = [
            ...(runforms?.current?.values?.ingredient_image ? runforms?.current?.values?.ingredient_image : []),
        ];
        const newImageUrls = [...display_images];
        let files = [...e?.target?.files];
        let file_arr = [];

        files?.forEach((image) => {
            let make_id = Makeid(4);
            if (newImageUrls?.length <= 3) {
                newImageUrls.push({ image_name: URL.createObjectURL(image), ingredient_image_id: make_id });
                image_arr.push({ image_name: image, ingredient_image_id: make_id });
                file_arr.push({ ingredient_image_id: make_id, image_name: image });
            }
        });

        if (id && type === 'main') {
            set_edit_image_data((prevState) => ({
                ...prevState,
                mainfile: files[0],
                additionfiles: file_arr?.slice(1),
            }));
        } else if (id && type !== 'main') {
            set_edit_image_data((prevState) => ({
                ...prevState,
                additionfiles: [...(prevState?.additionfiles ?? []), ...file_arr],
            }));
        }

        runforms.current.setFieldValue('ingredient_image', image_arr);
        set_display_images(newImageUrls);
    };

    const handleDeleteImage = (id, i) => {
        let temp_arr = [...display_images];
        let image_arr = [...(runforms?.current?.values?.ingredient_image ?? [])];

        if (edit_data == 'edit') {
            set_edit_image_data((prevState) => ({
                ...prevState,
                ...(edit_image_data?.additionfiles?.length > 0 && {
                    additionfiles: edit_image_data?.additionfiles.filter((f) => f.ingredient_image_id != id),
                }),
                ...(id?.length > 4 && { remove_ingredient_image_ids: [...prevState?.remove_ingredient_image_ids, id] }),
            }));
        }

        image_arr = image_arr.filter((f) => f.ingredient_image_id != id);
        temp_arr = temp_arr.filter((f) => f.ingredient_image_id != id);
        set_display_images(temp_arr);
        runforms.current.setFieldValue('ingredient_image', image_arr);
    };

    const handleUpdateImg = (e, i) => {
        let image_arr = [...(runforms?.current?.values?.ingredient_image ?? [])];
        let display_img_arr = [...display_images];
        let make_id = Makeid(4);
        image_arr[i] = { image_name: e.target.files[0], ingredient_image_id: make_id };
        display_img_arr[i] = { image_name: URL.createObjectURL(e.target.files[0]), ingredient_image_id: make_id };
        set_display_images(display_img_arr);
        runforms.current.setFieldValue('ingredient_image', image_arr);

        if (edit_data == 'edit') {
            set_edit_image_data((prevState) => ({
                ...prevState,
                mainfile: e.target.files[0],
            }));
        }
    };

    const handleInputChange = (item, fieldName, value, index) => {
        let temp_data = runforms?.current?.values?.meal_portion_prices ?? [];
        let temp_obj = { ...item };
        temp_obj[fieldName] = value;
        temp_data?.splice(index, 1, temp_obj);
        runforms.current.setFieldValue('meal_portion_prices', temp_data);
    };

    const formatGroupLabel = (data) => (
        <div style={groupStyles}>
            <span>{data.label}</span>
        </div>
    );

    const tableCallBack = (option) => {
        set_options(option);
    };

    const toggle = (key) => {
        setTooltipOpen(tooltipOpen == key ? '' : key);
    };

    const handleSubmitForm = () => {
        document.getElementById('meal-recipes-submit').click();
    };

    const handleSubmitModal = (item, i) => {
        let id = item.ingredient_id ? 'ingredient_id' : 'sub_recipe_id';
        let selected_ingredients_ids = runforms.current?.values?.sub_recipe_ingredients?.map((f) => f[id]) ?? [];
        let selected_ingredients = runforms.current?.values?.sub_recipe_ingredients ?? [];
        let macro_details = item.macro_values !== '' ? item.macro_values?.split(';') ?? [] : [];
        let macros_arr = [];
        let temp_qnt_arr =
            item?.quantity_arr ??
            portion_sizes?.map((f) => {
                return { quantity: 1, portion_size_id: f.portion_size_id };
            }) ??
            [];

        for (let i = 0; i < macro_details.length; i++) {
            const temp_arr = macro_details[i].split(':');
            const filtered = all_macros?.find((f) => f.macro_id == temp_arr[0]);
            let final_value = temp_qnt_arr?.map((f) => {
                return {
                    ...f,
                    value: ((f.quantity ?? 1) * temp_arr[1]) / item.base_weight,
                };
            });
            macros_arr.push({ ...filtered, value: final_value });
        }

        let temp_arr = [...selected_ingredients];
        if (selected_ingredients_ids.includes(item[id])) {
            let index = temp_arr?.findIndex((f) => f[id] === item[id]);
            temp_arr.splice(index, 1);
            if (opened_drp_id == item[id]) set_opened_drp_id('');
        } else {
            temp_arr.push({ ...item, quantity_arr: temp_qnt_arr, macro_details: macros_arr });
        }

        runforms.current.setFieldValue('sub_recipe_ingredients', temp_arr);
        set_show_subrecipes({ ...show_subrecipes, data: temp_arr });
    };

    const handleSubmit = async (formData, actions) => {
        let temp_obj = { ...formData };
        set_isLoading(true);
        let api_path = '';
        let message = '';

        const form_data = new FormData();
        if (!id) {
            temp_obj.ingredient_image?.forEach((file, index) => {
                form_data.append('file', file.image_name);
            });
        } else {
            const { additionfiles, mainfile, remove_ingredient_image_ids } = edit_image_data || {};
            additionfiles?.forEach((file, index) => {
                form_data.append('additionfiles', file.image_name);
            });
            if (mainfile) form_data.append('mainfile', mainfile);
            if (remove_ingredient_image_ids)
                form_data.append('remove_ingredient_image_ids', JSON.stringify(remove_ingredient_image_ids));
        }
        delete temp_obj.ingredient_image;

        temp_obj.macro_detail = ingredient_macros.flatMap((item) =>
            (item.quantity_arr || []).map((f) => ({
                macro_id: f.macro_id,
                quantity: f.quantity ?? 1,
                portion_size_id: f.portion_size_id,
            }))
        );

        let sub_recipe_ingredients = temp_obj.sub_recipe_ingredients.flatMap((item) =>
            (item.quantity_arr || []).map((f) => ({
                ingredient_id: item[item.ingredient_id ? 'ingredient_id' : 'sub_recipe_id'],
                quantity: f.quantity ?? 1,
                ingredient_type: item.type,
                portion_size_id: f.portion_size_id,
            }))
        );
        temp_obj.sub_recipe_ingredients = sub_recipe_ingredients;
        temp_obj.ingredientcategoryids = temp_obj.ingredientcategoryids?.map((f) => f.value);

        if (edit_data == 'edit') {
            api_path = API_PATH.editMealRecipes;
            message = 'Meal Recipe updated successfully';
            form_data.append('ingredient_id', temp_obj.ingredient_id);
            delete temp_obj.ingredient_id;
        } else {
            api_path = API_PATH.addMealRecipes;
            message = 'Meal Recipe added successfully';
        }

        form_data.append('props', JSON.stringify(temp_obj));

        if (api_path != '') {
            const response = await PostApi(api_path, form_data);
            if (response.statusCode === 200) {
                toast.success(message);
                navigate('/admin/kitchen-ordering/meal-recipes');
            }
            set_isLoading(false);
        }
    };

    const handleButtonClick = () => {
        const element = document.getElementById('meal-prep-id');
        if (element) {
            element.scrollIntoView({
                // block: "center",
                behavior: 'smooth'
            });
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center">
                            <span
                                className="d-flex align-items-center p-0 me-3 cursor-pointer"
                                onClick={() => navigate('/admin/kitchen-ordering/meal-recipes')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data == 'edit' ? 'Edit' : 'Add'} Meal Recipes</h4>
                            <div className="ms-auto">
                                {
                                    edit_data === 'edit' && (
                                        <>
                                            <button type="button" className="btn btn-dark me-2">
                                                Print labels
                                            </button>
                                            <button type="button" className="btn btn-dark me-2" onClick={() => navigate(`/admin/kitchen-ordering/add-meal-recipes`, { state: { data: initialValues?.ingredient_id } })}>
                                                Clone
                                            </button>
                                        </>
                                    )
                                }
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
                                display_name: Yup.string().max(100, 'must be less than 100 characters').required('Please Enter Name'),
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
                                                    {display_images?.length > 0 ? (
                                                        <>
                                                            <div className="file-preview">
                                                                <div className="d-flex flex-wrap align-items-center">
                                                                    {display_images?.map((item, i) => {
                                                                        if (i <= 3) {
                                                                            return (
                                                                                // code for +more images
                                                                                // <div className={`multi-file-upld-imgs  ${i == 0 ? 'col-12' : 'col-4 mt-1 border-start border-end'} ${display_images?.length > 4 && i == 3 ? 'position-relative' : ''}`}>
                                                                                //     <img key={i} src={item} />
                                                                                // {display_images?.length > 4 && i == 3 && <span className='img-greater-4 d-flex align-items-center justify-content-center'><bdi className='text-white fs-2'>+{display_images?.length - 3}</bdi></span>}
                                                                                // </div>
                                                                                <div
                                                                                    className={`multi-file-upld-imgs position-relative  ${i == 0 ? 'col-12' : 'col-4 mt-1 border-start border-end'
                                                                                        }`}
                                                                                    onMouseEnter={() => {
                                                                                        i != 0 && handleDisplayRemove('enter', i);
                                                                                    }}
                                                                                    onMouseLeave={() => {
                                                                                        i != 0 && handleDisplayRemove('leave', i);
                                                                                    }}
                                                                                    key={item.ingredient_image_id}
                                                                                >
                                                                                    <span className="file-area-pls text-center col-4 h-100 w-100 d-block">
                                                                                        <img
                                                                                            key={i}
                                                                                            src={item.image_name ?? Placeholder}
                                                                                            onError={(e) => (e.target.src = Placeholder)}
                                                                                        />
                                                                                        {i == 0 && (
                                                                                            <input
                                                                                                type="file"
                                                                                                name="ingredient_image"
                                                                                                accept="image/*"
                                                                                                onChange={(e) => handleUpdateImg(e, i)}
                                                                                            />
                                                                                        )}
                                                                                    </span>
                                                                                    {i != 0 && (
                                                                                        <span
                                                                                            className="position-absolute top-0 end-0 m-1 cursor-pointer"
                                                                                            id={`image-${i}`}
                                                                                            style={{ display: 'none' }}
                                                                                            onClick={() => handleDeleteImage(item.ingredient_image_id, i)}
                                                                                        >
                                                                                            <i
                                                                                                className={`bx bx-minus-circle text-danger ${i == 0 ? 'fs-3' : 'fs-4'}`}
                                                                                            ></i>
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        }
                                                                    })}
                                                                    {display_images?.length <= 3 && (
                                                                        <span className="file-area-pls text-center col-4">
                                                                            <i className="bx bx-plus-circle position-relative fs-3">
                                                                                <input
                                                                                    type="file"
                                                                                    name="ingredient_image"
                                                                                    accept="image/*"
                                                                                    multiple
                                                                                    onChange={(e) => handleImg(e, 'additional')}
                                                                                />
                                                                            </i>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="file-selecter text-center position-relative">
                                                            <div className="file-area position-relative">
                                                                <input
                                                                    type="file"
                                                                    name="ingredient_image"
                                                                    accept="image/*"
                                                                    multiple
                                                                    onChange={(e) => handleImg(e, 'main')}
                                                                />
                                                                <div className="file-dummy">
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
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-8">
                                                <div className="row">
                                                    <div className="col-sm-6 mb-1">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_chef_fav"
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className="form-check-label d-flex align-items-center" htmlFor="is_chef_fav">
                                                                Chef's Favorite
                                                                <div id="Tooltip-is_chef_fav" className="d-inline-flex">
                                                                    <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                                </div>
                                                                <Tooltip
                                                                    isOpen={tooltipOpen == 'is_chef_fav'}
                                                                    placement={'right'}
                                                                    target="Tooltip-is_chef_fav"
                                                                    toggle={() => toggle('is_chef_fav')}
                                                                >
                                                                    Add Chef's Favorite tag to this meal.
                                                                </Tooltip>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 mb-1">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_new"
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className="form-check-label d-flex align-items-center" htmlFor="is_new">
                                                                New Item
                                                                <div id="Tooltip-is_new" className="d-inline-flex">
                                                                    <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                                </div>
                                                                <Tooltip
                                                                    isOpen={tooltipOpen == 'is_new'}
                                                                    placement={'right'}
                                                                    target="Tooltip-is_new"
                                                                    toggle={() => toggle('is_new')}
                                                                >
                                                                    Add New Item tag to this meal.
                                                                </Tooltip>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 mb-3">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_deleted"
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label className="form-check-label d-flex align-items-center" htmlFor="is_deleted">
                                                                Is Active?
                                                                <div id="Tooltip-is_deleted" className="d-inline-flex">
                                                                    <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                                </div>
                                                                <Tooltip
                                                                    isOpen={tooltipOpen == 'is_deleted'}
                                                                    placement={'right'}
                                                                    target="Tooltip-is_deleted"
                                                                    toggle={() => toggle('is_deleted')}
                                                                >
                                                                    Set this meal active or not.
                                                                </Tooltip>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 mb-3">
                                                        <div className="form-check form-switch form-switch-md">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="should_show_ratings"
                                                                onChange={handleChangeSwitch}
                                                            />
                                                            <label
                                                                className="form-check-label d-flex align-items-center"
                                                                htmlFor="should_show_ratings"
                                                            >
                                                                Show Ratings?
                                                                <div id="Tooltip-should_show_ratings" className="d-inline-flex">
                                                                    <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                                </div>
                                                                <Tooltip
                                                                    isOpen={tooltipOpen == 'should_show_ratings'}
                                                                    placement={'right'}
                                                                    target="Tooltip-should_show_ratings"
                                                                    toggle={() => toggle('should_show_ratings')}
                                                                >
                                                                    Show this meal ratings or not.
                                                                </Tooltip>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <div className="d-flex">
                                                            <label>Display Name</label>
                                                            <span className="priority-tags ms-2 px-2">
                                                                {runform?.values?.display_name?.length} characters - max: 100
                                                            </span>
                                                        </div>
                                                        <input
                                                            className="form-control"
                                                            name="display_name"
                                                            type="text"
                                                            placeholder="Enter the name of the meal"
                                                            {...formAttr(runform, 'display_name')}
                                                        />
                                                        {errorContainer(runform, 'display_name')}
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label>Internal Name (Only for Admin)</label>
                                                        <input
                                                            className="form-control"
                                                            name="internal_name"
                                                            type="text"
                                                            placeholder="Enter the internal name of the meal"
                                                            {...formAttr(runform, 'internal_name')}
                                                        />
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label>Categories</label>
                                                        {isLoading ? (
                                                            <span className="form-select p-1">
                                                                <SelectLoader />
                                                            </span>
                                                        ) : (
                                                            <Select
                                                                isMulti
                                                                value={runform.values?.ingredientcategoryids ?? []}
                                                                options={meal_categories ?? []}
                                                                formatGroupLabel={formatGroupLabel}
                                                                onChange={(e) => {
                                                                    runforms.current.setFieldValue('ingredientcategoryids', e);
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="d-flex align-items-center">
                                                            Default Meal Expiration: 5 days
                                                            <div id="Tooltip-meal_expiration_days" className="d-inline-flex">
                                                                <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'meal_expiration_days'}
                                                                placement={'right'}
                                                                target="Tooltip-meal_expiration_days"
                                                                toggle={() => toggle('meal_expiration_days')}
                                                            >
                                                                Enter a number to change the expiration day range for this meal on any meal label.
                                                                Otherwise it will pull the default expiration date which can be edited in label
                                                                settings.
                                                            </Tooltip>
                                                        </label>
                                                        <input
                                                            className="form-control"
                                                            name="meal_expiration_days"
                                                            type="text"
                                                            placeholder="Edit Meal Expiration on Label"
                                                            {...formAttr(runform, 'meal_expiration_days')}
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="d-flex align-items-center">
                                                            Net Weight (LB)
                                                            <div id="Tooltip-net_weight" className="d-inline-flex">
                                                                <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'net_weight'}
                                                                placement={'right'}
                                                                target="Tooltip-net_weight"
                                                                toggle={() => toggle('net_weight')}
                                                            >
                                                                Net weight is the weight of an item/product without the addition of the packaging or
                                                                container weight. Net weight is also the weight of the total number of goods loaded into
                                                                a container excluding the weight of the container.
                                                            </Tooltip>
                                                        </label>
                                                        <input
                                                            className="form-control"
                                                            name="net_weight"
                                                            type="text"
                                                            placeholder="Enter the Net Weight"
                                                            {...formAttr(runform, 'net_weight')}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3 align-items-center bg-light py-3 rounded shadow-sm m-2">
                                        <span className="heading-main-span">Description</span>
                                        <div className="row mx-2" id="meal-prep-id">
                                            <div className="col-md-12 mb-3">
                                                <textarea
                                                    className="form-control"
                                                    name="meal_description"
                                                    placeholder="Describe the meal. Should be short..."
                                                    {...formAttr(runform, 'meal_description')}
                                                ></textarea>
                                            </div>
                                        </div>
                                        <span className="heading-main-span">Prices</span>
                                        <div className="mx-3 mb-3">
                                            <button type="button" className="btn btn-success" onClick={handleButtonClick}>
                                                Meal Prep
                                            </button>
                                        </div>
                                        <div className="mx-2 portions-head-tbl">
                                            <table className="w-100">
                                                <thead>
                                                    <tr className="portions-head-row">
                                                        <th></th>
                                                        <th>
                                                            <label className="d-flex align-items-center">
                                                                Meal Prep Price
                                                                <div id="Tooltip-regular_meal_prep_price" className="d-inline-flex">
                                                                    <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                                </div>
                                                                <Tooltip
                                                                    isOpen={tooltipOpen == 'regular_meal_prep_price'}
                                                                    placement={'right'}
                                                                    target="Tooltip-regular_meal_prep_price"
                                                                    toggle={() => toggle('regular_meal_prep_price')}
                                                                >
                                                                    Current selling price
                                                                </Tooltip>
                                                            </label>
                                                        </th>
                                                        <th>
                                                            <label>Surcharge</label>
                                                        </th>
                                                        <th>
                                                            <label className="d-flex align-items-center">
                                                                Regular Price
                                                                <div id="Tooltip-regular_price" className="d-inline-flex">
                                                                    <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                                </div>
                                                                <Tooltip
                                                                    isOpen={tooltipOpen == 'regular_price'}
                                                                    placement={'right'}
                                                                    target="Tooltip-regular_price"
                                                                    toggle={() => toggle('regular_price')}
                                                                >
                                                                    This will show as strikethrough to the client, use only if you want to show that the
                                                                    price used to be higher than the current selling price.
                                                                </Tooltip>
                                                            </label>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {portion_sizes?.map((item) => {
                                                        if (item.is_default == 1)
                                                            return (
                                                                <tr key={item.portion_size_id}>
                                                                    <td>
                                                                        <div className="text-center fw-medium">{item.portion_size_name}</div>
                                                                    </td>
                                                                    <td>
                                                                        <input
                                                                            className="form-control"
                                                                            name="regular_meal_prep_price"
                                                                            type="number"
                                                                            placeholder="Enter Meal Prep Price"
                                                                            {...formAttr(runform, 'regular_meal_prep_price')}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <input
                                                                            className="form-control"
                                                                            name="regular_meal_surcharge"
                                                                            type="number"
                                                                            placeholder="Enter Surcharge"
                                                                            {...formAttr(runform, 'regular_meal_surcharge')}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <input
                                                                            className="form-control"
                                                                            name="regular_price"
                                                                            type="number"
                                                                            placeholder="Enter Regular Price"
                                                                            {...formAttr(runform, 'regular_price')}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            );
                                                    })}

                                                    <tr className="grey-bg-cls portions-body-row">
                                                        <th className="text-center">
                                                            <label>Portions</label>
                                                        </th>
                                                        <th>
                                                            <label className="d-flex align-items-centers">
                                                                Upgrade Price
                                                                <div id="Tooltip-upgrade_price" className="d-inline-flex">
                                                                    <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                                </div>
                                                                <Tooltip
                                                                    isOpen={tooltipOpen == 'upgrade_price'}
                                                                    placement={'right'}
                                                                    target="Tooltip-upgrade_price"
                                                                    toggle={() => toggle('upgrade_price')}
                                                                >
                                                                    Enter the price increase from a Regular to this portion. For example if you’re regular
                                                                    price is $10 and you want large to be $12 the upgrade price is $2. If you want the XL
                                                                    to be $14 then the upgrade price is $4.
                                                                </Tooltip>
                                                            </label>
                                                        </th>
                                                        <th>
                                                            <label className="d-flex align-items-center">
                                                                Surcharge
                                                                <div id="Tooltip-surcharge" className="d-inline-flex">
                                                                    <i className="bx bxs-help-circle fs-5 cursor-pointer px-1"></i>
                                                                </div>
                                                                <Tooltip
                                                                    isOpen={tooltipOpen == 'surcharge'}
                                                                    placement={'right'}
                                                                    target="Tooltip-surcharge"
                                                                    toggle={() => toggle('surcharge')}
                                                                >
                                                                    The surcharge is an additional charge added to a meal for Meal Packs and Meal Plans.
                                                                    Since those rates are fixed based on the # of meals delivered. Meals added with a
                                                                    surcharge rate will cost extra. For example a pack of 10 meals costs $100. If they add
                                                                    this meal with a $5 surcharge the pack will cost $105. **Please note. The system will
                                                                    not auto-choose or randomly select meals that have a surcharge.**
                                                                </Tooltip>
                                                            </label>
                                                        </th>
                                                        <th>
                                                            <label>Active</label>
                                                        </th>
                                                    </tr>
                                                    {runform?.values?.meal_portion_prices?.map((item, i) => {
                                                        let obj = portion_sizes?.find((f) => f.portion_size_id == item.portion_size_id);
                                                        return (
                                                            <tr key={item.portion_size_id}>
                                                                <td>
                                                                    <div className="text-center fw-medium">{obj?.portion_size_name}</div>
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        className="form-control"
                                                                        name={`upgrade_price_${item.portion_size_id}`}
                                                                        type="number"
                                                                        placeholder="Enter Upgrade Price"
                                                                        value={item?.upgrade_price}
                                                                        onChange={(e) => handleInputChange(item, 'upgrade_price', e.target.value, i)}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        className="form-control"
                                                                        name={`surcharge_${item.portion_size_id}`}
                                                                        type="number"
                                                                        placeholder="Enter Surcharge"
                                                                        value={item?.surcharge}
                                                                        onChange={(e) => handleInputChange(item, 'surcharge', e.target.value, i)}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <div className="form-check form-switch form-switch-md">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-check-input"
                                                                            id={`active_${item.portion_size_id}`}
                                                                            defaultChecked={item?.is_active == 1}
                                                                            onChange={(e) =>
                                                                                handleInputChange(item, 'is_active', e.target.checked ? 1 : 0, i)
                                                                            }
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <span className="heading-main-span">Information</span>
                                        <div className="row mx-2 modal-creation-reason">
                                            <div className="mb-3">
                                                <label>Heating Instructions</label>
                                                <textarea
                                                    className="form-control"
                                                    name="meal_heating_instruction"
                                                    rows={5}
                                                    placeholder="Enter Heating Instructions Here..."
                                                    {...formAttr(runform, 'meal_heating_instruction')}
                                                ></textarea>
                                            </div>
                                            <div className="mb-3">
                                                <label>Packaging Instructions</label>
                                                <textarea
                                                    className="form-control"
                                                    name="meal_packaging_instruction"
                                                    rows={5}
                                                    placeholder="Instructions for the plating team."
                                                    {...formAttr(runform, 'meal_packaging_instruction')}
                                                ></textarea>
                                            </div>
                                            <div className="mb-3">
                                                <label>Cooking Instructions</label>
                                                <textarea
                                                    className="form-control"
                                                    name="cooking_instructions"
                                                    rows={5}
                                                    placeholder="Instructions for the Chef."
                                                    {...formAttr(runform, 'cooking_instructions')}
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="row me-2">
                                            <div className="col-lg-6">
                                                <span className="heading-main-span mb-5">Build this Meal (Prod. Price:$0.00)</span>
                                                <div className="ms-3 accordian-sub-rcp">
                                                    <Accordion
                                                        open={opened_drp_id}
                                                        toggle={(e) => set_opened_drp_id(opened_drp_id !== '' && opened_drp_id === e ? '' : e)}
                                                    >
                                                        {runform.values?.sub_recipe_ingredients?.map((item, index) => {
                                                            let id = item.ingredient_id ? 'ingredient_id' : 'sub_recipe_id';
                                                            let selectedQuantity = item?.quantity_arr?.find(
                                                                (f) => f.portion_size_id == selected_portion_size
                                                            );
                                                            return (
                                                                <AccordionItem key={index} className="mb-2">
                                                                    <AccordionHeader targetId={item?.[id]}>
                                                                        <span className="me-2 fw-medium">{item.display_name}</span>
                                                                        <bdi className="fw-light">
                                                                            ({selectedQuantity?.quantity} {item.unit_short_name})
                                                                        </bdi>
                                                                    </AccordionHeader>
                                                                    <AccordionBody accordionId={item?.[id]}>
                                                                        {/* Your existing code */}
                                                                        <span className="bg-light d-block rounded ps-2 py-2 mx-3 my-3">Meal Prep</span>
                                                                        <div className="row mx-3">
                                                                            {portion_sizes?.map((obj) => {
                                                                                let quantity = item?.quantity_arr?.find(
                                                                                    (f) => f.portion_size_id == obj.portion_size_id
                                                                                );
                                                                                return (
                                                                                    <div className="col-md-3" key={obj.portion_size_id}>
                                                                                        <label className="fw-normal">{obj.portion_size_name}</label>
                                                                                        <div className="d-flex align-items-center">
                                                                                            <input
                                                                                                className="form-control border-top-0 border-start-0 border-end-0 rounded-0 ps-0 me-2"
                                                                                                name={obj.portion_size_name}
                                                                                                type="number"
                                                                                                placeholder="Enter Quantity"
                                                                                                onChange={(e) =>
                                                                                                    handleChangeQuantity(e, item, obj.portion_size_id, index)
                                                                                                }
                                                                                                value={quantity?.quantity}
                                                                                            />
                                                                                            {item.unit_short_name}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                        <div className="my-2 px-4">
                                                                            {item.macro_details?.map((f, i) => {
                                                                                let value = f.value?.find((f) => f.portion_size_id == selected_portion_size);
                                                                                return (
                                                                                    <span key={f.macro_id || i}>
                                                                                        <bdi className="fw-medium">{f.macro_name}: </bdi>
                                                                                        {value?.value} {f.suffix}
                                                                                        {i !== item.macro_details?.length - 1 && ', '}
                                                                                    </span>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                        <div className="accordian-ftr-sub-rcp">
                                                                            <span className="cursor-pointer">
                                                                                <a
                                                                                    href={`/admin/kitchen-ordering/edit-${item.type == 2 ? 'sub-recipes' : 'ingredients'
                                                                                        }/${item?.[id]}`}
                                                                                    target="_blank"
                                                                                >
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
                                                                        {/* End of your existing code */}
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
                                                    Add Ingredient or Sub-Recipe
                                                </span>
                                            </div>
                                            <div className="col-lg-6" style={{ marginTop: '55px' }}>
                                                <div className="d-flex justify-content-between">
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
                                                    <div className="mb-2">
                                                        <select
                                                            className="form-select"
                                                            name="portion_size_id"
                                                            onChange={(e) => set_selected_portion_size(e.target.value)}
                                                            value={selected_portion_size}
                                                        >
                                                            {portion_sizes?.map((obj) => (
                                                                <option value={obj.portion_size_id} key={obj.portion_size_id}>
                                                                    {obj.portion_size_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="ingredients-tbl">
                                                    <DataTable
                                                        data={ingredient_macros}
                                                        options={options}
                                                        tableCallBack={tableCallBack}
                                                        columns={columns}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-success m-2 d-none" id="meal-recipes-submit">
                                        {runform.isSubmitting ? <IconLoader /> : 'SAVE'}
                                    </button>
                                </form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>

            <SubRecipeModal
                states={{
                    show_subrecipes,
                    set_show_subrecipes,
                }}
                functions={{ handleSubmitModal }}
            />
        </React.Fragment>
    );
}
