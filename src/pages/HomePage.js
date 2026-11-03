import React, { useContext, useEffect, useState } from 'react';
import Topbar from './common/Topbar';
import Landing from './common/Landing';
import Slider from 'react-slick';
import MealDetailsModal from './ModalsCommon/MealDetailsModal';
import { PostApi } from '../services/ApiService';
import { API_PATH_USER } from '../const';
import Placeholder from '../admin/assets/images/placeholder.png';
import Module1 from '../assets/images/module1.png';
import Module2 from '../assets/images/module2.png';
import Module3 from '../assets/images/module3.png';
import { FixedDecimal } from '../helpers/func_helper';
import { Context } from '../context/GeneralContext';

function NextArrow(props) {
    const { onClick } = props;
    return (
        <span onClick={onClick} className='slick-next-btn'>
            <i className='fas fa-chevron-right'></i>
        </span >
    );
}

function PrevArrow(props) {
    const { onClick } = props;
    return (
        <span onClick={onClick} className='slick-prev-btn'>
            <i className='fas fa-chevron-left'></i>
        </span>
    );
}

const HomePage = () => {
    const context = useContext(Context)
    const [openModalByUnit, setOpenModalByUnit] = useState({ show: false, id: "" });
    const [sliderMenudata, setSliderMenuData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        if (selectedDate && context?.selected_location) GetAllMealMenuDetailsToOrder();
        if (!selectedDate && context?.selected_location) GetDatesOneTimeOrder();
    }, [context?.selected_location, selectedDate])

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
            setSelectedDate(dates?.[0])
        }
    };

    const settings = {
        infinite: true,
        speed: 1000,
        slidesToShow: 4,
        autoplay: true,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    arrows: true
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    arrows: true
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true,
                    arrows: false
                }
            }
        ]
    };

    const testimonialSetting = {
        dots: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true,
        vertical: true,
        autoplay: true,
        centerMode: true,
        centerPadding: '0',
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 576,
                settings: {
                    arrows: false
                }
            }
        ]
    };

    const GetAllMealMenuDetailsToOrder = async () => {
        let data = {
            meal_menu_date: `${selectedDate?.year}-${selectedDate?.month}-${selectedDate?.date}`,
            kitchen_location_id: context?.selected_location.kitchen_location_id
        }

        const response = await PostApi(API_PATH_USER.GetAllMealMenuDetailsToOrder, data);
        if (response.statusCode === 200) {
            setSliderMenuData(response.data);
        } else {
            setSliderMenuData([]);
        }
    }

    return (
        <React.Fragment>
            <Topbar />
            <Landing>
                <section className="hero">
                    <div className="main-landing-cls">
                        <div className="">
                            <div className=""></div>
                            <h1 className="fw-bold">Welcome to TTP LifeStyle Meals</h1>
                            <p className="fs-4 fw-lighter text-white">Macro Balanced and Delicious</p>
                            <button className="btn btn-light rounded-0 px-4 fs-5 fw-lighter">Subscribe & Save</button>
                        </div>
                    </div>
                </section>
                <section className="separator module-separator">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 p-0">
                                <div className="text-center">
                                    <h1 className="primary-bg-cls"> How it works </h1>
                                    <i className="italic-label"> </i>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="howitworks spacer-top">
                    <div className="module-howitworks">
                        <div className="container-user">
                            <div className="">
                                <div className="text-center">
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <i className=" fas fa-shopping-basket primary"></i>
                                            <h2>ORDER</h2>
                                            <p>
                                                Select from our wide variety of signature created dishes. Choose between in store pick or local
                                                delivery. Our menu rotates every quarter
                                            </p>
                                        </div>
                                        <div className="col-sm-3">
                                            <i className=" fas fa-fire me-1 primary"></i>
                                            <h2>COOK</h2>
                                            <p>
                                                Our Chef's will carefully prepare, cook, and package all of your meals. On Sunday we cook for
                                                Mon-Tue-Wed meals. On Wednesday we cook for Thur-Sun. You'll always have them fresh and ready to
                                                go!
                                            </p>
                                        </div>
                                        <div className="col-sm-3">
                                            <i className=" fas fa-boxes primary"></i>
                                            <h2>PICKUP / DELIVER</h2>
                                            <p>
                                                You choose whether to pick up your meals at TTP Fitness's brick and mortar location after 4PM or
                                                choose doorstep delivery in case you are busy. We never want you to miss out
                                            </p>
                                        </div>
                                        <div className="col-sm-3">
                                            <i className=" fas fa-utensils primary"></i>
                                            <h2>HEAT IT &amp; EAT IT</h2>
                                            <p>
                                                Our meal containers are microwavable. In just minutes you will be enjoying restaurant quality
                                                meals from the comfort of your own home with no dishes to do.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {
                    sliderMenudata?.length > 0 &&
                    <section className="menu-slider">
                        <div className="container-fluid currentmenu">
                            <div className="container-user">
                                <Slider {...settings}>
                                    {
                                        sliderMenudata?.map((item, index) => {
                                            return (
                                                <div className="" onClick={() => setOpenModalByUnit({ show: true, id: item.ingredient_id })} key={item.ingredient_id}>
                                                    <div className="card-meal-img-extras">
                                                        <div className="img-wrapper">
                                                            <img
                                                                width="100"
                                                                loading="lazy"
                                                                src={item.ingredient_image ?? Placeholder}
                                                                alt={item.display_name}
                                                                title={item.display_name}
                                                                onError={e => { e.target.src = Placeholder }}
                                                            />
                                                            <div className="overlay">
                                                                <div className="overlay-text">Learn More</div>
                                                            </div>
                                                            {
                                                                item.is_new === 1 &&
                                                                <div className="ribbon-wrapper-red">
                                                                    <div className="ribbon-red rounded-0" style={{ background: '#ff8400' }}>
                                                                        New Item
                                                                    </div>
                                                                </div>
                                                            }
                                                        </div>
                                                        <div className="meal_card_wrapper">
                                                            <div className="meal-title text-center">
                                                                <h2>{item.display_name}</h2>
                                                            </div>
                                                            <div className="meal-description text-center">
                                                                <p>{item.meal_description}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="card-meal-footer">
                                                        <div className="col-sm-6 text-danger">
                                                            {
                                                                item.is_chef_fav === 1 &&
                                                                <div>
                                                                    <i className="fas fa-bookmark"></i> Chef's Favorite
                                                                </div>
                                                            }
                                                        </div>
                                                        {/* should_show_ratings */}
                                                        <div className="col-sm-6 text-end">
                                                            <div className="meal-calories">
                                                                <i className="fas fa-fire me-1"></i>
                                                                <b>{FixedDecimal(item.quantity)}</b> Calories
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </Slider>
                            </div>
                        </div>
                    </section>
                }
                <section className='module-modules'>
                    <div className='container-fluid'>
                        <div className="container-user">
                            <div className="spacer-top">
                                <div className="row equal modules-wrapper">
                                    <div className="col-12 col-md-4">
                                        <div className="meals-plans-plan">
                                            <a href="/mealsbyunit" className="meals-plans-plan-bg" style={{ backgroundImage: `url(${Module1})` }}></a>
                                            <div className="meals-plans-plan-inner">
                                                <h3>À la Carte</h3>
                                                <div className="meals-plans-plan-subtitle"><span className="primary-color-cls">One-Time Order</span></div>
                                                <div className="meals-plans-plan-description">
                                                    <p>Easy way to "give it a try". Choose your meals and get what you need, when you want it, for one meal or for every day of the week. Menu rotates with new meals every  quarter</p>
                                                </div>
                                                <div className="meals-plan-but-wr">
                                                    <div className="meals-plans-plan-but-wr">
                                                        <a href="/mealsbyunit" className="meals-plans-plan-but primary-bg-cls">GET STARTED</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="meals-plans-plan">
                                            <a href="/packs" className="meals-plans-plan-bg" style={{ backgroundImage: `url(${Module2})` }}></a>
                                            <div className="meals-plans-plan-inner">
                                                <h3>Meal Packs</h3>
                                                <div className="meals-plans-plan-subtitle"><span className="primary-color-cls">One-Time Order</span></div>
                                                <div className="meals-plans-plan-description">
                                                    <p>Select 5, 10, or 15 meals and save 5%. Pick them up at TTP Fitness, get  local hand delivery, and  *national delivery available soon</p>
                                                </div>
                                                <div className="meals-plan-but-wr">
                                                    <div className="meals-plans-plan-but-wr">
                                                        <a href="/packs" className="meals-plans-plan-but primary-bg-cls">GET STARTED</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="meals-plans-plan">
                                            <a href="/meals" className="meals-plans-plan-bg" style={{ backgroundImage: `url(${Module3})` }}></a>
                                            <div className="meals-plans-plan-inner">
                                                <h3>Weekly Subscription</h3>
                                                <div className="meals-plans-plan-subtitle"><span className="primary-color-cls">Recurring Order</span></div>
                                                <div className="meals-plans-plan-description">
                                                    <p>Subscribe and Save, our best value with the greatest savings. Let our chefs create your meals based on your preferences to give you the best meal possible for the lowest cost</p>
                                                </div>
                                                <div className="meals-plan-but-wr">
                                                    <div className="meals-plans-plan-but-wr">
                                                        <a href="/meals" className="meals-plans-plan-but primary-bg-cls">GET STARTED</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className='testimonial'>
                    <div className="container-fluid module-reviews testim">
                        <div className="wrap">
                            <Slider {...testimonialSetting}>
                                <div className="cont">
                                    <h2 className="">- Jerry W</h2>
                                    <p>"Bubba the sweet potato hash is my favorite"</p>
                                </div>
                                <div className="cont">
                                    <h2 className="">-Brian E</h2>
                                    <p>"This food is INCREDIBLE and hits my macros! I've always hated Meal Prep and found other companies to be bland or overly salted not the case with TTP Lifestyle Meals. LOVE THIS"</p>
                                </div>
                                <div className="cont">
                                    <h2 className="">- Denise D</h2>
                                    <p>"Finally a meal prep service that has done it right"</p>
                                </div>
                                <div className="cont">
                                    <h2 className="">-Ryan B</h2>
                                    <p>"This taste like food straight from a top notch restaurant"</p>
                                </div>
                                <div className="cont">
                                    <h2 className="">-Dana B</h2>
                                    <p>"Hands down the best pre-made meals I've tasted"</p>
                                </div>
                                <div className="cont">
                                    <h2 className="">- Cynthia S</h2>
                                    <p>"Just one bite of the vegetables and you know this has been prepared right!"</p>
                                </div>
                                <div className="cont">
                                    <h2 className="">- Gary A</h2>
                                    <p>"These are beyond delicious they are incredible"</p>
                                </div>
                            </Slider>
                        </div>
                    </div>
                </section>
                <section className='cta-main'>
                    <div>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12 px-0">
                                    <div className="parallax img2">
                                        <div className="container-user banner-text-bg">
                                            <div className="row">
                                                <div className="col-sm-12">
                                                    <h1 className="">Reheat. Eat. Repeat.</h1>
                                                </div>
                                                <div className="col-sm-12">
                                                    <p className="mt-0">Just click to get started today!</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Landing>

            {
                openModalByUnit.show && <MealDetailsModal data={openModalByUnit} close={setOpenModalByUnit} selectedDate={selectedDate} />
            }
        </React.Fragment>
    );
};

export default HomePage;
