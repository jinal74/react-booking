import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../Tables/CustDataTable';
import Loader from '../../../Loader/Loader';
import { Modal } from 'reactstrap';
import moment from 'moment';
import { PostApi } from '../../../../services/ApiService';
import { API_PATH } from '../../../constants/const';

export default function UserList() {
    const navigate = useNavigate();
    const [data, set_data] = useState([]);
    const [csv_show, set_csv_show] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [file, setFile] = useState();
    const [array, setArray] = useState([]);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'user_first_name',
        order: 1,
    });

    const fileReader = new FileReader();

    useEffect(() => {
        GetAllUsers(options);
    }, []);

    const GetAllUsers = async (option) => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getAllCompanyUsers, {
            sort_by: option.sort,
            is_ascending: option.order,
            type: 'page',
            limit: option.sizePerPage,
            offset: option.page + 1,
            search_name: option.search
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
            name: 'Role',
            column: 'user_role_name',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    if (data[i].user_role_name !== '') return <span className='rounded-pill border-dark border'>{data[i].user_role_name}</span>;
                }
            },
        },
        {
            name: 'First Name',
            column: 'user_first_name',
            options: {
                sort: true
            },
        },
        {
            name: 'Last Name',
            column: 'user_last_name',
            options: {
                sort: true
            },
        },
        {
            name: 'Email',
            column: 'user_email',
            options: {
                sort: true
            },
        },
        {
            name: 'Phone',
            column: 'phone_number',
            options: {
                sort: true
            },
        },
        {
            name: 'Status',
            column: 'is_active',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span className='bg-success rounded-pill text-white'>{data[i].is_active == 1 ? 'Active' : 'Inactive'}</span>
                    )
                }
            },
        },
        {
            name: 'Last Checkout',
            column: 'last_checkout_on',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return <span>{(data[i].last_checkout_on && data[i].last_checkout_on != 0) ? moment(data[i].last_checkout_on).format('MMM DD, YYYY') : ""}</span>
                }
            },
        },
        {
            name: 'Lifetime Value',
            column: 'lifetime_value',
            options: {
                // sort: true
            },
        },
        {
            name: 'Balance',
            column: 'balance',
            options: {
                // sort: true
            },
        },
        {
            name: 'Notes',
            column: 'notes',
            options: {
                sort: true
            },
        },
        {
            name: 'Action',
            column: 'user_id',
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
        navigate(`/admin/edit-users/${data.user_id}`);
    };

    const tableCallBack = (option) => {
        GetAllUsers(option);
    };

    const handleOnChange = (e) => {
        setFile(e.target.files[0]);
    };

    const csvFileToArray = (string) => {
        const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
        const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

        const array = csvRows.map(i => {
            const values = i.split(",");
            const obj = csvHeader.reduce((object, header, index) => {
                object[header] = values[index];
                return object;
            }, {});
            return obj;
        });

        setArray(array);
    };

    const handleOnSubmit = (e) => {
        e.preventDefault();

        if (file) {
            fileReader.onload = function (event) {
                const text = event.target.result;
                csvFileToArray(text);
            };

            fileReader.readAsText(file);
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Users</h4>
                            <div className="page-title-right">
                                <Link to="/admin/add-users">
                                    <button type="button" className="btn btn-primary ">
                                        + Add new
                                    </button>
                                </Link>
                                {/* <button type="button" className="btn btn-transparent border-primary text-primary ms-2" onClick={() => set_csv_show(true)}>
                                    <i className='bx bxs-file-plus me-1 fs-5 align-middle'></i>
                                    <span>Upload Users</span>
                                </button> */}
                            </div>
                        </div>
                    </div>
                </div>
                {isLoading ? (
                    <Loader />
                ) : (
                    <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                )}
            </div>

            <Modal isOpen={csv_show} centered className="modal">
                <div className="modal-header align-items-center">
                    <h5 className="modal-title mt-0">UPLOAD USERS</h5>
                    <button
                        type="button"
                        onClick={() => {
                            set_csv_show(false);
                        }}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body text-center">
                    <p>Please make sure that the file matches the current template and is on <bdi className='text-danger'>.csv</bdi> format.</p>
                    <a download>
                        <button type='button' className='btn btn-dark mx-auto d-block mb-2 w-50 py-3'>
                            <i className='bx bxs-download align-middle fs-5 me-1'></i>
                            Download Template
                        </button>
                    </a>
                    <div className='upload-btn-cls'>
                        <div className="upload-file-dash-new position-relative w-50 mx-auto">
                            <div className="file-selecter text-center position-relative">
                                <div className="file-area position-relative">
                                    <input
                                        type="file"
                                        name="csv"
                                        accept=".csv"
                                        onChange={handleOnChange}
                                    />
                                    <div className="file-dummy">
                                        <div className="file-upload-content text-success fw-bold mb-2">
                                            <i className='bx bxs-cloud-upload align-middle me-1 fs-3'></i>
                                            Upload Users
                                        </div>
                                        <span>Drag a file here or browse for a file to upload.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='modal-footer upld-mls-btn p-0'>
                    <button className='col-6 border-end' onClick={() => set_csv_show(false)}>
                        Cancel
                    </button>
                    <button className='col-6' onClick={(e) => handleOnSubmit(e)}>
                        Import Users
                    </button>
                </div>
            </Modal>
        </React.Fragment>
    );
}
