import React from 'react';
import UserMenu from '.';
import { Link } from 'react-router-dom';

export default function CheckoutDetails() {
    return (
        <UserMenu>
            <div className="row stats_page responsive-container-admin">
                <div className="col-12">
                    <div className="card_table spacer_bottom spacer_top">
                        <table border="0" width="98%" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                    <td align="center" valign="top">
                                        <table border="0" width="100%" cellspacing="0" cellpadding="0">
                                            <tbody>
                                                <tr>
                                                    <td valign="top">
                                                        <table border="0" width="100%" cellspacing="0" cellpadding="0">
                                                            <tbody>
                                                                <tr style={{ borderBottom: '1px dashed', borderColor: 'silver' }}>
                                                                    <td align="left" width="50%">
                                                                        <p
                                                                            style={{
                                                                                fontSize: '42px',
                                                                                fontWeight: '600',
                                                                                marginTop: '26px',
                                                                                lineHeight: '46px',
                                                                            }}
                                                                        >
                                                                            TTP Fitness
                                                                        </p>
                                                                    </td>

                                                                    <td align=" left" width="25%">
                                                                        <div className="font-size-18">
                                                                            Order <span className="font-size-38">#4597</span>
                                                                            <small className="d-block">(placed on Apr 08, 2024 09:35 AM)</small>created with
                                                                            success.
                                                                        </div>
                                                                        <br />
                                                                    </td>

                                                                    <td align="right" width="25%" className="paddingBottom">
                                                                        <img src="https://lifestylemeals.ttpfitness.com/checkouts/barcode/4597" />
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>

                                                        <table
                                                            className="paddingTop paddingBottom"
                                                            border="0"
                                                            width="100%"
                                                            cellspacing="0"
                                                            cellpadding="0"
                                                        >
                                                            <tbody>
                                                                <tr style={{ borderBottom: '1px dashed', borderColor: 'silver' }} border="0">
                                                                    <td>
                                                                        Client:<b> jinal Mathukiya</b> <br />
                                                                        Email: <b> jinalmathukiya74@yopmail.com</b>
                                                                        <br />
                                                                        <br />
                                                                        <br />
                                                                    </td>
                                                                    <td valign="top" width="50%">
                                                                        <b>BILLING</b>
                                                                        <br />
                                                                        <br />
                                                                        <br />
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>

                                                        <table
                                                            border="0"
                                                            width="100%"
                                                            cellspacing="0"
                                                            cellpadding="0"
                                                            style={{ borderTop: '1px dashed silver' }}
                                                        >
                                                            <tbody>
                                                                <tr>
                                                                    <td valign="top" width="50%">
                                                                        <div className="my-5" style={{ fontSize: '30px' }}>
                                                                            Delivery for Apr 10, 2024{' '}
                                                                        </div>
                                                                    </td>

                                                                    <td style={{ paddingTop: '30px' }}>
                                                                        <b>
                                                                            DELIVERY TO
                                                                            <br />
                                                                        </b>
                                                                        1<br />
                                                                        2<br /> surat
                                                                        <br />
                                                                        Oregon 97002
                                                                        <br />
                                                                        T: 9586637558{' '}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>

                                                        <h3>
                                                            <table border="0" width="100%" cellspacing="0" cellpadding="0">
                                                                <tbody>
                                                                    <tr className="font-size-18 fw-normal">
                                                                        <td>Bags</td>
                                                                        <td align="right">Total: $0.00</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </h3>
                                                        <table border="0" width="100%" cellspacing="0" cellpadding="0" className="table table-striped">
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ backgroundColor: '#000000', color: 'white' }} align="left">
                                                                        Tracking
                                                                    </th>
                                                                    <th
                                                                        style={{ backgroundColor: '#000000', borderRight: '1px dashed', color: 'white' }}
                                                                        align="left"
                                                                    >
                                                                        Bag Fee
                                                                    </th>
                                                                    <th
                                                                        style={{ backgroundColor: '#000000', borderRight: '1px dashed', color: 'white' }}
                                                                        align="left"
                                                                    >
                                                                        One Time Fee
                                                                    </th>
                                                                    <th
                                                                        style={{ backgroundColor: '#000000', borderRight: '1px dashed', color: 'white' }}
                                                                        align="left"
                                                                    >
                                                                        Bag Credit Once Returned
                                                                    </th>
                                                                    <th
                                                                        style={{ backgroundColor: '#000000', borderRight: '1px dashed', color: 'white' }}
                                                                        align="left"
                                                                    >
                                                                        Status
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td align="left" valign="top">
                                                                        <b></b>
                                                                    </td>
                                                                    <td align="left" valign="top">
                                                                        <b>$0.00</b>
                                                                    </td>
                                                                    <td align="left" valign="top">
                                                                        <b>$0.00</b>
                                                                    </td>
                                                                    <td align="left" valign="top">
                                                                        <b>$0.00</b>
                                                                    </td>
                                                                    <td align="left" valign="top">
                                                                        <b>En Route</b>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>

                                                        <h3>
                                                            <table border="0" width="100%" cellspacing="0" cellpadding="0">
                                                                <tbody>
                                                                    <tr className="font-size-18 fw-normal">
                                                                        <td>
                                                                            Subscription Meals #5644{' '}
                                                                            <Link style={{ marginLeft: '10px' }} className="btn primary-bg-cls" to="/meals">
                                                                                SELECT YOUR MEALS
                                                                            </Link>
                                                                        </td>
                                                                        <td className="text-end">Total: $0.00</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </h3>
                                                        <table
                                                            border="0"
                                                            width="100%"
                                                            cellspacing="0"
                                                            cellpadding="0"
                                                            style={{ marginBottom: '30px' }}
                                                        >
                                                            <thead>
                                                                <tr>
                                                                    <th
                                                                        style={{ backgroundColor: '#000000', color: 'white' }}
                                                                        align="left"
                                                                        bgcolor="#EAEAEA"
                                                                    >
                                                                        Meal
                                                                    </th>
                                                                    <th
                                                                        style={{ backgroundColor: '#000000', color: 'white' }}
                                                                        align="left"
                                                                        bgcolor="#EAEAEA"
                                                                    >
                                                                        Price
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td align="left" valign="top">
                                                                        <Link
                                                                            to="/currentmenu/D29B7CEFBFBDC8BC4ACD83795013EFBF"
                                                                            className="text-decoration-underline"
                                                                        >
                                                                            Sweet Potato Hash
                                                                        </Link>
                                                                    </td>
                                                                    <td align="right" valign="top">
                                                                        Inc.{' '}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="left" valign="top">
                                                                        <Link
                                                                            to="/currentmenu/457FEFBFBD7BEFBFBD3D44EFBFBDEFBF"
                                                                            className="text-decoration-underline"
                                                                        >
                                                                            Multi Images
                                                                        </Link>
                                                                    </td>
                                                                    <td align="right" valign="top">
                                                                        Inc.{' '}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>

                                                        <table
                                                            style={{
                                                                marginTop: '60px',
                                                                paddingBottom: '20px',
                                                                paddingTop: '20px',
                                                                borderBottom: '1px dashed',
                                                                borderTop: '1px dashed',
                                                                borderColor: 'silver',
                                                            }}
                                                            border="0"
                                                            width="100%"
                                                            cellspacing="0"
                                                            cellpadding="0"
                                                        >
                                                            <tbody>
                                                                <tr>
                                                                    <td align="right">Sub-total</td>
                                                                    <td align="right">$0.00</td>
                                                                </tr>

                                                                <tr>
                                                                    <td align="right">Processing Fee</td>
                                                                    <td align="right">$0.00 </td>
                                                                </tr>

                                                                <tr>
                                                                    <td align="right">Delivery</td>
                                                                    <td align="right">Free</td>
                                                                </tr>

                                                                <tr>
                                                                    <td align="right">
                                                                        <b>Total</b>
                                                                    </td>
                                                                    <td align="right">
                                                                        <b>$0.00</b>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div className="text-center">
                                            If you have any question please{' '}
                                            <Link to="/" target="_blank" rel="noopener">
                                                Contact us
                                            </Link>{' '}
                                            in our form or directly to{' '}
                                            <a href="mailto:info@ttpfitness.com" target="_blank" rel="noopener">
                                                info@ttpfitness.com
                                            </a>
                                            <p align="center">
                                                <b>Thank you!</b> TTP Fitness
                                            </p>
                                        </div>{' '}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </UserMenu>
    );
}
