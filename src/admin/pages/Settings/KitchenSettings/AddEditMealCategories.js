import React, { useEffect, useRef, useState, useContext } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../../helpers/func_helper';
import { useParams, useNavigate } from 'react-router-dom';
import { PostApi } from '../../../../services/ApiService';
import { API_PATH } from '../../../constants/const';
import { SettingsStore } from '../../../context/SettingsContext';
import { toast } from 'react-toastify';
import { IconLoader, SelectLoader } from '../../../Loader/IconLoader';
import { Tooltip } from 'reactstrap';
import FileIco from '../../../assets/images/cloud-arrow-up2.svg';

export default function AddEditMealCategories() {
    const runforms = useRef();
    const { id } = useParams();
    const navigate = useNavigate();
    const context = useContext(SettingsStore);

    const [isLoading, set_isLoading] = useState(false);
    const [meal_cat_group, set_meal_cat_group] = useState([]);
    const [edit_data, set_edit_data] = useState('add');
    const [initialValues, set_initialValues] = useState({
        meal_category_image: null,
        meal_category_name: '',
        meal_category_order: 0,
        meal_category_group_id: '',
        meal_category_description: '',
        bg_color: '#f2f2f2',
        text_color: '#000000',
        meal_category_tag: '',
        show_diet_category_on_profile: 0,
        show_on_website: 0,
        show_in_header: 0,
        show_on_anchor: 0,
        show_in_labels: 0,
    });
    const [tooltipOpen, setTooltipOpen] = useState('');

    const toggle = (key) => {
        setTooltipOpen(tooltipOpen == key ? '' : key);
    }

    useEffect(() => {
        if (id) FetchEditData(id);
    }, [id]);

    useEffect(() => {
        if (!context?.meal_category_groups) {
            context.GetMealCategoriesGroup();
        }
    }, []);

    useEffect(() => {
        set_meal_cat_group(context.meal_category_groups ?? []);
    }, [context]);

    const FetchEditData = async (meal_category_id) => {
        const response = await PostApi(API_PATH.getMealCategoriesById, { meal_category_id });
        if (response.statusCode === 200) {
            let data = response.data[0];
            set_edit_data('edit');
            set_initialValues({
                meal_category_id: data.meal_category_id,
                meal_category_image: data.meal_category_image,
                meal_category_name: data.meal_category_name,
                meal_category_order: data.meal_category_order,
                meal_category_group_id: data.meal_category_group_id,
                meal_category_description: data.meal_category_description,
                bg_color: data.bg_color,
                text_color: data.text_color,
                meal_category_tag: data.meal_category_tag,
                show_diet_category_on_profile: data.show_diet_category_on_profile,
                show_on_website: data.show_on_website,
                show_in_header: data.show_in_header,
                show_on_anchor: data.show_on_anchor,
                show_in_labels: data.show_in_labels,
            });
            document.getElementById('show_diet_category_on_profile').checked = data.show_diet_category_on_profile == 1;
            document.getElementById('show_on_website').checked = data.show_on_website == 1;
            document.getElementById('show_in_header').checked = data.show_in_header == 1;
            document.getElementById('show_on_anchor').checked = data.show_on_anchor == 1;
            document.getElementById('show_in_labels').checked = data.show_in_labels == 1;

            if (data.meal_category_image) {
                let img = document.getElementById('meal-category-img');
                img.className = 'w-100 h-100';
                img.src = data.meal_category_image;
                document.getElementById('upld-img-area').style.display = 'none';
            }
        }
    }

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? 1 : 0;
        runforms.current.setFieldValue(e.target.id, value);
        document.getElementById(e.target.id).checked = e.target.checked;
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
            let img = document.getElementById('meal-category-img');
            if (file && file != '') {
                let reader = new FileReader();
                reader.onload = function () {
                    img.className = 'w-100 h-100';
                    img.src = reader.result;
                    runforms.current.setFieldValue('meal_category_image', file);
                    document.getElementById('upld-img-area').style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSubmitForm = () => {
        document.getElementById('meal-categories-submit').click();
    };

    const handleSubmit = async (formData, actions) => {
        set_isLoading(true);
        let api_path = '';
        let message = '';

        const form_data = new FormData()
        if (formData.meal_category_image) {
            if (typeof formData.meal_category_image !== 'string') form_data.append('file', formData.meal_category_image);
            // delete formData.meal_category_image;
        }

        if (edit_data == 'edit') {
            api_path = API_PATH.editMealCategories;
            message = 'Meal category updated successfully';
            form_data.append('meal_category_id', formData.meal_category_id);
            // delete formData.meal_category_id;
        } else {
            api_path = API_PATH.addMealCategories;
            message = 'Meal category added successfully';
        }

        form_data.append('props', JSON.stringify(formData));

        if (api_path != '') {
            const response = await PostApi(api_path, form_data);
            if (response.statusCode === 200) {
                toast.success(message);
                navigate('/admin/kitchen-settings/meal-categories');
                set_edit_data(null)
            }
            set_isLoading(false);
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
                                onClick={() => navigate('/admin/kitchen-settings/meal-categories')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{edit_data == 'edit' ? 'Edit' : 'Add'} Meal Categories</h4>
                            <div className="ms-auto">
                                <button type="submit" className="btn btn-success" onClick={handleSubmitForm}>
                                    {isLoading ? <IconLoader /> : 'Submit'}
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
                                meal_category_name: Yup.string().required('Please Enter Name'),
                                meal_category_group_id: Yup.string().required('Please Select Group'),
                                meal_category_tag: Yup.string().required('Please Enter Tag'),
                            })}
                            onSubmit={(values, actions) => {
                                handleSubmit(values, actions);
                            }}
                        >
                            {(runform) => (
                                <form onSubmit={runform.handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="upload-file-dash-new position-relative">
                                                <div className="file-selecter text-center position-relative">
                                                    <div className="file-area position-relative">
                                                        <input
                                                            type="file"
                                                            name="meal_category_image"
                                                            accept="image/*"
                                                            onChange={(e) => handleImg(e.target.files[0], e)}
                                                        />
                                                        <div className="file-dummy">
                                                            <img id="meal-category-img" loading="lazy" alt="" />
                                                            <div id='upld-img-area'>
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
                                                <div className="col-md-4 mb-3">
                                                    <label>Name</label>
                                                    <div>
                                                        <input
                                                            className="form-control"
                                                            name="meal_category_name"
                                                            type="text"
                                                            placeholder="Enter Meal Category Name"
                                                            {...formAttr(runform, 'meal_category_name')}
                                                        />
                                                        {errorContainer(runform, 'meal_category_name')}
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label>Order</label>
                                                    <div>
                                                        <input
                                                            className="form-control"
                                                            name="meal_category_order"
                                                            type="text"
                                                            readOnly
                                                            disabled
                                                            placeholder="Enter the Category order"
                                                            {...formAttr(runform, 'meal_category_order')}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label>Group</label>
                                                    <div>
                                                        {context.isLoading ? (
                                                            <span className="form-select p-1">
                                                                <SelectLoader />
                                                            </span>
                                                        ) : (
                                                            <select
                                                                className="form-select"
                                                                name="meal_category_group_id"
                                                                {...formAttr(runform, 'meal_category_group_id')}
                                                            >
                                                                <option value="">
                                                                    Select Group
                                                                </option>
                                                                {meal_cat_group?.map((item, i) => {
                                                                    return (
                                                                        <option
                                                                            key={item.meal_category_group_id}
                                                                            value={item.meal_category_group_id}
                                                                        >
                                                                            {item.meal_category_group_name}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                        )}
                                                        {errorContainer(runform, 'meal_category_group_id')}
                                                    </div>
                                                </div>
                                                <div className="col-md-12 mb-3">
                                                    <label>Description</label>
                                                    <div>
                                                        <input
                                                            className="form-control"
                                                            name="meal_category_description"
                                                            type="text"
                                                            placeholder="Enter a Category description"
                                                            {...formAttr(runform, 'meal_category_description')}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label htmlFor="example-color-input">Bg Color</label>
                                                    <div>
                                                        <label
                                                            className="input-group-text p-0"
                                                            htmlFor="example-color-input"
                                                        >
                                                            <input
                                                                className="form-control form-control-color p-1 me-2"
                                                                type="color"
                                                                name="bg_color"
                                                                id="example-color-input"
                                                                {...formAttr(runform, 'bg_color')}
                                                            />
                                                            {runform.values?.bg_color ?? '#000000'}
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label htmlFor="example-color-input">Text Color</label>
                                                    <div>
                                                        <label
                                                            className="input-group-text p-0"
                                                            htmlFor="example-color-input1"
                                                        >
                                                            <input
                                                                className="form-control form-control-color p-1 me-2"
                                                                type="color"
                                                                name="text_color"
                                                                id="example-color-input1"
                                                                {...formAttr(runform, 'text_color')}
                                                            />
                                                            {runform.values?.text_color ?? '#000000'}
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label>Tag</label>
                                                    <div>
                                                        <input
                                                            className="form-control"
                                                            name="meal_category_tag"
                                                            type="text"
                                                            placeholder="Enter Tag"
                                                            {...formAttr(runform, 'meal_category_tag')}
                                                        />
                                                        {errorContainer(runform, 'meal_category_tag')}
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="show_diet_category_on_profile"
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="show_diet_category_on_profile">
                                                            Show diet categories on profile?
                                                            <div id='Tooltip-show_diet_category_on_profile' className='d-inline-flex'>
                                                                <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'show_diet_category_on_profile'}
                                                                placement={'right'}
                                                                target='Tooltip-show_diet_category_on_profile'
                                                                toggle={() => toggle('show_diet_category_on_profile')}
                                                            >
                                                                Users can select this category in profile
                                                            </Tooltip>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="show_on_website"
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="show_on_website">
                                                            Show on website?
                                                            <div id='Tooltip-show_on_website' className='d-inline-flex'>
                                                                <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'show_on_website'}
                                                                placement={'right'}
                                                                target='Tooltip-show_on_website'
                                                                toggle={() => toggle('show_on_website')}
                                                            >
                                                                Users can see and filter this category when selecting meals.
                                                            </Tooltip>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="show_in_header"
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="show_in_header">
                                                            Show in header?
                                                            <div id='Tooltip-show_in_header' className='d-inline-flex'>
                                                                <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'show_in_header'}
                                                                placement={'right'}
                                                                target='Tooltip-show_in_header'
                                                                toggle={() => toggle('show_in_header')}
                                                            >
                                                                Display the category for your clients to see on dropdown menu
                                                            </Tooltip>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="show_in_labels"
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="show_in_labels">
                                                            Show in labels?
                                                            <div id='Tooltip-show_in_labels' className='d-inline-flex'>
                                                                <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'show_in_labels'}
                                                                placement={'right'}
                                                                target='Tooltip-show_in_labels'
                                                                toggle={() => toggle('show_in_labels')}
                                                            >
                                                                Display the category for your clients to see on the labels
                                                            </Tooltip>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="show_on_anchor"
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="show_on_anchor">
                                                            Show on anchor?
                                                            <div id='Tooltip-show_on_anchor' className='d-inline-flex'>
                                                                <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'show_on_anchor'}
                                                                placement={'right'}
                                                                target='Tooltip-show_on_anchor'
                                                                toggle={() => toggle('show_on_anchor')}
                                                            >
                                                                Display the category on current menu or alacart anchor
                                                            </Tooltip>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-none">
                                        <button type="submit" id="meal-categories-submit">
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
