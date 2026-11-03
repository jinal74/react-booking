import React, { useState } from 'react';
import UserMenu from '.';
import DataTable from '../../../pages/Tables/CustDataTable';
import { DateRangePicker } from 'react-date-range';
import { Modal, ModalBody, ModalFooter } from 'reactstrap';

export default function Stats() {
    const [data, set_data] = useState([
        {
            id: '1',
            meal_name: 'meal_name',
            calories: 'calories',
            total_fat: 'total_fat',
            sodium: 'sodium',
            total_carbohydrate: 'total_carbohydrate',
            dietary_fiber: 'dietary_fiber',
            protein: 'protein',
            delivery_date: 'delivery_date',
        },
    ]);
    const [selectionRange, setSelectionRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);
    const [nutritionCalShow, setNutritionCalShow] = useState(false);
    const [macroCalShow, setMacroCalShow] = useState(false);
    const [options, set_options] = useState({
        page: 0,
        totalCount: 1,
        sizePerPage: 10,
    });

    const columns = [
        {
            name: 'Meal name',
            column: 'meal_name',
            options: {
                className: 'w-25',
                sort: true,
            },
        },
        {
            name: 'Calories',
            column: 'calories',
            options: {
                sort: true,
            },
        },
        {
            name: 'Total Fat',
            column: 'total_fat',
            options: {
                sort: true,
            },
        },
        {
            name: 'Sodium',
            column: 'sodium',
            options: {
                sort: true,
            },
        },
        {
            name: 'Total Carbohydrate',
            column: 'total_carbohydrate',
            options: {
                sort: true,
            },
        },
        {
            name: 'Dietary Fiber',
            column: 'dietary_fiber',
            options: {
                sort: true,
            },
        },
        {
            name: 'Protein',
            column: 'protein',
            options: {
                sort: true,
            },
        },
        {
            name: 'Delivery Date',
            column: 'delivery_date',
            options: {
                className: 'w-25',
                sort: true,
            },
        },
    ];

    const handleSelect = (ranges) => {
        setSelectionRange([ranges.selection]);
    };

    const tableCallBack = (option) => {
        set_options(option);
    };

    return (
        <UserMenu>
            <div className="row stats_page responsive-container-admin">
                <div className="col-md-12">
                    <div className="mt-5 ms-2 font-size-20">
                        <div className="d-flex align-items-center">
                            <b>My Subscription Meals</b>
                        </div>
                    </div>
                </div>
                <div className="col-md-12 mt-4">
                    <div>
                        <div className="row spacer_bottom h-auto">
                            <div className="col-sm-12 col-lg-6 col-xl-4 myProfile h-auto my-2">
                                <div className="card-stats h-100">
                                    <div className="d-flex justify-content-between">
                                        <span className="calendar_title">My Profile</span>
                                    </div>

                                    <div className="d-flex flex-column mt-2">
                                        <div className="user_profile_objective px-3">
                                            <div className="d-flex align-items-center formValue">
                                                <div className="text_label">I am:</div>
                                                <div className="text_value profile_user_gender">Female </div>
                                            </div>

                                            <div className="d-flex align-items-center formValue">
                                                <div className="text_label">Age:</div>
                                                <div className="text_value profile_user_age">20 </div>
                                            </div>

                                            <div className="d-flex align-items-center formValue">
                                                <div className="text_label">Height:</div>
                                                <div className="text_value profile_user_height">
                                                    <span className="height_value">5 feet and 4 inches</span>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center formValue">
                                                <div className="text_label">Weight:</div>
                                                <div className="text_value profile_user_weight">
                                                    <span className="weight_value">60.01 </span>lbs
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center formValue">
                                                <div className="text_label">Bodyfat:</div>
                                                <div className="text_value profile_user_bodyFat">50 </div>
                                            </div>

                                            <div className="d-flex align-items-center formValue">
                                                <div className="text_label">I want to:</div>
                                                <div className="text_value profile_user_goalObjective">Lose Weight </div>
                                            </div>

                                            <div className="d-flex align-items-center formValue">
                                                <div className="text_label">Activity Level:</div>
                                                <div className="text_value profile_user_activityLevel">Very Active </div>
                                            </div>

                                            <div className="d-flex align-items-center formValue">
                                                <div className="text_label">Goal weight:</div>
                                                <div className="text_value profile_user_goalWeight">
                                                    <span className="goalWeight_value">50.00 </span>lbs
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center formValue">
                                                <div className="text_label">Goal weight Duration:</div>
                                                <div className="text_value profile_user_goalWeightRate">12 </div>
                                            </div>

                                            <div className="d-flex align-items-center formValue">
                                                <div className="text_label">Macro Ratio:</div>
                                                <div className="text_value profile_user_macroRatio">
                                                    Carbohydrates: <span className="macro_ratio_carbs">--</span> % <b>|</b>
                                                    Proteins: <span className="macro_ratio_proteins">--</span> % <b>|</b>
                                                    Fats: <span className="macro_ratio_fats">--</span> %
                                                </div>
                                            </div>
                                        </div>

                                        <div className="user_setted_macros px-3">
                                            <table className="user_macros_table">
                                                <thead>
                                                    <tr>
                                                        <th>Calories</th>
                                                        <th>Proteins</th>
                                                        <th>Carbohydrates</th>
                                                        <th>Fats</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td colSpan="4" className="no_macros_available">
                                                            No macros available...
                                                        </td>
                                                    </tr>
                                                    <tr className="user_macros_row">
                                                        <td className="macro_1">
                                                            <span className="macro_value">-1767.81 </span>kcal
                                                        </td>
                                                        <td className="macro_2">
                                                            <span className="macro_value">-88.39 </span>g
                                                        </td>
                                                        <td className="macro_3">
                                                            <span className="macro_value">-220.98 </span>g
                                                        </td>
                                                        <td className="macro_4">
                                                            <span className="macro_value">-58.93 </span>g
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="d-flex justify-content-center mt-4">
                                            <button type="button" className="primary-bg-cls btn-save" onClick={() => setNutritionCalShow(true)}>
                                                Set Recommended Daily Value
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12 col-lg-6 col-xl-5 calendar h-auto my-2">
                                <div className="card-stats">
                                    <div className="d-flex justify-content-between">
                                        <span className="calendar_title mb-2">Available dates</span>
                                    </div>
                                    <DateRangePicker ranges={selectionRange} onChange={handleSelect} />
                                    <div className="w-100 d-flex justify-content-end">
                                        <button className="new_button_square_big btn back_admin mt-3" type="button">
                                            Submit
                                        </button>
                                        <button
                                            type="button"
                                            className="btn back_admin new_button_square_big ms-3 mt-3 d-md-none tcollapse collapsed"
                                        >
                                            <i className="fas fa-chevron-down"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12 col-lg-6 col-xl-3 caloriesTable h-auto my-2">
                                <div className="card-stats h-100">
                                    <span className="calendar_title ps-0">My Macronutrients</span>
                                    <div className="macroGraph shadow-none px-0">
                                        <div className="">
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <div className="progress-container progress-primary">
                                                        <span className="progress-badge bold">Calories </span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <span className="progress-value">
                                                        <span className="bold total_macros_1_macroGraph totalsMacro_macroGraph">0</span>
                                                        <span className="bold">cal</span>
                                                        <small>
                                                            (
                                                            <span className="total_macros_1_percentage_macroGraph totalsMacroPercentage_macroGraph">
                                                                0
                                                            </span>
                                                            )
                                                        </small>
                                                    </span>
                                                </div>
                                                <div className="col-sm-12">
                                                    <div className="progress">
                                                        <div className="progress-bar progresstotalmacros_macroGraph progresstotalmacros_1_Max_macroGraph"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <div className="progress-container progress-primary">
                                                        <span className="progress-badge bold">Total Fat </span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <span className="progress-value">
                                                        <span className="bold total_macros_4_macroGraph totalsMacro_macroGraph">0.00</span>
                                                        <span className="bold">gr</span>
                                                        <small>
                                                            (
                                                            <span className="total_macros_4_percentage_macroGraph totalsMacroPercentage_macroGraph">
                                                                0
                                                            </span>
                                                            )
                                                        </small>
                                                    </span>
                                                </div>
                                                <div className="col-sm-12">
                                                    <div className="progress">
                                                        <div className="progress-bar progresstotalmacros_macroGraph progresstotalmacros_4_Max_macroGraph"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <div className="progress-container progress-primary">
                                                        <span className="progress-badge bold">Sodium </span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <span className="progress-value">
                                                        <span className="bold total_macros_9_macroGraph totalsMacro_macroGraph">0.00</span>
                                                        <span className="bold">mg</span>
                                                        <small>
                                                            (
                                                            <span className="total_macros_9_percentage_macroGraph totalsMacroPercentage_macroGraph">
                                                                0
                                                            </span>
                                                            )
                                                        </small>
                                                    </span>
                                                </div>
                                                <div className="col-sm-12">
                                                    <div className="progress">
                                                        <div className="progress-bar progresstotalmacros_macroGraph progresstotalmacros_9_Max_macroGraph"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <div className="progress-container progress-primary">
                                                        <span className="progress-badge bold">Total Carbohydrate </span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <span className="progress-value">
                                                        <span className="bold total_macros_3_macroGraph totalsMacro_macroGraph">0.00</span>
                                                        <span className="bold">gr</span>
                                                        <small>
                                                            (
                                                            <span className="total_macros_3_percentage_macroGraph totalsMacroPercentage_macroGraph">
                                                                0
                                                            </span>
                                                            )
                                                        </small>
                                                    </span>
                                                </div>
                                                <div className="col-sm-12">
                                                    <div className="progress">
                                                        <div className="progress-bar progresstotalmacros_macroGraph progresstotalmacros_3_Max_macroGraph"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <div className="progress-container progress-primary">
                                                        <span className="progress-badge">Dietary Fiber</span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <div className="progress-value">
                                                        <span className="total_macros_5_macroGraph totalsMacro_macroGraph">0.00</span> gr
                                                        <small>
                                                            (
                                                            <span className="total_macros_5_percentage_macroGraph totalsMacroPercentage_macroGraph">
                                                                0
                                                            </span>
                                                            )
                                                        </small>
                                                    </div>
                                                </div>
                                                <div className="col-sm-12">
                                                    <div className="progress">
                                                        <div className="progress-bar progresstotalmacros_macroGraph progresstotalmacros_5_Max_macroGraph"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <div className="progress-container progress-primary">
                                                        <span className="progress-badge bold">Protein </span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <span className="progress-value">
                                                        <span className="bold total_macros_2_macroGraph totalsMacro_macroGraph">0.00</span>
                                                        <span className="bold">gr</span>
                                                        <small>
                                                            (
                                                            <span className="total_macros_2_percentage_macroGraph totalsMacroPercentage_macroGraph">
                                                                0
                                                            </span>
                                                            )
                                                        </small>
                                                    </span>
                                                </div>
                                                <div className="col-sm-12">
                                                    <div className="progress">
                                                        <div className="progress-bar progresstotalmacros_macroGraph progresstotalmacros_2_Max_macroGraph"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 mealList mt-4">
                                <div className="card-stats table-responsive">
                                    <span className="calendar_title">Totals</span>
                                    <div className="dataTables_wrapper form-inline dt-bootstrap no-footer">
                                        <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={nutritionCalShow} centered className="modal modal-650 modal-not-centered profile">
                <ModalBody className='px-4'>
                    <div className="row mb-2">
                        <div className="col-md-12 modal_action_content">
                            <h3 className="font-size-20 my-2">Nutrition Calculator</h3>
                        </div>
                    </div>
                    <div className="px-3">
                        <div className="mb-3">
                            <div className="alert alert-info d-flex align-items-center justify-content-between">
                                <span>
                                    I am: <span className="general_info_gender">Female </span> //
                                    Age:
                                    <span className="general_info_age">20 </span> //
                                    Height:
                                    <span className="general_info_height">
                                        <span className="height_value">0 feet and 0 inches</span>
                                    </span>
                                </span>
                                <span className='cursor-pointer fw-bold'>Edit</span>
                            </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                            <div className="w-100 w-md-unset flex-basis-md-35">I want to</div>
                            <div className="w-100 w-md-unset flex-basis-md-65">
                                <div className="d-flex nutrition_calculator__btn-group">
                                    <button type="button" className="nutrition_calc_goal_0 nutrition_calculator__btn-item active">
                                        Lose Weight
                                    </button>
                                    <button type="button" className="nutrition_calc_goal_1 nutrition_calculator__btn-item ">
                                        Mantain
                                    </button>
                                    <button type="button" className="nutrition_calc_goal_2 nutrition_calculator__btn-item ">
                                        Build Muscle
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                            <div className="w-100 w-md-unset flex-basis-md-35">
                                <label for="nutrition_calc_weight_value" className="nutrition_calculator__labelFor">
                                    Weight
                                </label>
                            </div>
                            <div className="w-100 w-md-unset flex-basis-md-65 inline_input">
                                <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                    <input type="number" className="w-100" />
                                    <label className="nutrition_calculator__input-unit">lbs</label>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                            <div className="w-100 w-md-unset flex-basis-md-35">
                                <label for="nutrition_calc_weight_value" className="nutrition_calculator__labelFor">
                                    BodyFat
                                </label>
                            </div>
                            <div className="w-100 w-md-unset flex-basis-md-65 inline_input">
                                <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                    <input type="number" className="w-100" />
                                    <label className="nutrition_calculator__input-unit">%</label>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                            <div className="w-100 w-md-unset flex-basis-md-35">
                                <label for="cbActivityLevel" className="nutrition_calculator__labelFor">
                                    Activity level
                                </label>
                            </div>
                            <div className="w-100 w-md-unset flex-basis-md-65">
                                <div className="d-flex">
                                    <select name="cbActivityLevel" className="chosen-select form-select primary-border-cls">
                                        <option value="0">Sedentary</option>
                                        <option value="1">Lightly Active</option>
                                        <option value="2">Moderately Active</option>
                                        <option value="3">Very Active</option>
                                        <option value="4">Extremely Active</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                            <div className="w-100 w-md-unset flex-basis-md-35">Custom Macro Ratio?</div>
                            <div className="w-100 w-md-unset flex-basis-md-65">
                                <div className="d-flex nutrition_calculator__btn-group">
                                    <button
                                        type="button"
                                        className="nutrition_calc_haveCustomMacroRatio_0 nutrition_calculator__btn-item active"
                                    >
                                        No thanks
                                    </button>
                                    <button type="button" className="nutrition_calc_haveCustomMacroRatio_1 nutrition_calculator__btn-item ">
                                        Yeah let's do it!
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="d-flex flex-column flex-md-row align-items-center">
                                <div className="w-100 w-md-unset flex-basis-md-35">Macro Ratio</div>
                                <div className="w-100 w-md-unset flex-basis-md-65">
                                    <div className="d-flex nutrition_calculator__btn-group">
                                        <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                            <div className="metric w-100">
                                                <input type="number" className="w-100 nutrition_calculator_macroRatioCarbs" />
                                                <label className="nutrition_calculator__input-unit">%</label>
                                            </div>
                                        </div>
                                        <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                            <div className="metric w-100">
                                                <input type="number" className="w-100 nutrition_calculator_macroRatioProteins" />
                                                <label className="nutrition_calculator__input-unit">%</label>
                                            </div>
                                        </div>
                                        <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                            <div className="metric w-100">
                                                <input type="number" className="w-100 nutrition_calculator_macroRatioFats" />
                                                <label className="nutrition_calculator__input-unit">%</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                                <div className="w-100 w-md-unset flex-basis-md-35"></div>
                                <div className="w-100 w-md-unset flex-basis-md-65">
                                    <div className="d-flex nutrition_calculator__btn-under">
                                        <div className="nutrition_calculator__btn-under_label">
                                            Carbohydrates
                                        </div>
                                        <div className="nutrition_calculator__btn-under_label">
                                            Proteins
                                        </div>
                                        <div className="nutrition_calculator__btn-under_label">
                                            Fats
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                            <div className="w-100 w-md-unset flex-basis-md-35">Set a weight goal?</div>
                            <div className="w-100 w-md-unset flex-basis-md-65">
                                <div className="d-flex nutrition_calculator__btn-group">
                                    <button type="button" className="nutrition_calc_setWeightGoal_0 nutrition_calculator__btn-item active">
                                        No thanks
                                    </button>
                                    <button type="button" className="nutrition_calc_setWeightGoal_1 nutrition_calculator__btn-item ">
                                        Yeah let's do it!
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                                <div className="w-100 w-md-unset flex-basis-md-35">
                                    <label for="nutrition_calc_goal_weight" className="nutrition_calculator__labelFor">
                                        Enter goal weight:
                                    </label>
                                </div>
                                <div className="w-100 w-md-unset flex-basis-md-65">
                                    <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                        <div className="metric w-100">
                                            <input type="number" className="w-100" />
                                            <label className="nutrition_calculator__input-unit">lbs</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex flex-column flex-md-row mb-3 align-items-center">
                                <div className="w-100 w-md-unset flex-basis-md-35">
                                    <label for="nutrition_calc_goal_weight_rate" className="nutrition_calculator__labelFor">
                                        Days to achive your weight goal:
                                    </label>
                                </div>
                                <div className="w-100 w-md-unset flex-basis-md-65">
                                    <div className="d-flex nutrition_calculator__input flex-basis-md-50 w-xs-100">
                                        <div className="metric w-100">
                                            <input type="number" className="w-100" />
                                            <label className="nutrition_calculator__input-unit">days</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center mb-3">
                                <div className="w-100 text-warning"></div>
                            </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-center mt-2">
                            <button type="button" className="nutrition_calculator__btn-calculate" onclick="calculateMacros()">
                                Calculate
                            </button>
                        </div>
                        <div className="d-flex align-items-center">
                            <div className="w-100 text-warning"></div>
                        </div>

                        <div className="macro_recommendation d-block mt-2">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>
                                            <strong>Calories</strong>
                                        </th>
                                        <th>
                                            <strong>Proteins</strong>
                                        </th>
                                        <th>
                                            <strong>Carbohydrates</strong>
                                        </th>
                                        <th>
                                            <strong>Fats</strong>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="4" className='text-center'>Please answer all questions</td>
                                        <td colspan="4" className="warningCaloriesContainer d-none">
                                            <div className="alert alert-warning warningCaloriesText" role="alert"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="suggested_calories">
                                            <span>x</span> kcal
                                        </td>
                                        <td className="suggested_proteins">
                                            <span>x</span> g
                                        </td>
                                        <td className="suggested_carbohydrates">
                                            <span>x</span> g
                                        </td>
                                        <td className="suggested_fats">
                                            <span>x</span> g
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="text-center">
                                <button type="button" className="primary-bg-cls btn-save" onClick={() => setMacroCalShow(true)}>
                                    Apply these settings
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button className="col-12" onClick={() => setNutritionCalShow(false)}>
                        Close
                    </button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={macroCalShow} centered className="small_modal_action_content modal modal-650 modal-not-centered profile">
                <ModalBody className='px-5'>
                    <div className="row mb-2">
                        <div className="col-md-12 modal_action_content text-center">
                            <h3 className="font-size-20 my-2">Nutrition Calculator</h3>
                        </div>
                    </div>
                    <div className="px-2">
                        <p>The recommended values that will be stored are:</p>
                        <div className="">
                            <div className="confirm_nutrition_calculator__input mb-2">
                                <label for="confirm_suggested_calories">Calories: </label>
                                <input type="number" />
                                <span className="confirm_nutrition_calculator__input-unit">g</span>
                            </div>
                            <div className="confirm_nutrition_calculator__input mb-2">
                                <label for="confirm_suggested_proteins">Proteins: </label>
                                <input type="number" />
                                <span className="confirm_nutrition_calculator__input-unit">g</span>
                            </div>
                            <div className="confirm_nutrition_calculator__input mb-2">
                                <label for="confirm_suggested_carbohydrates">Carbohydrates: </label>
                                <input type="number" />
                                <span className="confirm_nutrition_calculator__input-unit">g</span>
                            </div>
                            <div className="confirm_nutrition_calculator__input mb-2">
                                <label for="confirm_suggested_fats">Fats: </label>
                                <input type="number" />
                                <span className="confirm_nutrition_calculator__input-unit">g</span>
                            </div>
                        </div>
                        <div className="text-center max-width-300 px-2">
                            <div className="togglebutton">
                                <label>Use Custom Values?
                                    <input type="checkbox" id="custom_suggested_values" />
                                    <span className="toggle ms-2"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="p-0 upld-mls-btn overflow-hidden">
                    <button className="col-6 border-end" onClick={() => setMacroCalShow(false)}>
                        Cancel
                    </button>
                    <button className="col-6">Save</button>
                </ModalFooter>
            </Modal>
        </UserMenu>
    );
}
