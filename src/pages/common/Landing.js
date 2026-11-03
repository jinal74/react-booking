import React, { useContext, useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import { Context } from '../../context/GeneralContext';

export default function Landing(props) {
    const context = useContext(Context);
    const [kitchen_locations_List, set_kitchen_locations_List] = useState([]);

    useEffect(() => {
        set_kitchen_locations_List(context.kitchen_loc_list ?? []);
    }, [context.kitchen_loc_list]);

    useEffect(() => {
        let target = document.getElementsByClassName('dropdown-header');
        let target1 = document.getElementsByClassName('bx bx-chevron-down ms-2 fs-4 align-middle');
        document.addEventListener('click', (e) => {
            if (!(e.target === target[0] || e.target === target1[0])) setIsOpen(false);
        })
    }, [])

    const [isOpen, setIsOpen] = useState(false);

    const toggling = () => setIsOpen(!isOpen);

    const onOptionClicked = (selectedLocation) => {
        context.set_selected_location(selectedLocation);
        setIsOpen(false);
    };

    return (
        <>
            <Header />
            {kitchen_locations_List.length > 1 && (
                <div className='main-topbar-cls'>
                    <div className='container-user'>
                        <div className="row align-items-center">
                            <div className="col-12 py-2 kitchen-location-drpdwn">
                                <div className='d-flex align-items-center justify-content-center'>
                                    <span>Location:</span>
                                    <div className="dropdown-container ms-2">
                                        <div className="dropdown-header d-flex justify-content-evenly align-items-center" onClick={toggling}>
                                            {(kitchen_locations_List.length > 0 && context?.selected_location?.kitchen_loc_name) || "Select an option"}
                                            <i className="bx bx-chevron-down ms-2 fs-4 align-middle" />
                                        </div>
                                        {isOpen && (
                                            <div className="dropdown-list-container">
                                                <ul className="dropdown-list">
                                                    {kitchen_locations_List.map((loc) => (
                                                        <li className={`dropdown-list-item ${context?.selected_location?.kitchen_location_id === loc.kitchen_location_id ? 'active' : ''}`} onClick={() => onOptionClicked(loc)} key={loc.kitchen_location_ids}>
                                                            {loc.kitchen_loc_name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {props.children}
            <Footer />

            <Link to="/cart" className="d-flex fixed-cart bg-white float-cart align-items-center flex-wrap">
                <div className="col-md-4 col-sm-4 align-middle">
                    <i className="fas fa-shopping-basket"></i>
                </div>
                <div className="circle-badge wrapTotalItemBadge">
                    <span className="item totalItemBadge">{context.cartData.totalItems}</span>
                </div>

                <div id="float-cart" className="col-md-8 col-sm-8 text-start"><b className="totalItemBadge-float">{context.cartData.totalItems}</b> <b>items</b> <br /><b className="totalPrice-cart-float bold">${context.cartData.subTotal?.toFixed(2)}</b></div>

                <div className="col-sm-12 text-end">
                    <div>
                        <small className="badge primary-bg-cls">Go to cart</small>
                    </div>
                </div>

            </Link>
        </>
    )
}
