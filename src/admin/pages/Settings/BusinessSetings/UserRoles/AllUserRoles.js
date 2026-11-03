import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../Tables/CustDataTable';
import { useEffect } from 'react';
import Loader from '../../../../Loader/Loader';
import { PostApi } from '../../../../../services/ApiService';
import { API_PATH } from '../../../../constants/const';
import { Modal, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';

export default function AllUserRoles() {
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userModalShow, setUserModalShow] = useState(false);
    const [options, setOptions] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'user_role_name',
        order: 1,
    });

    useEffect(() => {
        GetAllUsersRoles(options);
    }, []);

    const GetAllUsersRoles = async (option) => {
        setIsLoading(true);
        const response = await PostApi(API_PATH.getUserRoles, {
            offset: option.page + 1,
            limit: option.sizePerPage,
            sort_by: option.sort,
            is_ascending: option.order,
            search_text: option.search
        });
        if (response.statusCode === 200) {
            setData(response.data.data_result ?? []);
            setOptions({ ...option, totalCount: response.data?.data_count ?? 0 });
        } else {
            setData([])
            setOptions({ ...option, totalCount: 0 })
        }
        setIsLoading(false);
    };

    const columns = [
        {
            name: 'Name',
            column: 'user_role_name',
            options: {
                className: "w-25",
                sort: true,
            },
        },
        {
            name: 'Users Counts',
            column: 'total_users',
            options: {
                className: "w-25",
                sort: true,
            },
        },
        {
            name: 'Users',
            column: 'total_users',
            options: {
                className: "w-25",
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="cursor-pointer text-success" onClick={() => handleUserModalShow(data[i])}>
                            View ({data[i]?.total_users})
                        </div>
                    );
                },
            },
        },
        {
            name: 'Action',
            column: 'user_role_id',
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

    const handleUserModalShow = ({ user_role_id, total_users, user_role_name }) => {
        if (total_users > 0) {
            setUserModalShow(true);
            GetUsersByRole(user_role_id);
        } else {
            toast.warn(`No users have been assigned to the "${user_role_name}" role.`)
        }
    }

    const GetUsersByRole = async (user_role_id) => {
        setIsLoading(true);
        const response = await PostApi(API_PATH.getUserByRole, { user_role_id });
        if (response.statusCode === 200) {
            setUsers(response.data ?? []);
        } else {
            setUsers([])
        }
        setIsLoading(false);
    }

    const handleRowClick = (data) => {
        navigate(`/admin/business-settings/edit-user-profiles/${data.user_role_id}`);
    };

    const tableCallBack = (option) => {
        GetAllUsersRoles(option);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Users Roles</h4>
                            <div className="page-title-right">
                                <Link to="/admin/business-settings/add-user-profiles">
                                    <button type="button" className="btn btn-primary ">
                                        + Add new
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <Loader />
                ) : (
                    <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                )}

                <Modal isOpen={userModalShow} centered className="modal user-role-main">
                    <div className="modal-header">
                        <h5 className="modal-title mt-0">Show Users</h5>
                        <button
                            type="button"
                            onClick={() => {
                                setUserModalShow(false);
                            }}
                            className="close"
                            data-dismiss="modal"
                            aria-label="Close"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body p-0">
                        <div className='text-center'>
                            {users?.map((user) => {
                                return (
                                    <div className='user-link-cls'>
                                        <Link to={`/admin/edit-users/${user.user_id}`}>
                                            <span className='text-dark'>{`${user?.user_first_name} ${user?.user_last_name}`}</span>
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <ModalFooter className="upld-mls-btn p-0 overflow-hidden">
                        <button className="close-btn-white w-100" onClick={() => setUserModalShow(false)}>
                            Close
                        </button>
                    </ModalFooter>
                </Modal>
            </div >
        </React.Fragment >
    );
}
