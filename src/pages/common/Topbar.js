import React from 'react'

export default function Topbar() {
    return (
        <div className='main-topbar-cls'>
            <div className='container-user'>
                <div className="row align-items-center">
                    <div className="col-6 ps-3">
                        <div className="">
                            <a className="text-white" href="mailto:info@ttpfitness.com" title="TTP Fitness Mail">
                                <i className="fas fa-at primary-color-cls"></i> info@ttpfitness.com
                            </a>
                        </div>
                    </div>
                    <div className="col-6 text-end py-2">
                        <div className="fs-6 text-white">Timer to Cutoff</div>
                        <div className="countdown mt-2 d-inline-block text-white text-center">
                            <div>
                                <span className="days">0</span>
                                <div className="smalltext">Days</div>
                            </div>
                            <div className='ms-1'>
                                <span className="hours ms-1">09</span>
                                <div className="smalltext">Hours</div>
                            </div>
                            <div className='ms-1'>
                                <span className="minutes">04</span>
                                <div className="smalltext">Minutes</div>
                            </div>
                            <div className="d-md-inline-block d-none ms-1">
                                <span className="seconds">53</span>
                                <div className="smalltext">Seconds</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
