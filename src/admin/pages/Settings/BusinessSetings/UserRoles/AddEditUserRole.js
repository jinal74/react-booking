import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH } from '../../../../constants/const';
import Loader from '../../../../Loader/Loader';
import { toast } from 'react-toastify';
import { IconLoader } from '../../../../Loader/IconLoader';

export default function AddEditUserRole() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [isBtnLoading, setIsBtnLoading] = useState(false);
    const [editData, setEditData] = useState({
        user_role_name: '',
        user_role_id: null
    });
    const [displayError, setDisplayError] = useState('none');
    const [allModules, setAllModules] = useState(null);

    useEffect(() => {
        FetchEditData(id);
    }, [id]);

    const FetchEditData = async (user_role_id) => {
        setIsLoading(true);
        let api_path = '';

        if (id) api_path = API_PATH.getUserRoleById;
        else api_path = API_PATH.getAllUserRoleModules;

        const response = await PostApi(api_path, { user_role_id });
        if (response.statusCode === 200) {
            let data = [];
            if (id) {
                data = response.data.user_role_module_access;
                setEditData({
                    user_role_name: response.data?.user_role_detail?.[0]?.user_role_name,
                    user_role_id: response.data?.user_role_detail?.[0]?.user_role_id
                })
            } else {
                data = response.data;
            }
            const result = data?.reduce((acc, obj) => {
                const key = obj.module_name;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);
                return acc;
            }, {});
            setAllModules(result);
        }
        setIsLoading(false);
    }

    const handleChangeSwitch = (e, item) => {
        setAllModules((prevModules) => {
            const updatedModules = { ...prevModules };
            const tempArr = [...updatedModules[item.module_name]];
            const tempIndex = tempArr.findIndex((f) => f.admin_sub_module_id === item.admin_sub_module_id);
            const value = e.target.checked ? 1 : 0;

            if (tempIndex !== -1) {
                tempArr[tempIndex].is_allowed = value;
                updatedModules[item.module_name] = tempArr;
            }

            document.getElementById(e.target.id).checked = e.target.checked;
            return updatedModules;
        });
    };

    const handleChangeName = (e) => {
        setEditData({ ...editData, user_role_name: e.target.value });
        setDisplayError(e.target.value === '' ? 'block' : 'none');
    }

    const handleSubmit = async () => {
        if (editData.user_role_name !== "") {
            setIsBtnLoading(true);
            let api_path = '';
            let message = '';

            const combinedArray = Object.values(allModules).reduce((accumulator, currentValue) => {
                return accumulator.concat(currentValue);
            }, [])?.map((f) => ({ admin_sub_module_id: f.admin_sub_module_id, is_allowed: f.is_allowed }));

            let data = {
                ...(editData.user_role_id && { user_role_id: editData.user_role_id }),
                user_role_name: editData.user_role_name,
                module_access_details: combinedArray
            }

            if (id) {
                api_path = API_PATH.editUserRole;
                message = 'User Role updated successfully';
            } else {
                api_path = API_PATH.addUserRole;
                message = 'User Role added successfully';
            }

            if (api_path !== '') {
                const response = await PostApi(api_path, data);
                if (response.statusCode === 200) {
                    toast.success(message);
                    navigate('/admin/business-settings/user-profiles');
                    setEditData(null)
                }
            }
            setIsBtnLoading(false);
        } else {
            setDisplayError('block');
        }
    };

    return (
        <React.Fragment>
            <div className="page-content user-roles-main">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center">
                            <span
                                className="d-flex align-items-center p-0 me-3 cursor-pointer"
                                onClick={() => navigate('/admin/business-settings/user-profiles')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h4 className="mb-sm-0 font-size-18">{id ? 'Edit' : 'Add'} Users Roles</h4>
                            <div className="ms-auto">
                                <button type="submit" className="btn btn-success" onClick={handleSubmit}>
                                    {isBtnLoading ? <IconLoader /> : 'SAVE'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {isLoading ?
                        <Loader /> :
                        <div className="col-12">
                            <div className="row user-roles-bxs p-3">
                                <div className="col-md-12 mb-4 p-0">
                                    <label>Name</label>
                                    <div>
                                        <input
                                            className="form-control"
                                            name="name"
                                            type="text"
                                            placeholder="Enter Name"
                                            value={editData.user_role_name}
                                            onChange={handleChangeName}
                                        />
                                    </div>
                                    <span className='text-danger' style={{ display: displayError }}>
                                        user role name is required
                                    </span>
                                </div>

                                <div>
                                    {
                                        allModules && Object.keys(allModules)?.map((name, index) => (
                                            <React.Fragment key={index}>
                                                <div className='row mb-4'>
                                                    <div className="col-md-12 module-border p-0">
                                                        <label className='fw-bold'>{name}</label>
                                                    </div>
                                                    {allModules[name]?.map((item) => (
                                                        <div className="col-md-4 mt-2 p-0" key={item.admin_sub_module_id}>
                                                            <div className="form-check form-switch form-switch-md">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id={item.admin_sub_module_id}
                                                                    onChange={(e) => handleChangeSwitch(e, item)}
                                                                    defaultChecked={item.is_allowed === 1}
                                                                />
                                                                <label className='d-flex align-items-center form-check-label' htmlFor={item.admin_sub_module_id}>
                                                                    {item.sub_module_name}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </React.Fragment>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </React.Fragment>
    );
}
