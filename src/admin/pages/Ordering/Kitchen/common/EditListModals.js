import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'reactstrap';
import { errorContainer, formAttr } from '../../../../../helpers/func_helper';
import 'react-quill/dist/quill.snow.css';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { RoundBtnLoader, SelectLoader } from '../../../../Loader/IconLoader';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH } from '../../../../constants/const';
import Select from 'react-select';

export default function EditListModals({ id, states, functions }) {
    const runforms = useRef();
    const [isLoading, set_isLoading] = useState(false);
    const [ingredient_cat, set_ingredient_cat] = useState([]);
    const [units, set_units] = useState([]);
    const [ingredient_allergens, set_ingredient_allergens] = useState([]);
    const [ingredient_dislikes, set_ingredient_dislikes] = useState([]);
    const [selected_allergens, set_selected_allergens] = useState([]);
    const [selected_dislikes, set_selected_dislikes] = useState([]);

    useEffect(() => {
        if (states?.ingredient_category_id?.show) GetIngredientCategories();
        if (states?.base_weight?.show) GetAllUnits();
        if (states?.allergens?.show) GetAllAllergens();
        if (states?.dislikes?.show) GetAllDislikes();
    }, [states?.ingredient_category_id?.show, states?.base_weight?.show, states?.allergens?.show, states?.dislikes?.show]);

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

    const GetAllUnits = async () => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getAllUnits, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            set_units(response.data.data_result ?? []);
        }
        set_isLoading(false);
    };

    const GetAllAllergens = async () => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getIngredientAllergens, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            set_ingredient_allergens(response.data.data_result ?? []);
            let temp_allergens = states?.allergens?.data.allergens !== '' ? (states?.allergens?.data.allergens?.split(',') ?? []) : [];
            let allergens = [];
            for (let i = 0; i < temp_allergens?.length; i++) {
                let obj = temp_allergens[i]?.split(':');
                allergens.push({ label: obj[1], value: obj[0] });
            }
            set_selected_allergens(allergens);
        }
        set_isLoading(false);
    };

    const GetAllDislikes = async () => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getIngredientDislikes, {
            type: 'all',
        });
        if (response.statusCode === 200) {
            set_ingredient_dislikes(response.data.data_result ?? []);
            let temp_dislikes = states?.dislikes?.data.dislikes !== '' ? (states?.dislikes?.data.dislikes?.split(',') ?? []) : [];
            let dislikes = [];
            for (let i = 0; i < temp_dislikes?.length; i++) {
                let obj = temp_dislikes[i]?.split(':');
                dislikes.push({ label: obj[1], value: obj[0] });
            }
            set_selected_dislikes(dislikes);
        }
        set_isLoading(false);
    };

    const handleSelect = (value, name) => {
        if (name === 'allergen_detail') set_selected_allergens(value);
        else set_selected_dislikes(value);
        let val = value.map((m) => m.value);
        runforms.current.setFieldValue(name, val);
    };

    return (
        <>
            {/* Ingredient Category Name Edit Modal */}
            <Modal isOpen={states?.ingredient_category_id?.show} centered className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Edit Ingredient Category</h5>
                </div>
                <div className="modal-body">
                    <Formik
                        initialValues={{
                            [id]: states?.ingredient_category_id?.data?.[id],
                        }}
                        onSubmit={(values, actions) => {
                            functions.handleSubmit(values, actions);
                            states?.set_ingredient_category_id({ data: null, show: false });
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row align-items-center">
                                    <div className="col-md-8 mb-2">
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
                                                            <option key={i} value={item.ingredient_category_id}>
                                                                {item.ingredient_category_name}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <div className="d-flex align-items-center justify-content-center">
                                            <button type="submit" className="btn-round me-2">
                                                {runform.isSubmitting ? <RoundBtnLoader /> : <i className="bx bx-check fs-4"></i>}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-round bg-light text-secondary"
                                                onClick={() => {
                                                    states?.set_ingredient_category_id({ data: null, show: false });
                                                }}
                                            >
                                                <i className="bx bx-x fs-4"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Modal>

            {/* Labels Edit Modal */}
            <Modal isOpen={states?.base_weight?.show} centered className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Edit Base weight & Unit</h5>
                </div>
                <div className="modal-body">
                    <Formik
                        initialValues={{
                            [id]: states?.base_weight?.data?.[id],
                            base_weight: states?.base_weight?.data?.base_weight ?? '',
                            base_unit_id: states?.base_weight?.data?.base_unit_id ?? '',
                        }}
                        validationSchema={Yup.object({
                            base_weight: Yup.string().required('Please Enter Base Weight'),
                            base_unit_id: Yup.string().required('Please Select Base Unit'),
                        })}
                        onSubmit={(values, actions) => {
                            functions.handleSubmit(values, actions);
                            states?.set_base_weight({ data: null, show: false });
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row align-items-center">
                                    <div className="col-md-4 mb-3">
                                        <label>Base Weight</label>
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
                                        <label>Base Unit</label>
                                        <div>
                                            {isLoading ? (
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
                                    <div className="col-md-4 mb-2">
                                        <div className="d-flex align-items-center justify-content-center">
                                            <button type="submit" className="btn-round me-2">
                                                <i className="bx bx-check fs-4"></i>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-round bg-light text-secondary"
                                                onClick={() => {
                                                    states?.set_base_weight({ data: null, show: false });
                                                }}
                                            >
                                                <i className="bx bx-x fs-4"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Modal>

            {/* Display Name Edit Modal */}
            <Modal isOpen={states?.display_name?.show} centered className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Edit Display Name</h5>
                </div>
                <div className="modal-body">
                    <Formik
                        initialValues={{
                            [id]: states?.display_name?.data?.[id],
                            display_name: states?.display_name?.data?.display_name ?? '',
                        }}
                        validationSchema={Yup.object({
                            display_name: Yup.string().required('please Enter Internal Name'),
                        })}
                        onSubmit={(values, actions) => {
                            functions.handleSubmit(values, actions);
                            states?.set_display_name({ data: null, show: false });
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row align-items-center">
                                    <div className="col-md-8 mb-2">
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
                                    <div className="col-md-4 mb-2">
                                        <div className="d-flex align-items-center justify-content-center">
                                            <button type="submit" className="btn-round me-2">
                                                <i className="bx bx-check fs-4"></i>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-round bg-light text-secondary"
                                                onClick={() => {
                                                    states?.set_display_name({ data: null, show: false });
                                                }}
                                            >
                                                <i className="bx bx-x fs-4"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Modal>

            {/* Allergens Edit Modal */}
            <Modal isOpen={states?.allergens?.show} centered className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Edit Allergens</h5>
                </div>
                <div className="modal-body">
                    <Formik
                        innerRef={runforms}
                        initialValues={{
                            [id]: states?.allergens?.data?.[id],
                            allergen_detail: states?.allergens?.data?.allergens?.split(',')?.map((f) => f.split(':')[0]) ?? [],
                        }}
                        onSubmit={(values, actions) => {
                            functions.handleSubmit(values, actions, '1');
                            states?.set_allergens({ data: null, show: false });
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row align-items-center modal-creation-reason">
                                    <div className="col-md-8 mb-2">
                                        <div>
                                            <Select
                                                name="allergen_detail"
                                                value={selected_allergens}
                                                isMulti={true}
                                                isLoading={isLoading}
                                                onChange={(val) => handleSelect(val, 'allergen_detail')}
                                                options={ingredient_allergens?.map((f) => ({
                                                    label: f.ingredient_allergen_name,
                                                    value: f.ingredient_allergen_id,
                                                }))}
                                                className="select2-selection"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <div className="d-flex align-items-center justify-content-center">
                                            <button type="submit" className="btn-round me-2">
                                                <i className="bx bx-check fs-4"></i>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-round bg-light text-secondary"
                                                onClick={() => {
                                                    states?.set_allergens({ data: null, show: false });
                                                }}
                                            >
                                                <i className="bx bx-x fs-4"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Modal>

            {/* Dislikes Edit Modal */}
            <Modal isOpen={states?.dislikes?.show} centered className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Edit Dislikes</h5>
                </div>
                <div className="modal-body">
                    <Formik
                        innerRef={runforms}
                        initialValues={{
                            [id]: states?.dislikes?.data?.[id],
                            dislike_detail: states?.dislikes?.data?.dislikes?.split(',')?.map((f) => f.split(':')[0]) ?? [],
                        }}
                        onSubmit={(values, actions) => {
                            functions.handleSubmit(values, actions, '1');
                            states?.set_dislikes({ data: null, show: false });
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row align-items-center modal-creation-reason">
                                    <div className="col-md-8 mb-2">
                                        <div>
                                            <Select
                                                name="dislike_detail"
                                                value={selected_dislikes}
                                                isMulti={true}
                                                onChange={(val) => handleSelect(val, 'dislike_detail')}
                                                isLoading={isLoading}
                                                options={ingredient_dislikes?.map((f) => ({
                                                    label: f.ingredient_dislike_name,
                                                    value: f.ingredient_dislike_id,
                                                }))}
                                                className="select2-selection"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <div className="d-flex align-items-center justify-content-center">
                                            <button type="submit" className="btn-round me-2">
                                                <i className="bx bx-check fs-4"></i>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-round bg-light text-secondary"
                                                onClick={() => {
                                                    states?.set_dislikes({ data: null, show: false });
                                                }}
                                            >
                                                <i className="bx bx-x fs-4"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Modal>

            {/* Regular Portion Edit Modal */}
            <Modal isOpen={states?.regular_portions?.show} centered className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Edit {states?.regular_portions?.title}</h5>
                </div>
                <div className="modal-body">
                    <Formik
                        innerRef={runforms}
                        initialValues={{
                            [id]: states?.regular_portions?.data?.[id],
                            [states?.regular_portions?.field_name]: states?.regular_portions?.data?.[states?.regular_portions?.field_name] ?? 0,
                        }}
                        onSubmit={(values, actions) => {
                            functions.handleSubmit(values, 'regular');
                            states?.set_regular_portions({ data: null, show: false, title: '', field_name: '' });
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row align-items-center modal-creation-reason">
                                    <div className="col-md-8 mb-2">
                                        <input
                                            className="form-control"
                                            name={[states?.regular_portions?.field_name]}
                                            type="number"
                                            placeholder="Enter Regular Selling Price"
                                            onChange={(e) => { runform.setFieldValue([states?.regular_portions?.field_name], Number(e.target.value === '' ? 0 : e.target.value).toString()) }}
                                            value={runform?.values?.[states?.regular_portions?.field_name]}
                                        />
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <div className="d-flex align-items-center justify-content-center">
                                            <button type="submit" className="btn-round me-2">
                                                <i className="bx bx-check fs-4"></i>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-round bg-light text-secondary"
                                                onClick={() => {
                                                    states?.set_regular_portions({ data: null, show: false, title: '', field_name: '' });
                                                }}
                                            >
                                                <i className="bx bx-x fs-4"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Modal>

            {/* Other Portion Edit Modal */}
            <Modal isOpen={states?.other_portions?.show} centered className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Edit {states?.other_portions?.title}</h5>
                </div>
                <div className="modal-body">
                    <Formik
                        innerRef={runforms}
                        initialValues={{
                            [id]: states?.other_portions?.data?.[id],
                            portion_size_id: states?.other_portions?.data?.portion_size_id,
                            [states?.other_portions?.field_name]: states?.other_portions?.data?.[states?.other_portions?.key] ?? 0,
                        }}
                        onSubmit={(values, actions) => {
                            functions.handleSubmit(values, 'other');
                            states?.set_other_portions({ data: null, show: false, title: '', field_name: '', key: '' });
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row align-items-center modal-creation-reason">
                                    <div className="col-md-8 mb-2">
                                        <input
                                            className="form-control"
                                            name={[states?.other_portions?.field_name]}
                                            type="number"
                                            placeholder="Enter Regular Selling Price"
                                            onChange={(e) => { runform.setFieldValue([states?.other_portions?.field_name], Number(e.target.value === '' ? 0 : e.target.value).toString()) }}
                                            value={runform?.values?.[states?.other_portions?.field_name]}
                                        />
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <div className="d-flex align-items-center justify-content-center">
                                            <button type="submit" className="btn-round me-2">
                                                <i className="bx bx-check fs-4"></i>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-round bg-light text-secondary"
                                                onClick={() => {
                                                    states?.set_other_portions({ data: null, show: false, title: '', field_name: '', key: '' });
                                                }}
                                            >
                                                <i className="bx bx-x fs-4"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Modal>
        </>
    );
}
