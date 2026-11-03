import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import withRouter from '../Common/withRouter';
import SidebarContent from '../VerticalLayout/SidebarContent/SidebarContent';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.svg';
import LogoLg from '../../assets/images/logo-lg.png';
import logoLightSvg from '../../assets/images/logo-light.svg';

const Sidebar = (props) => {
    return (
        <React.Fragment>
            <div className="vertical-menu">
                <div className="navbar-brand-box">
                    <Link to="/" className="logo logo-dark">
                        <span className="logo-sm">
                            <img src={logo} alt="" height="22" />
                        </span>
                        <span className="logo-lg">
                            <img
                                src={LogoLg}
                                alt=""
                                height="38"
                            />
                        </span>
                    </Link>

                    <Link to="/" className="logo logo-light">
                        <span className="logo-sm">
                            <img src={logoLightSvg} alt="" height="22" />
                        </span>
                        <span className="logo-lg">
                            <img
                                src={LogoLg}
                                alt=""
                                height="40"
                            />
                            {/* <h4>TTP Fitness</h4> */}
                        </span>
                    </Link>
                </div>
                <div data-simplebar className="h-100">
                    {props.type !== 'condensed' ? <SidebarContent /> : <SidebarContent />}
                </div>
                <div className="sidebar-background"></div>
            </div>
        </React.Fragment>
    );
};

Sidebar.propTypes = {
    type: PropTypes.string,
};

const mapStatetoProps = (state) => {
    return {
        layout: state.Layout,
    };
};
export default connect(mapStatetoProps, {})(withRouter(Sidebar));
