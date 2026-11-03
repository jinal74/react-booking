import React, { useEffect, useRef, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import SimpleBar from 'simplebar-react';
import MetisMenu from 'metismenujs';
import withRouter from '../../Common/withRouter';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { SettingsStore } from '../../../context/SettingsContext';
import { KitchenLocListDisplay, SidebarItems } from './SidebarItems';

const SidebarContent = (props) => {
    const context = useContext(SettingsStore);
    const ref = useRef();
    const path = props.router.location;

    const [kitchen_locations_List, set_kitchen_locations_List] = useState([]);

    const activateParentDropdown = useCallback((item) => {
        item.classList.add('active');
        const parent = item.parentElement;
        const parent2El = parent.childNodes[1];
        if (parent2El && parent2El.id !== 'side-menu') {
            parent2El.classList.add('mm-show');
        }
        if (parent) {
            parent.classList.add('mm-active');
            const parent2 = parent.parentElement;
            if (parent2) {
                parent2.classList.add('mm-show'); // ul tag
                const parent3 = parent2.parentElement; // li tag
                if (parent3) {
                    parent3.classList.add('mm-active'); // li
                    parent3.childNodes[0].classList.add('mm-active'); //a
                    const parent4 = parent3.parentElement; // ul
                    if (parent4) {
                        parent4.classList.add('mm-show'); // ul
                        const parent5 = parent4.parentElement;
                        if (parent5) {
                            parent5.classList.add('mm-show'); // li
                            parent5.childNodes[0].classList.add('mm-active'); // a tag
                        }
                    }
                }
            }
            scrollElement(item);
            return false;
        }
        scrollElement(item);
        return false;
    }, []);

    const removeActivation = (items) => {
        for (var i = 0; i < items.length; ++i) {
            var item = items[i];
            const parent = items[i].parentElement;
            if (item && item.classList.contains('active')) {
                item.classList.remove('active');
            }
            if (parent) {
                const parent2El =
                    parent.childNodes && parent.childNodes.lenght && parent.childNodes[1] ? parent.childNodes[1] : null;
                if (parent2El && parent2El.id !== 'side-menu') {
                    parent2El.classList.remove('mm-show');
                }
                parent.classList.remove('mm-active');
                const parent2 = parent.parentElement;
                if (parent2) {
                    parent2.classList.remove('mm-show');
                    const parent3 = parent2.parentElement;
                    if (parent3) {
                        parent3.classList.remove('mm-active'); // li
                        parent3.childNodes[0].classList.remove('mm-active');

                        const parent4 = parent3.parentElement; // ul
                        if (parent4) {
                            parent4.classList.remove('mm-show'); // ul
                            const parent5 = parent4.parentElement;
                            if (parent5) {
                                parent5.classList.remove('mm-show'); // li
                                parent5.childNodes[0].classList.remove('mm-active'); // a tag
                            }
                        }
                    }
                }
            }
        }
    };

    const GetFlattendItems = () => {
        const flattenedOptions = [];
        function flattenOptions(options) {
            options.forEach(option => {
                if (option.options) {
                    flattenOptions(option.options);
                } else {
                    flattenedOptions.push({
                        label: option.label,
                        path: option.path
                    });
                }
            });
        }
        SidebarItems.forEach(item => {
            if (item.options) {
                flattenOptions(item.options);
            } else {
                if (item?.type !== 'heading') {
                    flattenedOptions.push({
                        label: item.label,
                        path: item.path
                    });
                }
            }
        });
        return flattenedOptions;
    }

    const activeMenu = useCallback(() => {
        const pathName = `/admin${path.pathname}`;
        let matchingMenuItem = null;
        const ul = document.getElementById('side-menu');
        const items = ul.getElementsByTagName('a');
        removeActivation(items);

        let SidebarItemsArr = GetFlattendItems();

        for (let j = 0; j < SidebarItemsArr.length; j++) {
            let pathEndPoint = SidebarItemsArr[j]?.path?.split('/')?.pop();
            for (let i = 0; i < items.length; ++i) {
                if (pathName === items[i].pathname) {
                    matchingMenuItem = items[i];
                    break;
                } else if (pathName?.includes(pathEndPoint) && items[i].pathname === `/admin/${SidebarItemsArr[j].path}`) {
                    matchingMenuItem = items[i];
                    break;
                }
            }
        }

        if (matchingMenuItem) {
            activateParentDropdown(matchingMenuItem);
        }
    }, [path.pathname, activateParentDropdown]);

    useEffect(() => {
        ref.current.recalculate();
    }, []);

    useEffect(() => {
        new MetisMenu('#side-menu');
        activeMenu();
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        activeMenu();
    }, [activeMenu]);

    function scrollElement(item) {
        if (item) {
            const currentPosition = item.offsetTop;
            if (currentPosition > window.innerHeight) {
                ref.current.getScrollElement().scrollTop = currentPosition - 300;
            }
        }
    }

    useEffect(() => {
        set_kitchen_locations_List(context.kitchen_loc_list ?? []);
    }, [context.kitchen_loc_list]);

    const handleChangeLocationList = (e) => {
        const selectedOption = e.target.value;
        const selectedLocation = context.kitchen_loc_list?.find((loc) => loc.kitchen_location_id === selectedOption);

        context.set_selected_location(selectedLocation);
    };

    return (
        <React.Fragment>
            <SimpleBar className="h-100" ref={ref}>
                <div id="sidebar-menu">
                    <ul className="metismenu list-unstyled" id="side-menu">
                        {(kitchen_locations_List.length > 1 && KitchenLocListDisplay.includes(path.pathname)) && (
                            <select
                                className="form-select nav-location-select"
                                name="kitchen_loc_list"
                                defaultValue={kitchen_locations_List.length > 0 && context?.selected_location?.kitchen_location_id}
                                onChange={(e) => handleChangeLocationList(e)}
                            >
                                {kitchen_locations_List.map((loc) => (
                                    <option key={loc.kitchen_location_id} value={loc.kitchen_location_id}>
                                        {loc.kitchen_loc_name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {
                            SidebarItems?.map((item, i) => {
                                if (item?.type === 'heading') {
                                    return <li key={i} className="menu-title">{item.label}</li>
                                } else {
                                    return (
                                        <li key={i}>
                                            <Link to={`/admin/${item.path}`} className={item?.options ? "has-arrow" : ""}>
                                                <i className={item.icon}></i>
                                                <span>{item.label}</span>
                                            </Link>
                                            {
                                                item?.options && (
                                                    <ul className="sub-menu">
                                                        {item?.options?.map((option, index) => (
                                                            <li key={index}>
                                                                <Link to={`/admin/${option.path}`}>{option.label}</Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )
                                            }
                                        </li>
                                    )
                                }
                            })
                        }
                    </ul>
                </div>
            </SimpleBar>
        </React.Fragment>
    );
};

SidebarContent.propTypes = {
    location: PropTypes.object,
};

export default withRouter(SidebarContent);
