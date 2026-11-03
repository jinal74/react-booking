export const API_PATH_USER = {
    login: 'publicUser/user_login',

    GetAllMealsDetailsToOrder: 'mealrecipe/get_all_meal_details_to_order',
    GetMealsDetailsById: 'mealrecipe/get_meal_detail_by_id_to_order',
    GetDatesOneTimeOrder: 'mealrecipe/get_order_dates_for_one_time_order',
    GetAllMealMenuDetailsToOrder: 'mealrecipe/get_all_meal_menu_details_to_order',
    GetAllMealPacksToOrder: 'mealpacks/get_all_meal_packs_to_order',
    GetMealsForMealPacks: 'mealpacks/get_meals_for_meal_pack',
    GetRandomMeals: 'mealpacks/get_random_meals',

    GetAllSubscriptionPlans: 'subscription_price_plans/get_all_subscription_price_plans',
    GetDatesSubscriptionPlans: 'subscription_plans/get_order_dates_for_subscription_plan',
    GetSubscriptionPricePlanById: 'subscription_price_plans/get_subscription_price_plan_by_id',
    GetSubscriptionRandomMeals: 'subscription_price_plans/get_subscription_random_meals',

    GetAllergenPreferences: 'companyusers/get_allergen_preferences',
    GetDislikePreferences: 'companyusers/get_dislike_preferences',
    AddAllergenPreferences: 'companyusers/save_allergen_preferences',
    AddDislikePreferences: 'companyusers/save_dislike_preferences',

    GetAddresses: 'address/get_address',
    UpdateAdresses: 'address/update_address',
    GetCards: 'card/get_cards',
    AddCards: 'card/add_card',
    DeleteCards: 'card/delete_card',
};

export const ERROR_CODE = {
    invalidtoken: 401,
    error: 602,
    success: 200,
    usernotactive: 603,
    datanotfound: 404,
};

export const paymentTestKey = process.env.REACT_APP_PAYMENT_TEST_KEY;