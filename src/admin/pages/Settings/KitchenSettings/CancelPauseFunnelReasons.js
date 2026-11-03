import React, { useContext, useEffect, useRef, useState } from 'react';
import DataTable from '../../Tables/CustDataTable';
import Select from 'react-select';
import { Modal } from 'reactstrap';
import { Formik } from 'formik';
import { errorContainer, formAttr } from '../../../../helpers/func_helper';
import * as Yup from 'yup';
import { API_PATH } from '../../../constants/const';
import { PostApi } from '../../../../services/ApiService';
import { toast } from 'react-toastify';
import Loader from '../../../Loader/Loader';
import { IconLoader } from '../../../Loader/IconLoader';
import { SettingsStore } from '../../../context/SettingsContext';

export default function CancelPauseFunnelReasons() {
    const runforms = useRef();
    const context = useContext(SettingsStore);

    const [edit_data, set_edit_data] = useState(false);
    const [activeTab, set_activeTab] = useState(context.funneal_reason_status);
    const [selectedInUse, set_selectedInUse] = useState([
        {
            label: 'Pause Subscription',
            value: 'pause_subscription',
        },
    ]);
    const [modal_show, set_modal_show] = useState(false);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'funnel_reason_name',
        order: 1,
    });
    const [initialValues, set_initialValues] = useState({
        funnel_reason_name: '',
        is_active: '1',
        is_require_justification: '1',
        justification_title: '',
        show_in_pause_subscription: '1',
        show_in_cancel_subscription: '0',
    });
    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);

    useEffect(() => {
        GetAllFunnealReasons(options);
    }, [activeTab]);

    const GetAllFunnealReasons = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getAllFunnelReason, {
            type: 'page',
            funnel_reason_name: option.search,
            offset: option.page + 1,
            limit: option.sizePerPage,
            is_active: activeTab,
            sort_by: option.sort,
            is_ascending: option.order,
        });
        if (response.statusCode === 200) {
            set_data(response.data.data_result ?? []);
            set_options({ ...option, totalCount: response.data?.data_count ?? 0 });
        } else {
            set_data([]);
            set_options({ ...option, totalCount: 0 });
        }
        set_isLoading(false);
    };

    const columns = [
        {
            name: 'Name',
            column: 'funnel_reason_name',
            options: {
                sort: true,
            },
        },
        {
            name: 'Need Justification?',
            column: 'is_require_justification',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return <div>{data[i].is_require_justification == 1 ? 'Yes' : 'No'}</div>;
                },
            },
        },
        {
            name: 'In Use',
            column: 'justification_title',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div>
                            {data[i].show_in_pause_subscription == '1' && data[i].show_in_cancel_subscription == '0'
                                ? 'Pause Subscription'
                                : data[i].show_in_pause_subscription == '0' && data[i].show_in_cancel_subscription == '1'
                                    ? 'Cancel Subscription'
                                    : data[i].show_in_pause_subscription == '1' && data[i].show_in_cancel_subscription == '1'
                                        ? 'Pause & Cancel Subscription'
                                        : 'No'}
                        </div>
                    );
                },
            },
        },
        {
            name: 'Actions',
            column: 'id',
            options: {
                // sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="cursor-pointer" onClick={() => handleRowClick(data[i])}>
                            <i className="bx bxs-edit-alt fs-4"></i>
                        </div>
                    );
                },
            },
        },
    ];

    const tableCallBack = (option) => {
        GetAllFunnealReasons(option);
    };

    const handleRowClick = (data) => {
        GetKitchenLocationById(data.funnel_reason_id);
        set_edit_data(true);
        set_modal_show(true);
    };

    const GetKitchenLocationById = async (funnel_reason_id) => {
        const response = await PostApi(API_PATH.funnelById, { funnel_reason_id });
        if (response.statusCode === 200) {
            let data = response.data;

            const selectedOptions = [];
            if (data.show_in_pause_subscription) {
                selectedOptions.push({
                    label: 'Pause Subscription',
                    value: 'pause_subscription',
                });
            }
            if (data.show_in_cancel_subscription) {
                selectedOptions.push({
                    label: 'Cancel Subscription',
                    value: 'cancel_subscription',
                });
            }
            set_initialValues({
                funnel_reason_id: data.funnel_reason_id,
                funnel_reason_name: data.funnel_reason_name,
                is_active: data.is_active,
                is_require_justification: data.is_require_justification,
                justification_title: data.is_require_justification == 1 ? data.justification_title : '',
                show_in_cancel_subscription: data.show_in_cancel_subscription,
                show_in_pause_subscription: data.show_in_pause_subscription,
            });
            set_selectedInUse(selectedOptions);
        }
        set_isLoading(false);
    };

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? '1' : '0';
        runforms.current.setFieldValue(e.target.name, value);
        document.getElementById(e.target.id).checked = e.target.checked;
    };

    const handleSelectInUse = (selectedOptions) => {
        set_selectedInUse(selectedOptions);
        const showInPauseSubscription = selectedOptions.some((option) => option.value === 'pause_subscription') ? '1' : '0';
        const showInCancelSubscription = selectedOptions.some((option) => option.value === 'cancel_subscription')
            ? '1'
            : '0';
        runforms.current.setFieldValue('show_in_pause_subscription', showInPauseSubscription);
        runforms.current.setFieldValue('show_in_cancel_subscription', showInCancelSubscription);
    };

    const handleCloseModal = () => {
        set_modal_show(false);
        set_edit_data(false);
        set_initialValues({
            funnel_reason_name: '',
            is_active: '1',
            is_require_justification: 1,
            justification_title: '',
            show_in_pause_subscription: '1',
            show_in_cancel_subscription: '0',
        });
        set_selectedInUse(selectedInUse);
    };

    const handleSubmit = async (formData, actions) => {
        let temp_data = { ...formData };
        if (temp_data.is_require_justification == 0) temp_data.justification_title = '';

        let api_path = '';
        let message = '';

        if (edit_data) {
            api_path = API_PATH.updateFunnelReason;
            message = 'Funnel Reason updated successfully';
        } else {
            api_path = API_PATH.addFunnelReason;
            message = 'Funnel Reason added successfully';
        }

        if (api_path != '') {
            const response = await PostApi(api_path, temp_data);
            if (response.statusCode === 200) {
                toast.success(message);
                GetAllFunnealReasons(options);
                actions.resetForm();
                handleCloseModal();
            }
            set_selectedInUse(selectedInUse);
            set_isLoading(false);
        }
    };

    const toggle = (tab) => {
        if (activeTab !== tab) {
            set_activeTab(tab);
            context.setfunneal_reason_status(tab);
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Cancel/Pause Funnel Reasons</h4>
                            <div className="page-title-right">
                                <button type="button" className="btn btn-primary " onClick={() => set_modal_show(true)}>
                                    + Add new
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex align-items-center mt-2">
                    <div className={activeTab == '1' ? 'active' : ''} onClick={() => toggle('1')}>
                        <button className={`btn ${activeTab == '1' ? 'btn-success' : 'border-success text-success'}`}>
                            Active
                        </button>
                    </div>
                    <div className={activeTab == '0' ? 'active' : ''} onClick={() => toggle('0')}>
                        <button className={`btn ms-2 ${activeTab == '0' ? 'btn-success' : 'border-success text-success'}`}>
                            Inactive
                        </button>
                    </div>
                </div>
                {isLoading ? (
                    <Loader />
                ) : (
                    <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                )}
            </div>

            <Modal isOpen={modal_show} centered className="modal-lg modal-creation-reason">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">{edit_data ? 'Edit' : 'New'} Subscription Creation Reason</h5>
                    <button
                        type="button"
                        onClick={() => handleCloseModal()}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <Formik
                        innerRef={runforms}
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={Yup.object({
                            funnel_reason_name: Yup.string().required('Please Enter Name')
                        })}
                        onSubmit={(values, actions) => {
                            handleSubmit(values, actions);
                        }}
                    >
                        {(runform) => (
                            <form onSubmit={runform.handleSubmit}>
                                <div className="row">
                                    <div className="col-md-8 mb-3">
                                        <label htmlFor="example-text-input">Reason Name</label>
                                        <div>
                                            <input
                                                className="form-control"
                                                name="funnel_reason_name"
                                                type="text"
                                                placeholder="Enter Reason Name"
                                                {...formAttr(runform, 'funnel_reason_name')}
                                            />
                                            {errorContainer(runform, 'funnel_reason_name')}
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <div>
                                            <div className="form-check form-switch form-switch-md mb-2">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="is_active"
                                                    checked={runform.values.is_active == '1'}
                                                    onChange={handleChangeSwitch}
                                                    name="is_active"
                                                />
                                                <label className="form-check-label" htmlFor="is_active">
                                                    Is Active?
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="form-check form-switch form-switch-md">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    name="is_require_justification"
                                                    id="is_require_justification"
                                                    checked={runform.values.is_require_justification == 1}
                                                    onChange={handleChangeSwitch}
                                                />
                                                <label className="form-check-label" htmlFor="is_require_justification">
                                                    Requires Justification?
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-8 mb-3">
                                        <label>Where this reason will be used?</label>
                                        <Select
                                            value={selectedInUse}
                                            isMulti={true}
                                            onChange={handleSelectInUse}
                                            options={[
                                                {
                                                    label: 'Pause Subscription',
                                                    value: 'pause_subscription',
                                                },
                                                {
                                                    label: 'Cancel Subscription',
                                                    value: 'cancel_subscription',
                                                },
                                            ]}
                                            className="select2-selection"
                                        />
                                    </div>
                                    {runform.values.is_require_justification == 1 && (
                                        <div className="col-md-8 mb-3">
                                            <label>Justification title(! Leave empty if you want a justification field without title)</label>
                                            <input
                                                className="form-control"
                                                name="justification_title"
                                                type="text"
                                                placeholder="Enter the justification title for the reason"
                                                {...formAttr(runform, 'justification_title')}
                                            />
                                            {errorContainer(runform, 'justification_title')}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-2 pt-3 text-end border-top">
                                    <button type="button" className="btn rounded border-light me-2" onClick={() => handleCloseModal()}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success submit-button">
                                        {runform.isSubmitting ? <IconLoader /> : 'Submit'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </Modal>
        </React.Fragment>
    );
}
