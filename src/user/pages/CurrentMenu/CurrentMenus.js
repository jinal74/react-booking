import React, { useContext, useEffect, useState } from 'react';
import Landing from '../../../pages/common/Landing';
import Topbar from '../../../pages/common/Topbar';
import TitleHeader from '../../components/TitleHeader';
import SelectDateTable from '../../components/SelectDateTable';
import MealDetailsModal from '../../../pages/ModalsCommon/MealDetailsModal';
import { Context } from '../../../context/GeneralContext';
import { PostApi } from '../../../services/ApiService';
import { API_PATH_USER } from '../../../const';
import Placeholder from '../../../admin/assets/images/placeholder.png';
import emptyData from '../../../assets/images/emptyData.svg';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CurrentMenus() {
    const context = useContext(Context);
    const location = useLocation();
    const navigate = useNavigate();
    const [openModalByUnit, setOpenModalByUnit] = useState({ show: false, id: '' });
    const [selectedDate, setSelectedDate] = useState(null);
    const [meals, setMeals] = useState([]);
    const [options, setOptions] = useState({
        search_name: '',
        meal_category_ids: [],
        sort_by: 'display_name',
        is_ascending: 1,
        show_custom_only: 0,
        show_premium_only: 0,
        with_my_allergens: 0,
        with_my_dislikes: 0,
        show_my_diet_preference: 1,
    });

    const currentdate = `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`;

    useEffect(() => {
        if (location.search) {
            let query = new URLSearchParams(location.search);
            let find = context.datesArray?.find((f) => query.get('dd') === `${f?.year}-${f?.month}-${f?.date}`);
            setSelectedDate(find);
        } else {
            setSelectedDate(context.datesArray?.[0])
        }
    }, [location, context.datesArray]);

    useEffect(() => {
        if (selectedDate) navigate(`/currentmenu?dd=${currentdate}`);
    }, [currentdate]);

    useEffect(() => {
        if (selectedDate && context?.selected_location) GetAllMealMenuDetailsToOrder();
        if (!selectedDate && context?.selected_location) GetDatesOneTimeOrder();
    }, [context?.selected_location, selectedDate]);

    const GetDatesOneTimeOrder = async () => {
        const response = await PostApi(API_PATH_USER.GetDatesOneTimeOrder, { kitchen_location_id: context?.selected_location.kitchen_location_id });
        if (response.statusCode === 200) {
            let data = response.data[0] ?? [];

            let dates = data.map((f) => {
                let date = new Date(f.order_date);
                return ({
                    id: `${date.getFullYear()}${(date.getMonth() + 1)}${date.getDate()}`,
                    date: date.getDate().toString().padStart(2, '0'),
                    month: (date.getMonth() + 1).toString().padStart(2, '0'),
                    name: date.toLocaleString('default', { month: 'long' }),
                    shortName: date.toLocaleString('default', { month: 'short' }),
                    day: date.toLocaleString('en-us', { weekday: 'short' }),
                    dayFullName: date.toLocaleString('en-us', { weekday: 'long' }),
                    year: date.getFullYear(),
                })
            });
            context.setDatesArray(dates);
        }
    };

    const GetAllMealMenuDetailsToOrder = async (optionProp) => {
        let option = optionProp ?? options;
        let data = {
            meal_menu_date: `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`,
            kitchen_location_id: context?.selected_location.kitchen_location_id,
            ...option,
        };

        const response = await PostApi(API_PATH_USER.GetAllMealMenuDetailsToOrder, data);
        if (response.statusCode === 200) {
            setMeals(response.data);
        } else {
            setMeals([]);
        }
        setOptions(option);
    };

    const handleButtonClick = () => {
        const element = document.getElementById('uncategorized');
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="meals-by-unit-main">
            <Topbar />
            <Landing>
                <TitleHeader title={`Our Menu for ${selectedDate?.shortName} ${selectedDate?.date}, ${selectedDate?.year}`} />
                <div className="page-content-wrapper">
                    <div className="container-fluid">
                        <div className="container-user">
                            <div className="container_datesmeals">
                                <SelectDateTable state={{ selectedDate, setSelectedDate }} isOrderDay={false} />

                                <div className="mt-3">
                                    <div className="row">
                                        <div className="col-12">
                                            {meals?.length > 0 ? (
                                                <div className="position-relative meals-menu-portion">
                                                    <div className="categories-border-alacart categories-wrapper">
                                                        <div className="categories__list scrolls scroll_horizontal_custom w-100">
                                                            <span className="current" onClick={handleButtonClick}>
                                                                <span className="categories__item">Uncategorized</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="cards-wrapper px-2">
                                                        <div className="row">
                                                            <div className="col-12">
                                                                <section>
                                                                    <div className="row">
                                                                        <div className="col-12 _col-ms-offset-2 categories-section-title">
                                                                            <h1 className="mt-0">Uncategorized</h1>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row">
                                                                        {meals?.map((item, index) => {
                                                                            return (
                                                                                <div
                                                                                    key={item.ingredient_id}
                                                                                    className="col-lg-4 col-md-6 col-sm-12 padding-xs-col mealSelector"
                                                                                >
                                                                                    <div className="card-menu m-0 cursor-pointer" onClick={() => navigate(`/currentmenu/${item.ingredient_id}?dd=${currentdate}`)}>
                                                                                        <div
                                                                                            className="d-flex flex-wrap mx-0 h-100"
                                                                                        >
                                                                                            <div className="col-4 p-0 h-100">
                                                                                                <img
                                                                                                    className="h-100"
                                                                                                    loading="lazy"
                                                                                                    src={item.ingredient_image ?? Placeholder}
                                                                                                    alt={item.display_name}
                                                                                                    title={item.display_name}
                                                                                                    onError={(e) => {
                                                                                                        e.target.src = Placeholder;
                                                                                                    }}
                                                                                                />
                                                                                                <div className="overlay">
                                                                                                    <div className="overlay-text">Learn More</div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-8 padding-xs-col">
                                                                                                <div className="d-flex flex-column h-100">
                                                                                                    <p className="menu_title">{item.display_name}</p>
                                                                                                    <p className="menu_description">
                                                                                                        {item.meal_description}
                                                                                                    </p>
                                                                                                    <div className='mt-auto'>
                                                                                                        <div className="row d-flex py-2 align-items-center">
                                                                                                            <div className="col-md-8 col-sm-8">
                                                                                                                <span>
                                                                                                                    <b>{item.quantity}</b> Calories
                                                                                                                </span>
                                                                                                            </div>
                                                                                                            <div className="col-md-4 col-sm-4 text-end">
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    className="m-0 px-3 btn new_button_square_small primary-bg-cls w-100"
                                                                                                                    onClick={(e) => { e.stopPropagation(); setOpenModalByUnit({ show: true, id: item.ingredient_id }); }}
                                                                                                                >
                                                                                                                    <i className="fas fa-shopping-cart"></i>
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </section>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="row meals-menu-portion">
                                                    <div className="col-12 spacer-top text-center">
                                                        <div className="text-center">
                                                            <img
                                                                loading="lazy"
                                                                src={emptyData}
                                                                alt="No meals available. Try to change the preferences on the menu."
                                                                title="No meals available. Try to change the preferences on the menu."
                                                            />
                                                            <p>No meals available. Try to change the preferences on the menu.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Landing>

            <MealDetailsModal
                data={openModalByUnit}
                close={setOpenModalByUnit}
                selectedDate={selectedDate}
            />
        </div>
    );
}
