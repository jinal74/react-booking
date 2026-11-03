import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../Tables/CustDataTable';
import { useEffect } from 'react';
import Loader from '../../../Loader/Loader';
import { SettingsStore } from '../../../context/SettingsContext';
import HowToModal from '../../../../pages/ModalsCommon/HowToModal';

export default function SubscriptionsList() {
    const navigate = useNavigate();
    const location = useLocation();
    const context = useContext(SettingsStore);

    const [activeTab, set_activeTab] = useState(context.pickup_loc_status);
    const [openHowToModal, setOpenHowToModal] = useState({ show: false, link: '', title: '' });
    const [kitchen_loc, set_kitchen_loc] = useState({});
    const [data, set_data] = useState([
        {
            id: '1',
            group: 'The Low Carb Plan',
            name: '1 Week Plan Without Breakfast',
            number_of_weeks: 1,
            days_per_week: 5,
            meals_per_day: 1,
            user_name: 'Jade Balsicas',
            email: 'jade@sprwt.io',
            last_charge: 'Dec 28, 2023 02:41 PM',
            start: 'Dec 31, 2023',
            end: 'Jan 03, 2024',
            amount: '$112.50',
            renew: 'Jan 02, 2024',
        }
    ]);
    const [isLoading, set_isLoading] = useState(false);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
        search: '',
        sort: 'pickup_loc_name',
        order: 1,
    });

    useEffect(() => {
        if (location?.state?.selected_location) {
            set_kitchen_loc(context.selected_location)
            set_options({ ...options, page: 0 })
        }
    }, [context.selected_location]);

    // useEffect(() => {
    //     if (context.selected_location) {
    //         GetAllPickupPoints(options);
    //     }
    // }, [context.selected_location, kitchen_loc, activeTab]);

    // const GetAllPickupPoints = async (option) => {
    //     set_isLoading(true);
    //     const response = await PostApi(API_PATH.getAllPickupLocation, {
    //         kitchen_location_id: context?.selected_location?.kitchen_location_id,
    //         pickup_loc_name: option.search,
    //         sort_by: option.sort,
    //         is_ascending: option.order,
    //         offset: option.page + 1,
    //         limit: option.sizePerPage,
    //         type: "page",
    //         is_active: activeTab,
    //     });
    //     if (response.statusCode === 200) {
    //         set_data(response.data.data_result ?? []);
    //         set_options({ ...option, totalCount: response.data?.data_count ?? 0 });
    //     } else {
    //         set_data([])
    //         set_options({ ...option, totalCount: 0 })
    //     }
    //     set_isLoading(false);
    // };

    const columns = [
        {
            name: 'ID',
            column: 'id',
            options: {
                className: "align-top",
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span className="text-success cursor-pointer" onClick={() => handleRowClick(data[i])}>
                            #{data[i].id}
                        </span>
                    );
                },
            },
        },
        {
            name: 'Group',
            column: 'group',
            options: {
                className: "align-top",
                sort: true,
            },
        },
        {
            name: 'Subscription',
            column: 'subscription',
            options: {
                className: "align-top",
                sort: true,
                CustomBodyRender: (data, i) => {
                    return <>
                        <span>{data[i].name}</span><br />
                        <span>({data[i].number_of_weeks} Week X {data[i].days_per_week} days X {data[i].meals_per_day} meals)</span>
                    </>;
                },
            },
        },
        {
            name: 'User',
            column: 'user',
            options: {
                className: "align-top",
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <div className='text-success'>
                            <span><i className='bx bxs-user me-1'></i>{data[i].user_name}</span><br />
                            <span><i className='bx bxs-envelope me-1'></i>{data[i].email}</span>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Last Charge',
            column: 'last_charge',
            options: {
                className: "align-top text-center",
            },
        },
        {
            name: 'Start',
            column: 'start',
            options: {
                className: "align-top text-center",
            },
        },
        {
            name: 'End',
            column: 'end',
            options: {
                className: "align-top text-center",
            },
        },
        {
            name: 'Amount',
            column: 'amount',
            options: {
                className: "align-top text-center",
            },
        },
        {
            name: 'Renew',
            column: 'renew',
            options: {
                className: "align-top text-center",
            },
        },
    ];

    const handleRowClick = (data) => {
        navigate(`/admin/view-subscription/${data.id}`);
    };

    const tableCallBack = (option) => {
        // GetAllPickupPoints(option);
    };

    const toggle = (tab) => {
        if (activeTab !== tab) {
            set_activeTab(tab);
            context.setpickup_loc_status(tab)
        }
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0 font-size-18">Subscriptions List for <span className='text-info' style={{ fontWeight: "800", fontSize: "17px" }}>{context.selected_location?.kitchen_loc_name}</span></h4>
                            <div className="page-title-right">
                                <button type="button" className="btn primary-bg-light new_button_square_big shadow-none py-2" onClick={() => setOpenHowToModal({ show: true, title: `How to use a Subscription Group from Admin`, link: 'https://www.youtube.com/embed/UB3c9vbICJ4?si=YB9gRkyKSySfTYdd' })}>
                                    <i className="fas fa-question-circle me-2"></i>
                                    How to Open/Close a Delivery Date
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='d-flex align-items-center mt-2'>
                    <div className={activeTab == '1' ? 'active' : ''} onClick={() => toggle('1')}>
                        <button className={`btn ${activeTab == '1' ? 'btn-success' : 'border-success text-success'}`}>Automatic Renewal</button>
                    </div>
                    <div className={activeTab == '0' ? 'active' : ''} onClick={() => toggle('0')}>
                        <button className={`btn ms-2 ${activeTab == '0' ? 'btn-success' : 'border-success text-success'}`}>Manual Renewal</button>
                    </div>
                    <div className={activeTab == '2' ? 'active' : ''} onClick={() => toggle('2')}>
                        <button className={`btn ms-2 ${activeTab == '2' ? 'btn-success' : 'border-success text-success'}`}>Cancelled Subscriptions</button>
                    </div>
                </div>

                {isLoading ? (
                    <Loader />
                ) : (
                    <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                )}
            </div>

            {openHowToModal.show && <HowToModal data={openHowToModal} close={setOpenHowToModal} />}
        </React.Fragment>
    )
}
