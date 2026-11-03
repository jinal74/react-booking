import React, { useRef } from 'react'
import { Modal } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { errorContainer, formAttr } from '../../../../../helpers/func_helper';

function EditListModalsInSetting({ states, functions }) {
    const runforms = useRef();

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? "1" : "0";
        runforms.current.setFieldValue(e.target.id, value);
        document.getElementById(e.target.id).checked = e.target.checked;
    };

    return (
        <div>
            {/* Country  Name Edit Modal */}
            {states.country?.show &&
                <Modal isOpen={states.country.show} centered className="modal">
                    <div className="modal-header">
                        <h5 className="modal-title mt-0">Edit Country Name</h5>
                    </div>
                    <div className="modal-body">
                        <Formik
                            initialValues={{
                                delivery_zipcode_id: states.country?.data?.delivery_zipcode_id,
                                delivery_state_id: states.country?.data?.delivery_state_id,
                                delivery_route_id: states.country?.data?.delivery_route_id,
                                country: states.country?.data?.country ?? '',
                            }}
                            validationSchema={Yup.object({
                                country: Yup.string().required('Please Enter Country Name '),
                            })}
                            onSubmit={(values, actions) => {
                                functions.handleSubmit(values, actions);
                                states.set_country({ data: null, show: false });
                            }}
                        >
                            {(runform) => (
                                <form onSubmit={runform.handleSubmit}>
                                    <div className="row align-items-center">
                                        <div className="col-md-8 mb-2">
                                            <div>
                                                <input
                                                    className="form-control"
                                                    name="country"
                                                    type="text"
                                                    placeholder="Enter Country Name"
                                                    {...formAttr(runform, 'country')}
                                                />
                                                {errorContainer(runform, 'country')}
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
                                                        states.set_country({ data: null, show: false });
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
            }

            {/* delivery_price Edit Modal */}

            {states.delivery_price?.show &&
                <Modal isOpen={states.delivery_price.show} centered className="modal">
                    <div className="modal-header">
                        <h5 className="modal-title mt-0">Edit Delivery Price</h5>
                    </div>
                    <div className="modal-body">
                        <Formik
                            initialValues={{
                                delivery_zipcode_id: states.delivery_price?.data?.delivery_zipcode_id,
                                delivery_state_id: states.delivery_price?.data?.delivery_state_id,
                                delivery_route_id: states.delivery_price?.data?.delivery_route_id,
                                delivery_price: states.delivery_price?.data?.delivery_price ?? '',
                            }}
                            validationSchema={Yup.object({
                                delivery_price: Yup.string().required('Please Enter Delivery Price'),
                            })}
                            onSubmit={(values, actions) => {
                                functions.handleSubmit(values, actions);
                                states.set_delivery_price({ data: null, show: false });
                            }}
                        >
                            {(runform) => (
                                <form onSubmit={runform.handleSubmit}>
                                    <div className="row align-items-center">
                                        <div className="col-md-8 mb-2">
                                            <div>
                                                <input
                                                    className="form-control"
                                                    name="delivery_price"
                                                    type="number"
                                                    placeholder="Enter Delivery Price"
                                                    {...formAttr(runform, 'delivery_price')}
                                                />
                                                {errorContainer(runform, 'delivery_price')}
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
                                                        states.set_delivery_price({ data: null, show: false });
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
            }

            {/* tax_percentage Edit Modal */}

            {states.tax_percentage?.show &&
                <Modal isOpen={states.tax_percentage.show} centered className="modal">
                    <div className="modal-header">
                        <h5 className="modal-title mt-0">Edit Tax Percentage</h5>
                    </div>
                    <div className="modal-body">
                        <Formik
                            initialValues={{
                                delivery_zipcode_id: states.tax_percentage?.data?.delivery_zipcode_id,
                                delivery_state_id: states.tax_percentage?.data?.delivery_state_id,
                                delivery_route_id: states.tax_percentage?.data?.delivery_route_id,
                                tax_percentage: states.tax_percentage?.data?.tax_percentage ?? '',
                            }}
                            validationSchema={Yup.object({
                                tax_percentage: Yup.string().required('Please Enter Tax Percentage'),
                            })}
                            onSubmit={(values, actions) => {
                                functions.handleSubmit(values, actions);
                                states.set_tax_percentage({ data: null, show: false });
                            }}
                        >
                            {(runform) => (
                                <form onSubmit={runform.handleSubmit}>
                                    <div className="row align-items-center">
                                        <div className="col-md-8 mb-2">
                                            <div>
                                                <input
                                                    className="form-control"
                                                    name="tax_percentage"
                                                    type="number"
                                                    placeholder="Enter Tax Percentage"
                                                    {...formAttr(runform, 'tax_percentage')}
                                                />
                                                {errorContainer(runform, 'tax_percentage')}
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
                                                        states.set_tax_percentage({ data: null, show: false });
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
            }

            {/* allow_on Edit Modal */}

            {states.allow_to?.show &&
                <Modal isOpen={states.allow_to.show} centered className="modal">
                    <div className="modal-header">
                        <h5 className="modal-title mt-0">Edit Allow On</h5>
                    </div>
                    <div className="modal-body">
                        <Formik
                            innerRef={runforms}
                            initialValues={{
                                delivery_zipcode_id: states.allow_to?.data?.delivery_zipcode_id,
                                delivery_state_id: states.allow_to?.data?.delivery_state_id,
                                delivery_route_id: states.allow_to?.data?.delivery_route_id,
                                allow_gift_card: states.allow_to?.data?.allow_gift_card,
                                allow_cart: states.allow_to?.data?.allow_cart,
                                allow_meal_packs: states.allow_to?.data?.allow_meal_packs,
                                allow_subscription_creation: states.allow_to?.data?.allow_subscription_creation,
                                allow_weekly_subscription: states.allow_to?.data?.allow_weekly_subscription,
                            }}
                            validationSchema={Yup.object({
                                // tax_percentage: Yup.string().required('Please Enter Tax Percentage'),
                            })}
                            onSubmit={(values, actions) => {
                                functions.handleSubmit(values, actions);
                                states.set_allow_to({ data: null, show: false });
                            }}
                        >
                            {(runform) => (
                                <form onSubmit={runform.handleSubmit}>
                                    <div className="row align-items-center">
                                        <div className="col-md-6 mb-2">
                                            <div className="row">
                                                <div className="col-12 pb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="allow_gift_card"
                                                            defaultChecked={states.allow_to?.data?.allow_gift_card == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="allow_gift_card">
                                                            Gift Card
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-12 pb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="allow_cart"
                                                            defaultChecked={states.allow_to?.data?.allow_cart == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="allow_cart">
                                                            À la Carte
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-12 pb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="allow_meal_packs"
                                                            defaultChecked={states.allow_to?.data?.allow_meal_packs == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="allow_meal_packs">
                                                            Meal Packs
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-12 pb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="allow_subscription_creation"
                                                            defaultChecked={states.allow_to?.data?.allow_subscription_creation == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="allow_subscription_creation">
                                                            Subscription Creation
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-12 pb-2">
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="allow_weekly_subscription"
                                                            defaultChecked={states.allow_to?.data?.allow_weekly_subscription == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="allow_weekly_subscription">
                                                            Weekly Subscription
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <button type="submit" className="btn-round me-2">
                                                    <i className="bx bx-check fs-4"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-round bg-light text-secondary"
                                                    onClick={() => {
                                                        states.set_allow_to({ data: null, show: false });
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
            }

            {/* delete zipcode modal Modal */}

            {states.delete_zipcode?.show &&
                <Modal isOpen={states.delete_zipcode.show} centered className="modal">
                    <div className="modal-header">
                        <h5 className="modal-title mt-0">Delete Zipcode</h5>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you want to delete this ?</p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                states.set_delete_zipcode({ data: null, show: false });
                            }}
                        >
                            No
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => {
                                // Handle delete logic here
                                functions.handleDelete();
                                states.set_delete_zipcode({ data: null, show: false });
                            }}
                        >
                            Yes
                        </button>
                    </div>
                </Modal>
            }
        </div>
    )
}

export default EditListModalsInSetting