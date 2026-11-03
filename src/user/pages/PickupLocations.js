import React from 'react';
import Topbar from '../../pages/common/Topbar';
import Landing from '../../pages/common/Landing';

export default function PickupLocations() {
    return (
        <div>
            <Topbar />
            <Landing>
                <div className="page-content-wrapper pickup-locations-main">
                    <div className="container-fluid">
                        <div className="container-user">
                            <div className='row spacer_top spacer_bottom'>
                                <div className="col-md-8 col-sm-12">
                                    <h1>Pickup Locations</h1>
                                    <div className="fixed-content">
                                        <div className="fixed-item pickuppoints">
                                            <div className="item pickuppoint pickuppoint_1">
                                                <div className="row">
                                                    <div className="col-12 font-size-18">
                                                        <h4 className='my-3'>TTP Fitness: </h4>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-10 col-sm-8">
                                                        <div className="adress-pickup">14199 SW Millikan Way,<br />Beaverton, OR 97005</div>
                                                    </div>
                                                    <div className="col-md-2 col-sm-4">
                                                        <button id="markers" className="btn primary-bg-cls item-btn">
                                                            <i className="fas fa-search-location"></i>
                                                            <div className="ripple-container"></div>
                                                        </button>
                                                        <a href="https://www.google.com/maps/place/14199+SW+Millikan+Way/0.00000000,0.00000000" target="_blank" className="btn primary-bg-cls item-btn-mobile">
                                                            <i className="fas fa-search-location"></i>
                                                            <div className="ripple-container"></div>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12">
                                    <iframe
                                        src="https://www.google.com/maps/embed"
                                        className='w-100 h-100'
                                        frameBorder="0"
                                        allowFullScreen=""
                                        tabIndex="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Landing>
        </div>
    )
}
