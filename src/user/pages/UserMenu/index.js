import React, { useContext, useState } from "react";
import Topbar from "../../../pages/common/Topbar";
import Landing from "../../../pages/common/Landing";
import { Link, useLocation } from "react-router-dom";
import { Context } from "../../../context/GeneralContext";

export default function UserMenu({ children }) {
    const location = useLocation();
    const context = useContext(Context);
    const [opened, setOpened] = useState(false);

    const handleOpenSidebar = () => {
        setOpened(!opened);
    };

    return (
        <React.Fragment>
            <Topbar />
            <Landing>
                <div className="profile">
                    <div className="d-flex flex-wrap back_content">
                        <div className="col-12 col-lg-2 back_sidemenu padding-xs-col">
                            <div className="d-lg-none d-block row">
                                <div>
                                    <nav role="navigation" className="pb-3">
                                        <div id="menuToggle" className="profileSidebar">
                                            <input
                                                type="checkbox"
                                                id="menu_icon_side"
                                                className={opened ? "fix_trigger_position" : ""}
                                                checked={opened}
                                                onChange={handleOpenSidebar}
                                            />
                                            <div className="primary-bg-cls TriggerButton">
                                                <i className="fas fa-user-cog me-2"></i>
                                                Edit Profile Settings
                                            </div>
                                            <ul
                                                id="menu"
                                                className="navProfile navProfile-stacked subNav  marginBottom"
                                            >
                                                <div
                                                    className="closeSidebarProfile cursor"
                                                    onClick={handleOpenSidebar}
                                                >
                                                    <div className="fa-stack fa-lg">
                                                        <i className="fa fa-circle fa-stack-2x"></i>
                                                        <i className="fas fa-angle-left fa-stack-1x fa-inverse"></i>
                                                    </div>
                                                </div>
                                                <li>
                                                    <div className="avatar-upload">
                                                        <div className="avatar-edit">
                                                            <input
                                                                name="image"
                                                                id="image"
                                                                type="file"
                                                                accept="image/*;capture=camera"
                                                            />
                                                            <label htmlFor="image"></label>
                                                        </div>
                                                        <div className="avatar-preview">
                                                            <div
                                                                style={{
                                                                    backgroundImage:
                                                                        "url('https://lifestylemeals.ttpfitness.com/data/users/359.jpg?md=151cf7f3ded26f7cba7897e90e7802ee')",
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="padding-xs-col">
                                                        <h2 className="mb-3">Welcome </h2>
                                                    </div>

                                                    <Link className="cursor" to="/profile">
                                                        <small className="font-size-12">
                                                            Jinal Mathukiya
                                                        </small>
                                                    </Link>
                                                </li>
                                                <li className="marginTop paddingTop spacer">
                                                    <Link to="/logout">
                                                        <i className="fas fa-power-off"></i>
                                                        Log off
                                                    </Link>
                                                </li>
                                                <hr />
                                                <li
                                                    className={`${location.pathname?.includes("profile")
                                                        ? "active"
                                                        : ""
                                                        }`}
                                                >
                                                    <Link to="/profile">
                                                        <span className="d-flex align-items-center">
                                                            <svg
                                                                className=""
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                                                ></path>
                                                            </svg>
                                                            <span className="ms-1">My Profile</span>
                                                        </span>
                                                    </Link>
                                                    <span className="position-absolute active-menu-span"></span>
                                                </li>
                                                <li
                                                    className={`${location.pathname?.includes("subscription") ||
                                                        location.pathname?.includes("meals") ||
                                                        location.pathname?.includes("stats")
                                                        ? "active"
                                                        : ""
                                                        } position-relative py-1`}
                                                >
                                                    <a className="align-items-center w-100 transition-colors duration-150  hover:text-green-600 dark:hover:text-green-600 text-slate-900">
                                                        <span className="d-flex align-items-center">
                                                            <svg
                                                                className=""
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                                                                ></path>
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                                                                ></path>
                                                            </svg>
                                                            <span className="ms-1">My Subscription</span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li className="menuSubMenu menu2">
                                                    <ul className="navProfile navProfile-stacked">
                                                        <li
                                                            className={`${location.pathname?.includes("subscriptions")
                                                                ? "active"
                                                                : ""
                                                                }`}
                                                        >
                                                            <Link to="/subscriptions">
                                                                <i className="fas fa-angle-right"></i>{" "}
                                                                Subscription
                                                            </Link>
                                                            <span className="position-absolute active-menu-span"></span>
                                                        </li>
                                                        <li
                                                            className={`${location.pathname?.includes("meals")
                                                                ? "active"
                                                                : ""
                                                                }`}
                                                        >
                                                            <Link
                                                                to={
                                                                    context.subscriptionDatesArray?.length > 0
                                                                        ? `/meals?dd=${context.subscriptionDatesArray?.[0]?.year}-${context.subscriptionDatesArray?.[0]?.month}-${context.subscriptionDatesArray?.[0]?.date}`
                                                                        : "/subscription"
                                                                }
                                                            >
                                                                <i className="fas fa-angle-right"></i> Select
                                                                meals
                                                            </Link>
                                                            <span className="position-absolute active-menu-span"></span>
                                                        </li>
                                                        <li
                                                            className={`${location.pathname?.includes("stats")
                                                                ? "active"
                                                                : ""
                                                                }`}
                                                        >
                                                            <Link to="/stats">
                                                                <i className="fas fa-angle-right"></i> Macro
                                                                Tracking
                                                            </Link>
                                                            <span className="position-absolute active-menu-span"></span>
                                                        </li>
                                                    </ul>
                                                </li>
                                                <li
                                                    className={`${location.pathname?.includes("bags") ||
                                                        location.pathname?.includes("checkouts") ||
                                                        location.pathname?.includes("transactions")
                                                        ? "active"
                                                        : ""
                                                        } position-relative py-1`}
                                                >
                                                    <a className="align-items-center w-100  transition-colors duration-150  hover:text-green-600 dark:hover:text-green-600 text-slate-900">
                                                        <span className="d-flex align-items-center">
                                                            <svg
                                                                className=""
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
                                                                ></path>
                                                            </svg>
                                                            <span className="ms-1">My Checkouts</span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li className="menuSubMenu menu3">
                                                    <ul className="navProfile navProfile-stacked">
                                                        <li
                                                            className={`${location.pathname?.includes("bags")
                                                                ? "active"
                                                                : ""
                                                                }`}
                                                        >
                                                            <Link to="/profile/bags">
                                                                <i className="fas fa-angle-right"></i> Bags
                                                            </Link>
                                                            <span className="position-absolute active-menu-span"></span>
                                                        </li>
                                                        <li
                                                            className={`${location.pathname?.includes("checkouts")
                                                                ? "active"
                                                                : ""
                                                                }`}
                                                        >
                                                            <Link to="/checkouts">
                                                                <i className="fas fa-angle-right"></i> Checkouts
                                                            </Link>
                                                            <span className="position-absolute active-menu-span"></span>
                                                        </li>
                                                        <li
                                                            className={`${location.pathname?.includes("transactions")
                                                                ? "active"
                                                                : ""
                                                                }`}
                                                        >
                                                            <Link to="/profile/transactions">
                                                                <i className="fas fa-angle-right"></i> Digital
                                                                Wallet Transactions
                                                            </Link>
                                                            <span className="position-absolute active-menu-span"></span>
                                                        </li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </div>
                                    </nav>
                                </div>
                            </div>
                            <ul className="navProfile navProfile-stacked subNav d-lg-block d-none marginBottom">
                                <li>
                                    <div className="avatar-upload">
                                        <div className="avatar-edit">
                                            <input
                                                name="image"
                                                id="image"
                                                type="file"
                                                accept="image/*;capture=camera"
                                            />
                                            <label htmlFor="image"></label>
                                        </div>
                                        <div className="avatar-preview">
                                            <div
                                                style={{
                                                    backgroundImage:
                                                        "url('https://lifestylemeals.ttpfitness.com/data/users/359.jpg?md=151cf7f3ded26f7cba7897e90e7802ee')",
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div className="padding-xs-col">
                                        <h2 className="mb-3">Welcome </h2>
                                    </div>

                                    <Link className="cursor" to="/profile">
                                        <small className="font-size-12">Jinal Mathukiya</small>
                                    </Link>
                                </li>
                                <li className="marginTop paddingTop spacer">
                                    <Link to="/logout">
                                        <i className="fas fa-power-off"></i>
                                        Log off
                                    </Link>
                                </li>
                                <hr />
                                <li
                                    className={`${location.pathname?.includes("profile") ? "active" : ""
                                        }`}
                                >
                                    <Link to="/profile">
                                        <span className="d-flex align-items-center">
                                            <svg
                                                className=""
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                                ></path>
                                            </svg>
                                            <span className="ms-1">My Profile</span>
                                        </span>
                                    </Link>
                                    <span className="position-absolute active-menu-span"></span>
                                </li>
                                <li
                                    className={`${location.pathname?.includes("subscription") ||
                                        location.pathname?.includes("meals") ||
                                        location.pathname?.includes("stats")
                                        ? "active"
                                        : ""
                                        } position-relative py-1`}
                                >
                                    <a className="align-items-center w-100 transition-colors duration-150  hover:text-green-600 dark:hover:text-green-600 text-slate-900">
                                        <span className="d-flex align-items-center">
                                            <svg
                                                className=""
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                                                ></path>
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                                                ></path>
                                            </svg>
                                            <span className="ms-1">My Subscription</span>
                                        </span>
                                    </a>
                                </li>
                                <li className="menuSubMenu menu2">
                                    <ul className="navProfile navProfile-stacked">
                                        <li
                                            className={`${location.pathname?.includes("subscriptions")
                                                ? "active"
                                                : ""
                                                }`}
                                        >
                                            <Link to="/subscriptions">
                                                <i className="fas fa-angle-right"></i> Subscription
                                            </Link>
                                            <span className="position-absolute active-menu-span"></span>
                                        </li>
                                        <li
                                            className={`${location.pathname?.includes("meals") ? "active" : ""
                                                }`}
                                        >
                                            <Link
                                                to={
                                                    context.subscriptionDatesArray?.length > 0
                                                        ? `/meals?dd=${context.subscriptionDatesArray?.[0]?.year}-${context.subscriptionDatesArray?.[0]?.month}-${context.subscriptionDatesArray?.[0]?.date}`
                                                        : "/subscription"
                                                }
                                            >
                                                <i className="fas fa-angle-right"></i> Select meals
                                            </Link>
                                            <span className="position-absolute active-menu-span"></span>
                                        </li>
                                        <li
                                            className={`${location.pathname?.includes("stats") ? "active" : ""
                                                }`}
                                        >
                                            <Link to="/stats">
                                                <i className="fas fa-angle-right"></i> Macro Tracking
                                            </Link>
                                            <span className="position-absolute active-menu-span"></span>
                                        </li>
                                    </ul>
                                </li>
                                <li
                                    className={`${location.pathname?.includes("bags") ||
                                        location.pathname?.includes("checkouts") ||
                                        location.pathname?.includes("transactions")
                                        ? "active"
                                        : ""
                                        } position-relative py-1`}
                                >
                                    <a className="align-items-center w-100  transition-colors duration-150  hover:text-green-600 dark:hover:text-green-600 text-slate-900">
                                        <span className="d-flex align-items-center">
                                            <svg
                                                className=""
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
                                                ></path>
                                            </svg>
                                            <span className="ms-1">My Checkouts</span>
                                        </span>
                                    </a>
                                </li>
                                <li className="menuSubMenu menu3">
                                    <ul className="navProfile navProfile-stacked">
                                        <li
                                            className={`${location.pathname?.includes("bags") ? "active" : ""
                                                }`}
                                        >
                                            <Link to="/profile/bags">
                                                <i className="fas fa-angle-right"></i> Bags
                                            </Link>
                                            <span className="position-absolute active-menu-span"></span>
                                        </li>
                                        <li
                                            className={`${location.pathname?.includes("checkouts") ? "active" : ""
                                                }`}
                                        >
                                            <Link to="/checkouts">
                                                <i className="fas fa-angle-right"></i> Checkouts
                                            </Link>
                                            <span className="position-absolute active-menu-span"></span>
                                        </li>
                                        <li
                                            className={`${location.pathname?.includes("transactions")
                                                ? "active"
                                                : ""
                                                }`}
                                        >
                                            <Link to="/profile/transactions">
                                                <i className="fas fa-angle-right"></i> Digital Wallet
                                                Transactions
                                            </Link>
                                            <span className="position-absolute active-menu-span"></span>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div className="col-12 col-lg-10 mb-5 back_content">
                            {children}
                        </div>
                    </div>
                </div>
            </Landing>
        </React.Fragment>
    );
}
