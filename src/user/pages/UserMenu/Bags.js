import React from 'react';
import UserMenu from '.';

export default function Bags() {
    return (
        <UserMenu>
            <div className="responsive-container-admin">
                <div className="row">
                    <div className="col-xs-12">
                        <div className="card_table spacer_bottom spacer_top">
                            <div className="row">
                                <div className="col-12 border-bottom spacer_bottom">
                                    <h2>Bags</h2>
                                </div>
                                <div className="col-sm-4 col-xs-12 align-middle spacer_bottom">
                                    <div className='row align-items-start'>
                                        <div className="col-sm-4 text-center">
                                            <img className="shop_bag_img" src="https://lifestylemeals.ttpfitness.com/assets/images/shop.png" alt=" " />
                                            <span className="bg_block_small text-nowrap primary-bg-cls">En Route</span>
                                        </div>
                                        <div className="col-sm-8">
                                            <div className="form-group">
                                                <p><b>Delivery Date: </b>2024-04-10<br /><b>#580</b><small> - Order: #<a href="https://lifestylemeals.ttpfitness.com/checkouts/4587"><b>4587</b></a></small><br />
                                                    <small>Bag Credit When Returned</small>
                                                    <b>($0.00)</b><br /></p>
                                                <label className="control-label"></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UserMenu>
    )
}
