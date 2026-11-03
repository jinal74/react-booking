import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="position-relative">
            <div className="footer-main-class position-relative">
                <div className="container-user">
                    <div className="row pb-3">
                        <div className="col-md-6 col-12 text-md-start text-center mb-lg-0 mb-md-4 mb-3 pe-lg-5 pe-2">
                            <div className="ftr-links-part">
                                <div className="footer-logo mb-sm-4 mb-2">
                                    <Link to="/#">
                                        <div className='title_1 text_footer'>
                                            <b>TTP Fitness</b>
                                        </div>
                                    </Link>
                                </div>
                                <p className='text-white'>
                                    <a className="text-white" href="mailto:info@ttpfitness.com" title="TTP Fitness Mail">
                                        info@ttpfitness.com
                                    </a>
                                </p>
                                <button className='btn btn-light'>
                                    Invite a friend
                                </button>
                                <div className="social-media-links mt-3 mt-sm-5 justify-content-md-start justify-content-center">
                                    <Link to="/" className="social-comn-box me-2">
                                        <i className='bx bxl-facebook fs-4'></i>
                                    </Link>
                                    <Link to="/" className="social-comn-box">
                                        <i className='bx bxl-instagram fs-4'></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 col-sm-12 text-md-start text-center mb-md-0 mb-3 pe-2">
                            <div className="ftr-links-part">
                                <span className="d-block">TTP Fitness</span>
                                <ul>
                                    <li>
                                        <Link to="/subscription">
                                            My Subscription
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/pages/privacy">
                                            Privacy Policy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/pages/faq">
                                            F.A.Q.
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/pickuppoints">
                                            Pickup Locations
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 col-sm-12 text-md-start text-center mb-md-0 mb-3 pe-2">
                            <div className="ftr-links-part">
                                <span className="d-block">Meal Ordering</span>
                                <ul>
                                    <li>
                                        <Link to="/mealsbyunit">
                                            À la Carte
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/packs">
                                            Meal Packs
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/subscription">
                                            Weekly Subscription
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/giftcard">
                                            Gift Card
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className='footer-sub-part'>
                        © {new Date().getFullYear()} TTP Fitness. All Rights Reserved.
                    </div>
                </div>
            </div>
        </footer>
    )
}
