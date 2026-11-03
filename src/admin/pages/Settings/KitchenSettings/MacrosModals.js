import React from 'react';
import { Modal } from 'reactstrap';
import { errorContainer, formAttr } from '../../../../helpers/func_helper';
import 'react-quill/dist/quill.snow.css';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { RoundBtnLoader } from '../../../Loader/IconLoader';

export default function MacrosModals({ states, functions }) {
    return (
        <>
            {/* Front Edit Modal */}

            <Modal isOpen={states.on_front.show} centered className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Front</h5>
                </div>
                <div className="modal-body">
                    <Formik
                        initialValues={{
                            macro_id: states.on_front?.data?.macro_id,
                            on_front: states.on_front?.data?.on_front ?? '',
                        }}
                        validationSchema={Yup.object({
                            on_front: Yup.string().required('Please Enter front'),
                        })}
                        onSubmit={(values, actions) => {
                            functions.handleSubmit(values, actions);
                            states.set_on_front({ data: null, show: false });
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row align-items-center">
                                    <div className="col-md-8 mb-2">
                                        <div>
                                            <select
                                                className="form-select"
                                                name="on_front"
                                                {...formAttr(runform, 'on_front')}
                                            >
                                                <option value="">
                                                    Select front
                                                </option>
                                                <option value="0">Hide</option>
                                                <option value="1">Show in calories</option>
                                                <option value="2">Show as primary information</option>
                                                <option value="3">Show as sub information</option>
                                            </select>
                                            {errorContainer(runform, 'on_front')}
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <div className="d-flex align-items-center justify-content-center">
                                            <button type="submit" className="btn-round me-2">
                                                {runform.isSubmitting ? (
                                                    <RoundBtnLoader />
                                                ) : (
                                                    <i className="bx bx-check fs-4"></i>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-round bg-light text-secondary"
                                                onClick={() => {
                                                    states.set_on_front({ data: null, show: false });
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

            <Modal isOpen={states.on_labels.show} centered className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Labels</h5>
                </div>
                <div className="modal-body">
                    <Formik
                        initialValues={{
                            macro_id: states.on_labels?.data?.macro_id,
                            on_labels: states.on_labels?.data?.on_labels ?? '',
                        }}
                        validationSchema={Yup.object({
                            on_labels: Yup.string().required('Please Enter labels'),
                        })}
                        onSubmit={(values, actions) => {
                            functions.handleSubmit(values, actions);
                            states.set_on_labels({ data: null, show: false });
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row align-items-center">
                                    <div className="col-md-8 mb-2">
                                        <div>
                                            <select
                                                className="form-select"
                                                name="on_labels"
                                                {...formAttr(runform, 'on_labels')}
                                            >
                                                <option value="">
                                                    Select labels
                                                </option>
                                                <option value="0">Hide</option>
                                                <option value="1">Show in calories</option>
                                                <option value="2">Show as primary information</option>
                                                <option value="3">Show as sub information</option>
                                            </select>
                                            {errorContainer(runform, 'on_labels')}
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
                                                    states.set_on_labels({ data: null, show: false });
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

            {/* Round Decimal Edit Modal */}

            <Modal isOpen={states.round_decimal.show} centered className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Round Decimal</h5>
                </div>
                <div className="modal-body">
                    <Formik
                        initialValues={{
                            macro_id: states.round_decimal?.data?.macro_id,
                            round_decimal: states.round_decimal?.data?.round_decimal ?? '',
                        }}
                        validationSchema={Yup.object({
                            round_decimal: Yup.string().required('please select round decimal'),
                        })}
                        onSubmit={(values, actions) => {
                            functions.handleSubmit(values, actions);
                            states.set_round_decimal({ data: null, show: false });
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row align-items-center">
                                    <div className="col-md-8 mb-2">
                                        <div>
                                            <select
                                                className="form-select"
                                                name="round_decimal"
                                                {...formAttr(runform, 'round_decimal')}
                                            >
                                                <option value="">
                                                    -- Select --
                                                </option>
                                                <option value="0">0</option>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                            </select>
                                            {errorContainer(runform, 'round_decimal')}
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
                                                    states.set_round_decimal({ data: null, show: false });
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

            {/* Color Edit Modal */}

            <Modal isOpen={states.macro_color.show} centered className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Color</h5>
                </div>
                <div className="modal-body">
                    <Formik
                        initialValues={{
                            macro_id: states.macro_color?.data?.macro_id,
                            macro_color: states.macro_color?.data?.macro_color ?? '',
                        }}
                        validationSchema={Yup.object({
                            macro_color: Yup.string().required('please select Color'),
                        })}
                        onSubmit={(values, actions) => {
                            functions.handleSubmit(values, actions);
                            states.set_macro_color({ data: null, show: false });
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row align-items-center">
                                    <div className="col-md-8 mb-2">
                                        <div>
                                            <label className="input-group-text bg-white p-0" htmlFor="color-macros">
                                                <input
                                                    className="form-control form-control-color p-1 me-2 border-0"
                                                    type="color"
                                                    name="macro_color"
                                                    id="color-macros"
                                                    {...formAttr(runform, 'macro_color')}
                                                />
                                                {runform.values?.macro_color ?? '#000000'}
                                            </label>
                                            {errorContainer(runform, 'macro_color')}
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
                                                    states.set_macro_color({ data: null, show: false });
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

            {/* Ingredients API Edit Modal */}

            <Modal isOpen={states.ingredient_api_id.show} centered className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">Ingredients API</h5>
                </div>
                <div className="modal-body">
                    <Formik
                        initialValues={{
                            macro_id: states.ingredient_api_id?.data?.macro_id,
                            ingredient_api_id: states.ingredient_api_id?.data?.ingredient_api_id ?? '',
                        }}
                        onSubmit={(values, actions) => {
                            functions.handleSubmit(values, actions);
                            states.set_ingredient_api_id({ data: null, show: false });
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row align-items-center">
                                    <div className="col-md-8 mb-2">
                                        <div>
                                            <select
                                                className="form-select"
                                                name="ingredient_api_id"
                                                onChange={runform.handleChange}
                                                onBlur={runform.handleBlur}
                                                value={runform.values?.ingredient_api_id ?? ''}
                                            >
                                                <option>
                                                    -- Select --
                                                </option>
                                                <option value={null}>Calories</option>
                                                <option value={null}>Dietary Fiber</option>
                                                <option value={null}>Saturated Fat</option>
                                                <option value={null}>Total Fat</option>
                                                <option value={null}>Total Sugars</option>
                                                <option value={null}>Cholesterol</option>
                                                <option value={null}>Included Sugars</option>
                                                <option value={null}>Sodium</option>
                                                <option value={null}>Total Carbohydrate</option>
                                                <option value={null}>Protein</option>
                                                <option value={null}>Vitamin D</option>
                                                <option value={null}>Calcium</option>
                                                <option value={null}>Iron</option>
                                                <option value={null}>Potassium</option>
                                            </select>
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
                                                    states.set_ingredient_api_id({ data: null, show: false });
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
