import React, { createContext, useEffect } from 'react';
import { useState } from 'react';
import { PostApi } from '../services/ApiService';
import { API_PATH } from '../admin/constants/const';

export const Context = createContext({});

export function ContextProvider(props) {
    const [user_details, set_user_details] = useState(null);
    const [kitchen_loc_list, setkitchen_loc_list] = useState(null);
    const [selected_location, set_selected_location] = useState(null);
    const [datesArray, setDatesArray] = useState([]);
    const [subscriptionDatesArray, setSubscriptionDatesArray] = useState(null);
    const [cartData, setCartData] = useState({
        totalItems: 0,
        subTotal: 0,
        total: 0,
        data: null
    });

    useEffect(() => {
        console.log(cartData)
        if (cartData?.data) {
            saveCartItems(cartData);
        }
    }, [cartData])

    useEffect(() => {
        let cartItems = localStorage.getItem('cart');
        if (cartItems) {
            setCartData(JSON.parse(cartItems).items);
        }
        if (!window?.location?.pathname?.includes('admin')) GetAllKitchenLocations();

        const intervalId = setInterval(checkAndClearCart, 10000);

        return () => clearInterval(intervalId);
    }, []);

    function checkAndClearCart() {
        const cartdata = JSON.parse(localStorage.getItem('cart'));
        if (cartdata) {
            const currentTime = new Date().getTime();
            const timeElapsed = currentTime - cartdata.timestamp;

            // 3600000 milliseconds = 60 minutes
            if (timeElapsed > 3600000) {
                localStorage.removeItem('cart');
            }
        }
    }

    function saveCartItems(cartItems) {
        const cartdata = {
            items: cartItems,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('cart', JSON.stringify(cartdata));
    }

    const GetAllKitchenLocations = async () => {
        const response = await PostApi(API_PATH.getAllKitchenLocation, {
            type: "all",
            is_active: "1",
        });
        if (response.statusCode === 200) {
            if (!selected_location) {
                set_selected_location(response.data.data_result[0]);
            }
            if (response.data.data_result.length > 1) {
                setkitchen_loc_list(response.data.data_result ?? []);
            } else {
                setkitchen_loc_list(response.data.data_result ?? []);
                set_selected_location(response.data.data_result[0]);
            }
        }
    };

    return (
        <Context.Provider
            value={{
                user_details,
                kitchen_loc_list,
                selected_location,
                cartData,
                datesArray,
                subscriptionDatesArray,
                setSubscriptionDatesArray,
                setDatesArray,
                setCartData,
                set_user_details,
                setkitchen_loc_list,
                set_selected_location,
                GetAllKitchenLocations
            }}
        >
            {props.children}
        </Context.Provider>
    );
}
