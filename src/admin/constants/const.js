export const API_PATH = {
    GetKitchenStatus: 'kitchenLocation/get_kitchen_status',
    UpdateKitchenStatus: 'kitchenLocation/kitchen_status',

    getAllCoupons: 'coupons/get_all_coupons',
    addCoupon: 'coupons/add_coupon',
    updateCoupon: 'coupons/update_coupon',
    getCouponsById: 'coupons/get_coupon_by_id',

    getallDeliveryStates: 'delieverysettings/get_all_delivery_states',
    addDeliveryStates: 'delieverysettings/add_delivery_states',
    updateDeliveryStates: 'delieverysettings/update_delivery_states',
    getDeliveryStateById: 'delieverysettings/get_delivery_states_id',

    getallDeliveryRoutes: 'delieverysettings/get_all_delivery_routes',
    addDeliveryRoutes: 'delieverysettings/add_delivery_routes',
    updateDeliveryRoutes: 'delieverysettings/update_delivery_routes',
    getDeliveryRouteById: 'delieverysettings/get_delivery_routes_id',

    getallDeliveryZipcode: 'delieverysettings/get_all_delivery_zipcode',
    addDeliveryZipcode: 'delieverysettings/add_delivery_zipcode',
    updateDeliveryZipcode: 'delieverysettings/update_delivery_zipcode',
    deleteDeliveryZipcode: 'delieverysettings/delete_delivery_zipcode',
    getDeliveryZipcodeById: 'delieverysettings/get_delivery_zipcode_id',

    getAllPickupLocation: 'pickupLocation/get_all_pickup_location',
    addPickupLocation: 'pickupLocation/add_pickup_location',
    updatePickupLocation: 'pickupLocation/update_pickup_location',
    getPickupLocationById: 'pickupLocation/get_pickup_location_id',

    getAllBagTypes: 'bagtypes/get_all_bag_types',
    addBagTypes: 'bagtypes/add_bag_types',
    updateBagTypes: 'bagtypes/update_bag_types',
    getBagTypeById: 'bagtypes/get_bag_types_id',

    addMealCategoriesGroups: 'mealcategorygroup/add_meal_category_group',
    editMealCategoriesGroups: 'mealcategorygroup/update_meal_category_group',
    getMealCategoriesGroups: 'mealcategorygroup/get_meal_category_group',

    addMealCategories: 'mealcategory/add_mealcategory',
    editMealCategories: 'mealcategory/update_mealcategory',
    getMealCategories: 'mealcategory/get_all_mealcategory',
    getMealCategoriesById: 'mealcategory/get_meal_category_by_id',

    addIngredientCategory: 'ingredientcategory/add_ingredient_category',
    editIngredientCategory: 'ingredientcategory/update_ingredient_category',
    getIngredientCategory: 'ingredientcategory/get_all_ingredient_category',

    addIngredientAllergens: 'ingredientcategory/add_ingredient_allergens',
    editIngredientAllergens: 'ingredientcategory/update_ingredient_allergens',
    getIngredientAllergens: 'ingredientcategory/get_all_ingredient_allergens',

    addIngredientDislikes: 'ingredientcategory/add_ingredient_dislike',
    editIngredientDislikes: 'ingredientcategory/update_ingredient_dislike',
    getIngredientDislikes: 'ingredientcategory/get_all_ingredient_dislike',

    getAllSubscriptionPlans: 'subscription_plans/get_all_subscription_plans',
    addSubscriptionPlan: 'subscription_plans/add_subscription_plan',
    updateSubscriptionPlan: 'subscription_plans/update_subscription_plan',
    subscriptionPlansById: 'subscription_plans/get_subscription_plan_by_id',
    getAllPrices: 'subscription_price_plans/get_subscription_prices',
    addSubscriptionPrice: 'subscription_price_plans/add_subscription_price_plan',
    updateSubscriptionPrice: 'subscription_price_plans/update_subscription_price_plan',
    deleteSubscriptionPrice: 'subscription_price_plans/delete_subscription_price_plan',

    getAllFunnelReason: 'funnelreason/get_all_funnel_reason',
    addFunnelReason: 'funnelreason/add_funnel_reason',
    updateFunnelReason: 'funnelreason/update_funnel_reason',
    funnelById: 'funnelreason/get_funnel_reason_id',

    getAllMealPack: 'mealpacks/get_all_meal_packs',
    addMealPack: 'mealpacks/add_meal_packs',
    updateMealPack: 'mealpacks/update_meal_packs',
    mealpackById: 'mealpacks/get_meal_packs_id',

    editMacros: 'macro/update_macro',
    getAllMacros: 'macro/get_all_macros',

    addPortionSize: 'portionsize/add_portionsize',
    editPortionSize: 'portionsize/update_portionsize',
    getPortionSize: 'portionsize/get_all_portionsize',
    getActivePortionSize: 'portionsize/get_all_active_portionsize',

    addUnit: 'unit/add_unit',
    editUnit: 'unit/update_unit',
    getAllUnits: 'unit/get_all_units',

    editIngredient: 'ingredientcategory/update_ingredient',
    addIngredient: 'ingredientcategory/add_ingredient',
    getIngredient: 'ingredientcategory/get_all_ingredient',
    deleteIngredient: 'ingredientcategory/delete_ingredient',
    getIngredientMacros: 'ingredientmacro/get_ingredient_macro_values',
    convertToSubRecipe: 'ingredientcategory/convert_to_subrecipe',

    getIngredientsSubRecipe: 'ingredientcategory/get_all_ingredient_and_subrecipe',
    getSubRecipesById: 'subrecipe/get_subrecipe_by_id',

    editSubRecipes: 'subrecipe/update_subrecipes',
    addSubRecipes: 'subrecipe/add_sub_recipe',
    getSubRecipes: 'subrecipe/get_all_subrecipes',
    convertToIngredients: 'subrecipe/convert_to_ingredient',

    addMealRecipes: 'mealrecipe/add_meal_recipe',
    getMealRecipes: 'mealrecipe/get_all_meal_recipe',
    getMealRecipesById: 'mealrecipe/get_meal_recipe_by_id',
    editMealRecipes: 'mealrecipe/update_meal_recipe',
    downLoadMealRecipeCSV: 'mealrecipe/dowload_meal_csv_template',
    uploadMealRecipeCSV: 'mealrecipe/upload_csv_meal_data',

    getMealPortionPriceColumn: 'mealrecipe/get_meal_portion_price_columns',
    getMealPortionPrice: 'mealrecipe/get_meal_portion_prices',
    editMealPortionPrice: 'mealrecipe/update_meal_prices',
    editBulkMealPortionPrice: 'mealrecipe/bulk_update_meal_prices',

    getDateRangeMenu: 'mealprepmenu/get_menu_count_for_date_range',
    getMealsList: 'mealprepmenu/get_meal_list',
    getMenusList: 'mealprepmenu/get_menu_list',
    addMealToMenu: 'mealprepmenu/add_meal_to_menu',
    removeMealToMenu: 'mealprepmenu/remove_meal_from_menu',
    cloneMealMenu: 'mealprepmenu/clone_meal_menu',

    getAllKitchenLocation: 'kitchenLocation/get_all_kitchen_location',
    addKitchenLocation: 'kitchenLocation/add_kitchen_location',
    updateKitchenLocation: 'kitchenLocation/update_kitchen_location',
    getKitchenLocationById: 'kitchenLocation/get_kitchen_location_id',

    getCloseDatesConfig: 'close_dates_config/get_close_dates_config',
    saveCloseDatesConfig: 'close_dates_config/save_close_dates_config',

    getUserRoles: 'user_role/get_admin_panel_roles',
    getAllUserRoleModules: 'user_role/get_all_module_permissions',
    getUserRoleById: 'user_role/get_user_role_by_id',
    addUserRole: 'user_role/add_user_role',
    editUserRole: 'user_role/update_user_role',
    getUserByRole: 'user_role/get_users_by_role',

    getAllCompanyUsers: 'companyusers/get_all_company_users',
    addCompanyUsers: 'companyusers/add_company_user',
    editCompanyUsers: 'companyusers/update_company_user',
    getCompanyUserById: 'companyusers/get_company_user_id',
    getGlobalUserList: 'user_role/get_all_user_roles',
};

export const ERROR_CODE = {
    invalidtoken: 401,
    error: 602,
    success: 200,
    usernotactive: 603,
    datanotfound: 404,
};

export const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
