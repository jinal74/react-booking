import React, { useEffect, useState } from 'react';
import { Modal, Tooltip } from 'reactstrap';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { errorContainer, formAttr } from '../../../../helpers/func_helper';
import DataTable from '../../Tables/CustDataTable';
import { useRef } from 'react';
import { API_PATH } from '../../../constants/const';
import { PostApi } from '../../../../services/ApiService';
import { toast } from 'react-toastify';
import Loader from '../../../Loader/Loader';
import { IconLoader } from '../../../Loader/IconLoader';

export default function AllPortionSizes() {
    const runforms = useRef();
    const [modal_show, set_modal_show] = useState(false);
    const [edit_data, set_edit_data] = useState(null);
    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        show_header: false,
    });
    const [tooltipOpen, setTooltipOpen] = useState('');

    const toggle = (key) => {
        setTooltipOpen(tooltipOpen == key ? '' : key);
    }

    useEffect(() => {
        GetAllPortionSize(options);
    }, []);

    const GetAllPortionSize = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getPortionSize, {
            page: option.page,
        });
        if (response.statusCode === 200) {
            set_data(response.data.data_result ?? []);
            set_options({ ...option, totalCount: response.data?.data_count ?? 0 });
        }
        set_isLoading(false);
    };

    useEffect(() => {
        // if (edit_data && edit_data?.is_default != 1) {
        //     setTimeout(() => {
        //         document.getElementById('status-portion-sizes').checked = edit_data.is_active == 1;
        //     }, 500);
        // }
    }, [edit_data]);

    const columns = [
        {
            name: 'Name',
            column: 'portion_size_name',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div>
                            {data[i].portion_size_name}{' '}
                            <p className="fw-light mb-0 d-inline ms-2">
                                {data[i]?.is_default == 1 && '(Default Portion)'}
                            </p>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Status',
            column: 'is_active',
            options: {
                CustomBodyRender: (data, i) => {
                    return <div>{data[i].is_active == 1 ? 'ACTIVE' : 'DEACTIVE'}</div>;
                },
            },
        },
        {
            name: 'Actions',
            column: 'id',
            options: {
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

    const handleRowClick = (data) => {
        set_modal_show(true);
        set_edit_data(data);
    };

    const tableCallBack = (option) => {
        if (option.page !== options.page) GetAllPortionSize(option);
        else set_options(option);
    };

    const handleChangeSwitch = (e) => {
        let value = e.target.checked ? 1 : 0;
        runforms.current.setFieldValue(e.target.name, value);
        document.getElementById(e.target.id).checked = e.target.checked;
    };

    const handleSubmit = async (formData, actions) => {
        set_isLoading(true);
        let api_path = '';
        let message = '';
        if (edit_data) {
            api_path = API_PATH.editPortionSize;
            message = 'Portion size updated successfully';
        } else {
            api_path = API_PATH.addPortionSize;
            message = 'Portion size added successfully';
        }
        if (api_path != '') {
            const response = await PostApi(api_path, formData);
            if (response.statusCode === 200) {
                if (edit_data) {
                    let temp = [...data];
                    let index = data.findIndex((f) => f.portion_size_id === formData.portion_size_id);
                    temp.splice(index, 1, formData);
                    set_data(temp);
                } else {
                    GetAllPortionSize(options);
                }
                toast.success(message);
                set_modal_show(false);
                actions.resetForm();
                set_edit_data(null);
            }
            set_isLoading(false);
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Portion Sizes</h4>
                            <div className="page-title-right">
                                <button type="button" className="btn btn-primary " onClick={() => set_modal_show(true)}>
                                    + Add new
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <Loader />
                ) : (
                    <DataTable
                        data={data}
                        options={options}
                        tableCallBack={tableCallBack}
                        columns={columns}
                    />
                )}

                <Modal isOpen={modal_show} centered>
                    <div className="modal-header">
                        <h5 className="modal-title mt-0">{edit_data ? 'Edit' : 'Add'} Portion Sizes</h5>
                        <button
                            type="button"
                            onClick={() => {
                                set_modal_show(false);
                                set_edit_data(null);
                            }}
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
                            initialValues={{
                                ...(edit_data && { portion_size_id: edit_data.portion_size_id }),
                                portion_size_name: edit_data ? edit_data.portion_size_name : '',
                                is_active: edit_data ? edit_data.is_active : 0,
                            }}
                            validationSchema={Yup.object({
                                portion_size_name: Yup.string().required('Please Enter Name'),
                            })}
                            onSubmit={(values, actions) => {
                                handleSubmit(values, actions);
                            }}
                        >
                            {(runform) => (
                                <form onSubmit={runform.handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label>Name</label>
                                            <div>
                                                <input
                                                    className="form-control"
                                                    name="portion_size_name"
                                                    type="text"
                                                    placeholder="Enter Portion Name"
                                                    {...formAttr(runform, 'portion_size_name')}
                                                />
                                                {errorContainer(runform, 'portion_size_name')}
                                            </div>
                                        </div>
                                        {edit_data?.is_default != 1 && (
                                            <div className="col-md-4 mb-3">
                                                <div>
                                                    <div className="form-check form-switch form-switch-md">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="status-portion-sizes"
                                                            name="is_active"
                                                            checked={runform?.values?.is_active == 1}
                                                            onChange={handleChangeSwitch}
                                                        />
                                                        <label className='d-flex align-items-center form-check-label' htmlFor="status-portion-sizes">
                                                            Is Active?
                                                            <div id='Tooltip-status-portion-sizes' className='d-inline-flex'>
                                                                <i className='bx bxs-help-circle fs-5 cursor-pointer px-1'></i>
                                                            </div>
                                                            <Tooltip
                                                                isOpen={tooltipOpen == 'status-portion-sizes'}
                                                                placement={'right'}
                                                                target='Tooltip-status-portion-sizes'
                                                                toggle={() => toggle('status-portion-sizes')}
                                                            >
                                                                Set this Portion active or not.
                                                            </Tooltip>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-2 text-end border-top pt-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                set_modal_show(false);
                                                set_edit_data(null);
                                            }}
                                            className="btn me-2 border-light"
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-success">
                                            {runform.isSubmitting ? <IconLoader /> : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </Formik>
                    </div>
                </Modal>
            </div>
        </React.Fragment>
    );
}
