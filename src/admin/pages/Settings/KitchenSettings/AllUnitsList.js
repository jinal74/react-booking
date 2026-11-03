import React, { useEffect, useState } from 'react';
import { Modal } from 'reactstrap';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { errorContainer, formAttr } from '../../../../helpers/func_helper';
import DataTable from '../../Tables/CustDataTable';
import { API_PATH } from '../../../constants/const';
import { PostApi } from '../../../../services/ApiService';
import { toast } from 'react-toastify';
import Loader from '../../../Loader/Loader';
import { IconLoader } from '../../../Loader/IconLoader';

export default function AllUnitsList() {
    const [modal_show, set_modal_show] = useState(false);
    const [edit_data, set_edit_data] = useState(null);
    const [data, set_data] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        is_search: false
        // show_header: false,
    });

    useEffect(() => {
        GetAllUnits(options);
    }, []);

    const GetAllUnits = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getAllUnits, {
            type: 'page',
            offset: option.page + 1,
            limit: option.sizePerPage,
        });
        if (response.statusCode === 200) {
            set_data(response.data.data_result ?? []);
            set_options({ ...option, totalCount: response.data?.data_count });
        }
        set_isLoading(false);
    };

    const columns = [
        // {
        //     name: 'ID',
        //     column: 'unit_id',
        // },
        {
            name: 'Name',
            column: 'unit_name',
        },
        {
            name: 'Short Name',
            column: 'unit_short_name',
        },
        {
            name: 'Ingredients API',
            column: 'ingredient_api_id',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <span className={`${data[i].ingredient_api_id ? '' : 'text-danger'}`}>
                            {data[i].ingredient_api_id && data[i].ingredient_api_id !== ''
                                ? data[i].ingredient_api_id
                                : 'Empty'}
                        </span>
                    );
                },
            },
        },
        {
            name: 'Actions',
            column: 'unit_id',
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
        if (option.page !== options.page || option.sizePerPage !== options.sizePerPage) GetAllUnits(option);
        else set_options(option);
    };

    const handleSubmit = async (formData, actions) => {
        set_isLoading(true);

        formData.ingredient_api_id = null;

        let api_path = '';
        let message = '';
        if (edit_data) {
            api_path = API_PATH.editUnit;
            message = 'Unit updated successfully';
        } else {
            api_path = API_PATH.addUnit;
            message = 'Unit added successfully';
        }
        if (api_path != '') {
            const response = await PostApi(api_path, formData);
            if (response.statusCode === 200) {
                if (edit_data) {
                    let temp = [...data];
                    let index = data.findIndex((f) => f.unit_id === formData.unit_id);
                    temp.splice(index, 1, formData);
                    set_data(temp);
                } else {
                    GetAllUnits(options);
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
                            <h4 className="mb-sm-0 font-size-18">Units</h4>
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
                    <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                )}

                <Modal isOpen={modal_show} centered>
                    <div className="modal-header">
                        <h5 className="modal-title mt-0">{edit_data ? 'Edit' : 'Add'} Units</h5>
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
                            initialValues={{
                                ...(edit_data && { unit_id: edit_data.unit_id }),
                                unit_name: edit_data ? edit_data.unit_name : '',
                                unit_short_name: edit_data ? edit_data.unit_short_name : '',
                                ingredient_api_id: edit_data ? edit_data.ingredient_api_id : '',
                            }}
                            validationSchema={Yup.object({
                                unit_name: Yup.string().required('Please Enter Name'),
                                unit_short_name: Yup.string().required('Please Enter Short Name'),
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
                                                    name="unit_name"
                                                    type="text"
                                                    placeholder="Enter unit Name"
                                                    {...formAttr(runform, 'unit_name')}
                                                />
                                                {errorContainer(runform, 'unit_name')}
                                            </div>
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <label>Short Name</label>
                                            <div>
                                                <input
                                                    className="form-control"
                                                    name="unit_short_name"
                                                    type="text"
                                                    placeholder="Enter Short Name"
                                                    {...formAttr(runform, 'unit_short_name')}
                                                />
                                                {errorContainer(runform, 'unit_short_name')}
                                            </div>
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <label>Ingredients API</label>
                                            <div>
                                                <select
                                                    className="form-select"
                                                    name="ingredient_api_id"
                                                    onChange={runform.handleChange}
                                                    onBlur={runform.handleBlur}
                                                    value={runform.values?.ingredient_api_id ?? ''}
                                                >
                                                    <option>
                                                        Select Ingredients API
                                                    </option>
                                                    <option value={null}>Mililiters</option>
                                                    <option value={null}>Cup</option>
                                                    <option value={null}>Desiliter</option>
                                                    <option value={null}>FL Oz</option>
                                                    <option value={null}>Gallon</option>
                                                    <option value={null}>Gram</option>
                                                    <option value={null}>Kilogram</option>
                                                    <option value={null}>Litre</option>
                                                    <option value={null}>Miligram</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
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
