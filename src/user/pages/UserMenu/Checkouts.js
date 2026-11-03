import React, { useState } from 'react';
import UserMenu from '.';
import DataTable from '../../../pages/Tables/CustDataTable';
import HowToModal from '../../../pages/ModalsCommon/HowToModal';
import { Link } from 'react-router-dom';

export default function Checkouts() {
    const [openHowToModal, setOpenHowToModal] = useState({ show: false, link: '', title: '' });
    const [data, set_data] = useState([
        {
            id: '4597',
            date: 'Apr 08, 2024 09:35 AM',
            type: 'Weekly Subscription',
            amount: '0.00'

        }
    ]);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
    });

    const columns = [
        {
            name: 'Order',
            column: 'id',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <Link to={`/checkouts/${data[i].id}`}><span className="primary-color-cls cursor-pointer">#{data[i].id}</span></Link>
                    );
                },
            },
        },
        {
            name: 'Date',
            column: 'date',
            options: {
                sort: true
            },
        },
        {
            name: 'Type',
            column: 'type',
            options: {
                sort: true
            },
        },
        {
            name: 'Amount',
            column: 'amount',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span className="">${data[i].amount}</span>
                    );
                },
            },
        }
    ];

    const tableCallBack = (option) => {
        set_options(option);
    };

    return (
        <UserMenu>
            <div className="row stats_page responsive-container-admin">
                <div className="col-12 mt-4">
                    <div className="card_table spacer_bottom spacer_top pt-0">
                        <div className="row border-bottom spacer_bottom align-items-center">
                            <div className="col-md-6 col-12">
                                <h2>Checkouts</h2>
                            </div>
                            <div className="col-md-6 col-12 text-md-end text-center">
                                <button type="button" className="btn btn-dark new_button_square_big py-2" onClick={() => setOpenHowToModal({ show: true, title: 'How to Re Order from Previous Checkout', link: 'https://www.youtube.com/embed/pLjxrHiQuTo' })}>
                                    <i className="fas fa-question-circle white me-2"></i>
                                    How to Re Order from Previous Checkout
                                </button>
                            </div>
                        </div>
                        <div className="dataTables_wrapper form-inline dt-bootstrap no-footer">
                            <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                        </div>
                    </div>
                </div>
            </div>

            {openHowToModal.show && <HowToModal data={openHowToModal} close={setOpenHowToModal} />}
        </UserMenu>
    )
}
