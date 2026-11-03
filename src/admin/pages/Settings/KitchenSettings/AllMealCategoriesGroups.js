import React, { useEffect, useState, useContext } from 'react';
import { Modal } from 'reactstrap';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { errorContainer, formAttr } from '../../../../helpers/func_helper';
import DataTable from '../../Tables/CustDataTable';
import { PostApi } from '../../../../services/ApiService';
import { API_PATH } from '../../../constants/const';
import { SettingsStore } from '../../../context/SettingsContext';
import Loader from '../../../Loader/Loader';
import { IconLoader } from '../../../Loader/IconLoader';
import { toast } from 'react-toastify';

export default function AllMealCategoriesGroups() {
    const context = useContext(SettingsStore);
    const [modal_show, set_modal_show] = useState(false);
    const [edit_data, set_edit_data] = useState(null);
    const [data, set_data] = useState([]);
    const [options, set_options] = useState({
        page: 1,
        totalCount: 0,
        sizePerPage: 10,
        show_header: false,
        show_footer: false,
    });

    useEffect(() => {
        if (context?.meal_category_groups?.length > 0) {
            set_data(context.meal_category_groups);
            set_options({ ...options, totalCount: context.meal_category_groups?.length ?? 0 });
        }
    }, [context]);

    useEffect(() => {
        if (!context?.meal_category_groups) {
            context.GetMealCategoriesGroup();
        }
    }, []);

    const columns = [
        {
            column: 'meal_category_group_id',
            name: 'ID',
            options: {
                CustomBodyRender: (data, i) => {
                    return <span>#{i + 1}</span>;
                },
            },
        },
        {
            column: 'meal_category_group_name',
            name: 'Name',
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
        set_options(option);
    };

    const handleSubmit = async (formData, actions) => {
        let api_path = '';
        let message = '';

        if (edit_data) {
            api_path = API_PATH.editMealCategoriesGroups;
            message = 'Meal category group updated successfully';
        } else {
            api_path = API_PATH.addMealCategoriesGroups;
            message = 'Meal category group added successfully';
        }

        if (api_path != '') {
            const response = await PostApi(api_path, formData);
            if (response.statusCode === 200) {
                let temp = [...data];
                if (edit_data) {
                    let index = data.findIndex((f) => f.meal_category_group_id === formData.meal_category_group_id);
                    temp.splice(index, 1, formData);
                } else {
                    temp.push(response.data);
                }
                context.set_meal_category_groups(temp);
                toast.success(message);
                actions.resetForm();
                set_edit_data(null);
                set_modal_show(false);
            }
            context.set_isLoading(false);
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Meal Categories Groups</h4>
                            <div className="page-title-right">
                                <button type="button" className="btn btn-primary " onClick={() => set_modal_show(true)}>
                                    + Add new
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {context.isLoading ? (
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
                        <h5 className="modal-title mt-0">{edit_data ? 'Edit' : 'Add'} Meal Categories Groups</h5>
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
                                ...(edit_data && { meal_category_group_id: edit_data.meal_category_group_id }),
                                meal_category_group_name: edit_data ? edit_data.meal_category_group_name : '',
                            }}
                            validationSchema={Yup.object({
                                meal_category_group_name: Yup.string().required('Please Enter Name'),
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
                                                    name="meal_category_group_name"
                                                    type="text"
                                                    placeholder="Enter Meal Categories Group Name"
                                                    {...formAttr(runform, 'meal_category_group_name')}
                                                />
                                                {errorContainer(runform, 'meal_category_group_name')}
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
