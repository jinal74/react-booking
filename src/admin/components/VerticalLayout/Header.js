import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.svg';
import logoLightSvg from '../../assets/images/logo-light.svg';
import { showRightSidebarAction, toggleLeftmenu, changeSidebarType } from '../../store/actions';
import { Context } from '../../../context/GeneralContext';
import { PostApi } from '../../../services/ApiService';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { API_PATH_USER } from '../../../const';

const Header = (props) => {
    const context = useContext(Context);
    const token = localStorage.getItem('token_auth');
    const [search, setsearch] = useState(false);
    const [user_details, set_user_details] = useState(context.user_details);
    const [menu, setMenu] = useState(false);
    const [toggle_screen, set_toggle_screen] = useState(false);

    useEffect(() => {
        if (!context.user_details && token) {
            GetuserDetails();
        }
        set_user_details(context.user_details);
    }, [context.user_details]);

    useEffect(() => {
        window.matchMedia('(display-mode: fullscreen)').addEventListener('change', ({ matches }) => {
            if (matches) {
                window.isFullScreen = true;
                set_toggle_screen(true)
            } else {
                window.isFullScreen = false;
                set_toggle_screen(false)
            }
        });
    }, [])

    const GetuserDetails = async () => {
        const response = await PostApi(API_PATH_USER.login);
        if (response.statusCode === 200) {
            context.set_user_details(response.data);
        }
    }

    function toggleFullscreen() {
        if (
            !document.fullscreenElement &&
            /* alternative standard method */ !document.mozFullScreenElement &&
            !document.webkitFullscreenElement
        ) {
            // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
            set_toggle_screen(true)
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
            set_toggle_screen(false)
        }
    }

    function tToggle() {
        var body = document.body;
        if (window.screen.width <= 998) {
            body.classList.toggle('sidebar-enable');
        } else {
            body.classList.toggle('vertical-collpsed');
            body.classList.toggle('sidebar-enable');
        }
    }

    return (
        <React.Fragment>
            <header id="page-topbar">
                <div className="navbar-header">
                    <div className="d-flex">
                        <div className="navbar-brand-box d-lg-none d-md-block">
                            <Link to="/" className="logo logo-dark">
                                <span className="logo-sm">
                                    <img src={logo} alt="" height="22" />
                                </span>
                            </Link>

                            <Link to="/" className="logo logo-light">
                                <span className="logo-sm">
                                    <img src={logoLightSvg} alt="" height="22" />
                                </span>
                            </Link>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                tToggle();
                            }}
                            className="btn btn-sm px-3 font-size-16 header-item "
                            id="vertical-menu-btn"
                        >
                            <i className="fa fa-fw fa-bars" />
                        </button>
                    </div>
                    <div className="d-flex align-items-center">
                        {/* <div className="dropdown d-inline-block d-lg-none ms-2">
                            <button
                                onClick={() => {
                                    setsearch(!search);
                                }}
                                type="button"
                                className="btn header-item noti-icon "
                                id="page-header-search-dropdown"
                            >
                                <i className="mdi mdi-magnify" />
                            </button>
                            <div
                                className={
                                    search
                                        ? 'dropdown-menu dropdown-menu-lg dropdown-menu-end p-0 show'
                                        : 'dropdown-menu dropdown-menu-lg dropdown-menu-end p-0'
                                }
                                aria-labelledby="page-header-search-dropdown"
                            >
                                <form className="p-3">
                                    <div className="form-group m-0">
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search ..."
                                                aria-label="Recipient's username"
                                            />
                                            <div className="input-group-append">
                                                <button className="btn btn-primary" type="submit">
                                                    <i className="mdi mdi-magnify" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div> */}

                        <p className="text-user-details text-end mb-0 ms-2">
                            {(user_details?.user_first_name ?? '') + ' ' + (user_details?.user_last_name ?? '')}
                            <bdi className="d-block">{(user_details?.user_email ?? '')}</bdi>
                        </p>
                        <Dropdown isOpen={menu} toggle={() => setMenu(!menu)} className="d-inline-block">
                            <DropdownToggle className="btn header-item " id="page-header-user-dropdown" tag="button">
                                {user_details?.user_profile_image ?
                                    <img className="rounded-circle header-profile-user" src={user_details?.user_profile_image} alt="Header Avatar" />
                                    : <span className="rounded-circle header-profile-user user-name p-2">{((user_details?.user_first_name?.charAt(0) ?? '') + (user_details?.user_last_name?.charAt(0) ?? ''))?.toUpperCase()}</span>
                                }
                                <i className="mdi mdi-chevron-down d-none d-xl-inline-block ms-2 fs-4" />
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-end">
                                <Link to="/logout" className="dropdown-item">
                                    <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
                                    <span>Logout</span>
                                </Link>
                            </DropdownMenu>
                        </Dropdown>

                        <div className="dropdown d-none d-lg-inline-block ms-1">
                            <button
                                type="button"
                                onClick={() => {
                                    toggleFullscreen();
                                }}
                                className="btn header-item noti-icon "
                                data-toggle="fullscreen"
                            >
                                {toggle_screen ?
                                    <i className="bx bx-exit-fullscreen" /> :
                                    <i className="bx bx-fullscreen" />
                                }
                            </button>
                        </div>

                        <div
                            onClick={() => {
                                props.showRightSidebarAction(!props.showRightSidebar);
                            }}
                            className="dropdown d-inline-block"
                        >
                            <button type="button" className="btn header-item noti-icon right-bar-toggle ">
                                <i className="bx bx-cog bx-spin" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        </React.Fragment>
    );
};

Header.propTypes = {
    changeSidebarType: PropTypes.func,
    leftMenu: PropTypes.any,
    leftSideBarType: PropTypes.any,
    showRightSidebar: PropTypes.any,
    showRightSidebarAction: PropTypes.func,
    toggleLeftmenu: PropTypes.func,
};

const mapStatetoProps = (state) => {
    const { layoutType, showRightSidebar, leftMenu, leftSideBarType } = state.Layout;
    return { layoutType, showRightSidebar, leftMenu, leftSideBarType };
};

export default connect(mapStatetoProps, {
    showRightSidebarAction,
    toggleLeftmenu,
    changeSidebarType,
})(Header);
