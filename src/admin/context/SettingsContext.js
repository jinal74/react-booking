import React, { createContext, useEffect } from 'react';
import { useState } from 'react';
import { API_PATH } from '../constants/const';
import { PostApi } from '../../services/ApiService';

export const SettingsStore = createContext("");

export function ContextProviderSettings(props) {
    const [oneState, setOneState] = useState(false);
    const [kitchen_loc_status, setkitchen_loc_status] = useState("1");
    const [coupons_status, setcoupons_status] = useState("1");
    const [pickup_loc_status, setpickup_loc_status] = useState("1");
    const [funneal_reason_status, setfunneal_reason_status] = useState("1");
    const [kitchen_loc_list, setkitchen_loc_list] = useState(null);
    const [selected_location, set_selected_location] = useState(null);
    const [isLoading, set_isLoading] = useState(false);
    const [meal_category_groups, set_meal_category_groups] = useState(null);

    useEffect(() => {
        if (window?.location?.pathname?.includes('admin')) GetAllKitchenLocations();
    }, []);

    const GetMealCategoriesGroup = async () => {
        set_isLoading(true);
        const response = await PostApi(API_PATH.getMealCategoriesGroups);
        if (response.statusCode === 200) {
            set_meal_category_groups(response.data);
        }
        set_isLoading(false);
    };

    const GetAllKitchenLocations = async () => {
        const response = await PostApi(API_PATH.getAllKitchenLocation, {
            type: "all",
            is_active: "1",
        });
        if (response.statusCode === 200) {
            if (!selected_location) {
                set_selected_location(response.data.data_result[0])
            }
            if (response.data.data_result.length > 1) {
                setkitchen_loc_list(response.data.data_result ?? []);
            } else {
                setkitchen_loc_list(response.data.data_result ?? []);
                set_selected_location(response.data.data_result[0])
            }
        }
    };

    return (
        <SettingsStore.Provider
            value={{
                oneState,
                kitchen_loc_status,
                coupons_status,
                pickup_loc_status,
                kitchen_loc_list,
                selected_location,
                funneal_reason_status,
                isLoading,
                meal_category_groups,
                set_isLoading,
                set_meal_category_groups,
                GetMealCategoriesGroup,
                setkitchen_loc_status,
                setcoupons_status,
                setOneState,
                setpickup_loc_status,
                setfunneal_reason_status,
                setkitchen_loc_list,
                set_selected_location,
                GetAllKitchenLocations
            }}
        >
            {props.children}
        </SettingsStore.Provider>
    );
}