import React, { useState } from 'react';
import UserMenu from '.';
import DataTable from '../../../pages/Tables/CustDataTable';

export default function Transactions() {
    const [data, set_data] = useState([]);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 10,
    });

    const columns = [
        {
            name: 'Creation',
            column: 'creation',
            options: {
                sort: true
            },
        },
        {
            name: 'Value',
            column: 'value',
            options: {
                sort: true
            },
        },
        {
            name: 'Description',
            column: 'description',
            options: {
                sort: true
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
                                <h2>Digital Wallet Transactions</h2>
                            </div>
                            <div className="col-md-6 col-12 text-md-end text-center font-size-17">
                                <b>Balance: $0.00</b>
                            </div>
                        </div>
                        <div className="dataTables_wrapper form-inline dt-bootstrap no-footer">
                            <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                        </div>
                    </div>
                </div>
            </div>
        </UserMenu>
    )
}
