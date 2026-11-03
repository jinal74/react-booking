import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../assets/images/logo.png";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";
import { Context } from "../../context/GeneralContext";
import { PostApi } from "../../services/ApiService";
import { API_PATH_USER } from "../../const";

export default function Header() {
    const context = useContext(Context);
    const location = useLocation();
    const token = localStorage.getItem('token_auth');
    const [menu, setMenu] = useState(false);
    const [profileMenu, setProfileMenu] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [user_details, set_user_details] = useState(context.user_details);

    const addactiveclass = () => {
        document.getElementById("menu-box").classList.toggle("active");
        document.getElementById("menu-icon").classList.toggle("active");
    };

    useEffect(() => {
        setIsLogin(token ? true : false);
    }, [token])

    useEffect(() => {
        if (!context.user_details && token) {
            GetuserDetails();
        }
        set_user_details(context.user_details);
    }, [context.user_details]);

    const GetuserDetails = async () => {
        const response = await PostApi(API_PATH_USER.login);
        if (response.statusCode === 200) {
            context.set_user_details(response.data);
        }
    }

    return (
        <header className="main-header-section">
            <div className="main-header-row">
                <div className="container-user">
                    <div className="row m-0">
                        <div className="col-12 header-main-class">
                            <div className="header-class justify-content-between">
                                <div className="me-auto header-logo-left text-start">
                                    <Link to="/" className="d-block header-logo-parent">
                                        <img src={Logo} className="img-fluid logo" alt="" />
                                    </Link>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="header-options mx-auto" id="menu-box">
                                        <ul>
                                            <li>
                                                <Dropdown isOpen={menu} toggle={() => setMenu(!menu)} className="d-block">
                                                    <DropdownToggle className="btn btn-toggle py-3 primary-bg-cls" id="page-header-user-dropdown" tag="button">
                                                        Order
                                                        <i className="bx bx-chevron-down ms-1 fs-4" />
                                                    </DropdownToggle>
                                                    <DropdownMenu className="dropdown-menu-end">
                                                        <Link to="/mealsbyunit">
                                                            <DropdownItem className={`${location.pathname?.includes('mealsbyunit') ? 'active' : ''}`}>À la Carte</DropdownItem>
                                                        </Link>
                                                        <Link to="/packs">
                                                            <DropdownItem className={`${location.pathname?.includes('packs') ? 'active' : ''}`}>Meal Packs</DropdownItem>
                                                        </Link>
                                                        <Link to="/meals">
                                                            <DropdownItem className={`${location.pathname?.includes('subscription') ? 'active' : ''}`}>Weekly Subscription</DropdownItem>
                                                        </Link>
                                                        <Link to="/giftcard">
                                                            <DropdownItem className={`${location.pathname?.includes('giftcard') ? 'active' : ''}`}>Gift Card</DropdownItem>
                                                        </Link>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </li>
                                            <li className={`${location.pathname?.includes('currentmenu') ? 'active' : ''}`}>
                                                <Link to="/currentmenu">
                                                    <span>View Menu</span>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/pages/faq">
                                                    <span>F.A.Q.</span>
                                                </Link>
                                            </li>
                                            {
                                                isLogin &&
                                                <li className={`${location.pathname?.includes('subscription') ? 'active' : ''}`}>
                                                    <Link to="/subscription">
                                                        <span>My Subscription</span>
                                                    </Link>
                                                </li>
                                            }
                                        </ul>
                                    </div>
                                    <div className="ms-auto d-flex align-items-center">
                                        <div className={isLogin ? "" : "header-rgt-part"}>
                                            <ul className="d-flex align-items-center">
                                                <li className="p-3">
                                                    <Link to="/cart">
                                                        <div className='position-relative d-inline-block'>
                                                            <i className='bx bx-shopping-bag fs-4 align-bottom'></i>
                                                            {context.cartData.totalItems > 0 && <span className="badge rounded-circle bg-danger position-absolute top-0 start-100 translate-middle">{context.cartData.totalItems}</span>}
                                                        </div>
                                                    </Link>
                                                </li>
                                                {isLogin ? (
                                                    <li className="">
                                                        <Dropdown isOpen={profileMenu} toggle={() => setProfileMenu(!profileMenu)} className="d-inline-block">
                                                            <DropdownToggle className="btn pe-0" id="page-header-user-dropdown" tag="button">
                                                                <span className="header-profile-userName user-name">
                                                                    {user_details?.user_first_name?.charAt(0)}{user_details?.user_last_name?.charAt(0)}
                                                                </span>
                                                            </DropdownToggle>
                                                            <DropdownMenu className="dropdown-menu-end">
                                                                <span className="px-3">{user_details?.user_first_name} {user_details?.user_last_name}</span>
                                                                <div className="dropdown-divider" />
                                                                <Link to="/profile">
                                                                    <DropdownItem className={`${location.pathname?.includes('profile') ? 'active' : ''}`}>
                                                                        <i className="bx bx-user font-size-20 align-middle me-1" />
                                                                        Profile
                                                                    </DropdownItem>
                                                                </Link>
                                                                {
                                                                    user_details?.is_allowed_admin_panel === 1 &&
                                                                    <Link to="/admin">
                                                                        <DropdownItem>
                                                                            <i className="bx bx-dish font-size-20 align-middle me-1" />
                                                                            Admin
                                                                        </DropdownItem>
                                                                    </Link>
                                                                }
                                                                <Link to="/subscription">
                                                                    <DropdownItem className={`${location.pathname?.includes('subscription') ? 'active' : ''}`}>
                                                                        <i className="bx bx-dish font-size-20 align-middle me-1" />
                                                                        My Subscription
                                                                    </DropdownItem>
                                                                </Link>
                                                                <Link to="">
                                                                    <DropdownItem>
                                                                        <i className="bx bx-shopping-bag font-size-20 align-middle me-1" />
                                                                        My Checkouts
                                                                    </DropdownItem>
                                                                </Link>
                                                                <Link to="/logout">
                                                                    <DropdownItem>
                                                                        <i className="bx bx-power-off font-size-20 align-middle me-1 text-danger" />
                                                                        Log off
                                                                    </DropdownItem>
                                                                </Link>
                                                            </DropdownMenu>
                                                        </Dropdown>
                                                    </li>
                                                ) : (
                                                    <>
                                                        <li className="d-md-show "><Link to="/register">Sign up</Link></li>
                                                        <li className="d-md-show "><Link to="/login">Login</Link></li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="responsive-menu ms-3" onClick={addactiveclass}>
                                    <div className="header-menu-icon d-flex align-items-center justify-content-center">
                                        <div className="menu-togle-new-class" id="menu-icon">
                                            <span className="line"></span>
                                            <span className="line"></span>
                                            <span className="line"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
