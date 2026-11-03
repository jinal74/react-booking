import React, { useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../../helpers/func_helper';
import { useNavigate, useParams } from 'react-router-dom';
import FileIco from '../../../assets/images/cloud-arrow-up2.svg';
import { toast } from 'react-toastify';
import { API_PATH } from '../../../constants/const';
import { PostApi } from '../../../../services/ApiService';
import Loader from '../../../Loader/Loader';
import { IconLoader, SelectLoader } from '../../../Loader/IconLoader';

export default function AddEditMealPacks() {
    const runforms = useRef();
    const navigate = useNavigate();
    const { id } = useParams();

    const sum = runforms?.current?.values?.meals_per_meal_category?.reduce((acc, item) => acc + parseInt(item.quantity), 0);

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [load_data, set_load_data] = useState(false);
    const [is_Loading, set_isLoading] = useState(false);
    const [displayStyle, setDisplayStyle] = useState('none');
    const [portion_sizes, set_portion_sizes] = useState([]);
    const [edit_data, set_edit_data] = useState(false);
    const [initialValues, set_initialValues] = useState({
        meal_pack_image: null,
        meal_pack_name: '',
        meal_pack_description: '',
        number_of_meals: '',
        portion_size_id: '',
        selling_price: '',
        regular_price: '',
        is_active: '1',
        meals_per_meal_category: [],
    });

    useEffect(() => {
        GetAllPortionSize();
    }, []);

    useEffect(() => {
        if (id) {
            set_edit_data(true);
            GetMealPacksById(id);
        } else {
            GetMealCategories();
        }
    }, [id]);

    const GetMealPacksById = async (id) => {
        set_load_data(true);
        const response = await PostApi(API_PATH.mealpackById, { meal_pack_id: id });
        if (response.statusCode === 200) {
            let data = response.data;
            set_initialValues({
                meal_pack_id: data.meal_pack_id,
                meal_pack_name: data.meal_pack_name,
                meal_pack_description: data.meal_pack_description,
                number_of_meals: data.number_of_meals,
                portion_size_id: data.portion_size_id,
                selling_price: data.selling_price,
                regular_price: data.regular_price > 0 ? data.regular_price : '',
                is_active: data.is_active,
                meals_per_meal_category: data.meals_per_meal_category,
                meal_pack_image: data.meal_pack_image,
            });

            setTimeout(() => {
                if (data.meal_pack_image) {
                    let img = document.getElementById('sub-recipes-img');
                    img.className = 'w-100 h-100';
                    img.src = data.meal_pack_image;
                    document.getElementById('upload-image-area').style.display = 'none';
                }
            }, 200);
        }
        set_load_data(false);
    };

    const GetAllPortionSize = async () => {
        setIsLoading(true);
        const response = await PostApi(API_PATH.getActivePortionSize);
        if (response.statusCode === 200) {
            setIsLoading(false);
            set_portion_sizes(response.data ?? []);
            if (!id) runforms?.current?.setFieldValue('portion_size_id', response.data?.[0]?.portion_size_id);
        }
        setIsLoading(false);
    };

    const GetMealCategories = async () => {
        setIsLoadingData(true);
        const response = await PostApi(API_PATH.getMealCategories, { type: 'all' });
        if (response.statusCode === 200) {
            setIsLoadingData(false);
            let temp_data = response.data.data_result?.map((item) => ({
                meal_category_name: item.meal_category_name,
                meal_category_id: item.meal_category_id,
                quantity: 0,
            }));
            runforms?.current?.setFieldValue('meals_per_meal_category', temp_data);
        }
        setIsLoadingData(false);
    };

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? '1' : '0';
        runforms.current.setFieldValue(e.target.name, value);
        document.getElementById(e.target.id).checked = e.target.checked;
    };

    const handleChange = (value, index) => {
        let temp_arr = [...runforms.current?.values?.meals_per_meal_category];
        let temp_obj = temp_arr[index];
        temp_obj.quantity = value;
        temp_arr.splice(index, 1, temp_obj);
        runforms.current.setFieldValue('meals_per_meal_category', temp_arr);
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
                    runforms.current.setFieldValue('meal_pack_image', file);
                    document.getElementById('upload-image-area').style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSubmitForm = () => {
        document.getElementById('meal-packs-submit').click();
    };

    const handleSubmit = async (formData, actions) => {
        set_isLoading(true);
        const simplifiedMeals = formData.meals_per_meal_category.map((item) => ({
            meal_category_id: item.meal_category_id,
            quantity: item.quantity,
        }));

        if (sum === 0 || sum === formData?.number_of_meals) {
            setDisplayStyle('none');
            const form_data = new FormData();
            if (typeof formData.meal_pack_image !== 'string') {
                form_data.append('mealpack_image', formData.meal_pack_image);
            }
            delete formData.meal_pack_image;

            formData.meals_per_meal_category = simplifiedMeals;
            form_data.append('props', JSON.stringify(formData));

            let api_path = '';
            let message = '';

            if (edit_data) {
                api_path = API_PATH.updateMealPack;
                message = 'Meal Pack updated successfully';
            } else {
                api_path = API_PATH.addMealPack;
                message = 'Meal Pack added successfully';
            }

            if (api_path != '') {
                const response = await PostApi(api_path, form_data);
                if (response.statusCode === 200) {
                    toast.success(message);
                    navigate('/admin/kitchen-settings/meal-packs');
                    set_edit_data(null);
                }
            }
        } else {
            setDisplayStyle('block');
        }
        set_isLoading(false);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row meal-packs-main">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center">
                            <span
                                className="d-flex align-items-center p-0 me-3 cursor-pointer"
                                onClick={() => navigate('/admin/kitchen-settings/meal-packs')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data ? 'Edit' : 'Add'} Meal Packs</h4>
                            <div className="ms-auto">
                                <button type="submit" className="btn btn-success" onClick={handleSubmitForm}>
                                    {is_Loading ? <IconLoader /> : 'Submit'}
                                </button>
                            </div>
                        </div>
                        <span id="meals-each-type" className="purchase-pickup-cls" style={{ display: displayStyle }}>
                            Number of Meals ({runforms?.current?.values?.number_of_meals}) not equal to the sum of categories you
                            selected ({sum})
                        </span>
                    </div>
                    <div className="col-12">
                        {load_data ? (
                            <Loader />
                        ) : (
                            <Formik
                                innerRef={runforms}
                                enableReinitialize
                                initialValues={initialValues}
                                validationSchema={Yup.object({
                                    meal_pack_name: Yup.string().required('Please enter meal pack name'),
                                    number_of_meals: Yup.number().required('Please enter number of meals'),
                                    ...(runforms.current?.values?.regular_price !== '' ? {
                                        selling_price: Yup.number()
                                            .lessThan(Yup.ref('regular_price'), 'Selling price must be less than regular price')
                                            .required('Please enter selling price'),
                                    } : {
                                        selling_price: Yup.number().required('Please enter selling price'),
                                    }),
                                })}
                                onSubmit={(values, actions) => {
                                    handleSubmit(values, actions);
                                }}
                            >
                                {(runform) => (
                                    <form onSubmit={runform.handleSubmit}>
                                        <div className="row mb-3 align-items-center bg-light py-3 rounded shadow-sm m-2">
                                            <div className="col-md-4">
                                                <div className="upload-file-dash-new position-relative">
                                                    <div className="file-selecter text-center position-relative">
                                                        <div className="file-area position-relative">
                                                            <input
                                                                type="file"
                                                                name="meal_pack_image"
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
                                                    <div className="col-md-8 mb-3">
                                                        <label>Name</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="meal_pack_name"
                                                                type="text"
                                                                placeholder="Enter meal pack name"
                                                                {...formAttr(runform, 'meal_pack_name')}
                                                            />
                                                            {errorContainer(runform, 'meal_pack_name')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <div className="form-check form-switch form-switch-md mb-3">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="is_active"
                                                                defaultChecked={runform.values.is_active == '1'}
                                                                onChange={handleChangeSwitch}
                                                                name="is_active"
                                                            />
                                                            <label className="form-check-label" htmlFor="is_active">
                                                                Is Active?
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label>Description</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="meal_pack_description"
                                                                type="text"
                                                                placeholder="Enter meal pack description"
                                                                {...formAttr(runform, 'meal_pack_description')}
                                                            />
                                                            {errorContainer(runform, 'meal_pack_description')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label>Number of Meals</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="number_of_meals"
                                                                type="number"
                                                                placeholder="Enter number of meals"
                                                                {...formAttr(runform, 'number_of_meals')}
                                                            />
                                                            {errorContainer(runform, 'number_of_meals')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label>Portion Size</label>
                                                        <div>
                                                            {isLoading ? (
                                                                <span className="form-select p-1">
                                                                    <SelectLoader />
                                                                </span>
                                                            ) : (
                                                                <select
                                                                    className="form-select"
                                                                    name="portion_size_id"
                                                                    {...formAttr(runform, 'portion_size_id')}
                                                                >
                                                                    {portion_sizes?.map((item) => (
                                                                        <option key={item.portion_size_id} value={item.portion_size_id}>
                                                                            {item.portion_size_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                            {errorContainer(runform, 'portion_size_id')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label>Selling Price (Required)</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="selling_price"
                                                                type="number"
                                                                placeholder="Enter selling price"
                                                                {...formAttr(runform, 'selling_price')}
                                                            />
                                                            {errorContainer(runform, 'selling_price')}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label>Regular Price</label>
                                                        <div>
                                                            <input
                                                                className="form-control"
                                                                name="regular_price"
                                                                type="number"
                                                                placeholder="Insert the regular value if the item is with discount"
                                                                {...formAttr(runform, 'regular_price')}
                                                            />
                                                            {errorContainer(runform, 'regular_price')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row mb-3 align-items-center bg-light py-3 rounded shadow-sm m-2">
                                            <span className="fw-medium">How many meals of each type?</span>
                                            <p className="fw-light">
                                                If you'd like your pack combo to be a specific preference, please make the number equal to the
                                                total number of meals you entered above. If the customer can select any option leave the section
                                                below as is.
                                            </p>
                                            {isLoadingData ? (
                                                <SelectLoader />
                                            ) : (
                                                runform?.values?.meals_per_meal_category?.map((item, i) => {
                                                    return (
                                                        <div className="col-md-3 mb-3" key={item.meal_category_id}>
                                                            <label>{item.meal_category_name}</label>
                                                            <div>
                                                                <input
                                                                    className="form-control"
                                                                    type="number"
                                                                    placeholder={`Enter ${item.meal_category_name}`}
                                                                    value={item.quantity}
                                                                    onChange={(e) => handleChange(Number(e.target.value === '' ? 0 : e.target.value), i)}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                        <div className="d-none">
                                            <button type="submit" id="meal-packs-submit">
                                                Submit
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </Formik>
                        )}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
