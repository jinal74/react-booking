import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Tables/CustDataTable';

export default function DeliveryRouteMethod() {
    const navigate = useNavigate();
    const [data, set_data] = useState([
        {
            id: 1,
            state: '',
            zip_code: '97002',
            weight: '0',
            country: '',
            price: 20,
            tax: 0,
            delivery_route: 'Route 1',
            gift_card: 1,
            la_carte: 1,
            meal_packs: 1,
            subscription_creation: 1,
            weekly_subscription: 1,
        }
    ]);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 1,
        sizePerPage: 10,
        search: '',
        sort: 'zip_code',
        order: 1,
        selected_row: [],
        checkbox: true,
        unique_field: 'id',
    });

    const columns = [
        {
            name: 'Transporter',
            column: 'delivery_route',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span className='text-success'>{data[i].delivery_route}</span>
                    );
                },
            },
        },
        {
            name: 'Weight',
            column: 'weight',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span>{data[i].weight} LB</span>
                    );
                },
            },
        },
        {
            name: 'Price',
            column: 'price',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    return (
                        <span>${data[i].price}</span>
                    );
                },
            },
        },
        {
            name: 'Allow To?',
            column: 'modules_allowed',
            options: {
                sort: true,
                CustomBodyRender: (data, i) => {
                    let allowed = [];
                    if (data[i].gift_card == 1) allowed.push('Gift Card');
                    if (data[i].la_carte == 1) allowed.push('À la Carte');
                    if (data[i].meal_packs == 1) allowed.push('Meal Packs');
                    if (data[i].subscription_creation == 1) allowed.push('Subscription Creation');
                    if (data[i].weekly_subscription == 1) allowed.push('Weekly Subscription');
                    return <>
                        {allowed.map((item, index) => {
                            if (index == (allowed.length - 1)) return <div key={index}><span className='dotted-underline'>{item}</span></div>;
                            else return <div key={index}><span className='dotted-underline'>{item + ','}</span></div>;
                        })}
                    </>;
                },
            },
        },
    ];

    const handleRowClick = (data) => {
        navigate(`/admin/delivery-settings/edit-zipcodes/${data.id}`);
    };

    const tableCallBack = (option) => {
        set_options(option);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="row">
                    <div className='col-12'>
                        <div className='page-title-box d-sm-flex align-items-center'>
                            <span
                                className="d-flex align-items-center p-0 me-3 cursor-pointer"
                                onClick={() => navigate('/admin/delivery-settings/zipcodes')}
                            >
                                <i className="bx bx-arrow-back fs-3"></i>
                            </span>
                            <h3 className="mb-sm-0 font-size-18">Delivery Routes & Methods for 97002 - Oregon for Default Kitchen</h3>
                            <div className='ms-auto'>
                                <div className="page-title-right">
                                    <button type="button" className="btn btn-dark ">
                                        + Add new
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
            </div>
        </React.Fragment>
    )
}
