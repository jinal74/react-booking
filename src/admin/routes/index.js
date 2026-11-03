import React from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/index';
import AddEditMealCategories from '../pages/Settings/KitchenSettings/AddEditMealCategories';
import AddEditMealPacks from '../pages/Settings/KitchenSettings/AddEditMealPacks';
import IngredientsList from '../pages/Ordering/Kitchen/Ingredients/IngredientsList';
import AllMealCategoriesGroups from '../pages/Settings/KitchenSettings/AllMealCategoriesGroups';
import AllMealCategories from '../pages/Settings/KitchenSettings/AllMealCategories';
import AllAllergens from '../pages/Settings/KitchenSettings/AllAllergens';
import AllDislikes from '../pages/Settings/KitchenSettings/AllDislikes';
import AllCategories from '../pages/Settings/KitchenSettings/AllCategories';
import AddEditSubscriptionCreation from '../pages/Settings/KitchenSettings/AddEditSubscriptionCreation';
import AllSubscriptionCreation from '../pages/Settings/KitchenSettings/AllSubscriptionCreation';
import CancelPauseFunnelReasons from '../pages/Settings/KitchenSettings/CancelPauseFunnelReasons';
import AllMealPacksList from '../pages/Settings/KitchenSettings/AllMealPacksList';
import AllPortionSizes from '../pages/Settings/KitchenSettings/AllPortionSizes';
import AllUnitsList from '../pages/Settings/KitchenSettings/AllUnitsList';
import AllMacros from '../pages/Settings/KitchenSettings/AllMacros';
import AddEditIngredients from '../pages/Ordering/Kitchen/Ingredients/AddEditIngredients';
import SubRecipesList from '../pages/Ordering/Kitchen/SubRecipes/SubRecipesList';
import AddEditSubRecipes from '../pages/Ordering/Kitchen/SubRecipes/AddEditSubRecipes';
import MealRecipesList from '../pages/Ordering/Kitchen/MealRecipes/MealRecipesList';
import AddEditMealRecipes from '../pages/Ordering/Kitchen/MealRecipes/AddEditMealRecipes';
import MealPricesList from '../pages/Ordering/Kitchen/MealPrices/MealPricesList';
import MenusList from '../pages/Ordering/Kitchen/MealPrepMenus/MenusList';
import AllStatesList from '../pages/Settings/DeliverySettings/States/AllStatesList';
import AllZipCodes from '../pages/Settings/DeliverySettings/Zipcodes/AllZipCodes';
import AllTransporters from '../pages/Settings/DeliverySettings/Transporters/AllTransporters';
import AllPickupPoints from '../pages/Settings/DeliverySettings/PickupPoints/AllPickupPoints';
import AllBagTypes from '../pages/Settings/DeliverySettings/BagTypes/AllBagTypes';
import AddEditStates from '../pages/Settings/DeliverySettings/States/AddEditStates';
import AddEditTransporters from '../pages/Settings/DeliverySettings/Transporters/AddEditTransporters';
import AddEditPickupPoints from '../pages/Settings/DeliverySettings/PickupPoints/AddEditPickupPoints';
import AddEditBagTypes from '../pages/Settings/DeliverySettings/BagTypes/AddEditBagTypes';
import AddEditZipCodes from '../pages/Settings/DeliverySettings/Zipcodes/AddEditZipCodes';
import DeliveryRouteMethod from '../pages/Settings/DeliverySettings/Zipcodes/DeliveryRouteMethod';
import RequestedZipCodes from '../pages/Settings/DeliverySettings/Zipcodes/RequestedZipCodes';
import UserList from '../pages/Clients/Users/UserList';
import AddEditUser from '../pages/Clients/Users/AddEditUser';
import AllKitchenLocations from '../pages/Settings/BusinessSetings/KitchenLocations/AllKitchenLocations';
import AllCutoffTimer from '../pages/Settings/BusinessSetings/AllCutoffTimer';
import AddEditKitchenLocation from '../pages/Settings/BusinessSetings/KitchenLocations/AddEditKitchenLocation';
import AllUserRoles from '../pages/Settings/BusinessSetings/UserRoles/AllUserRoles';
import AddEditUserRole from '../pages/Settings/BusinessSetings/UserRoles/AddEditUserRole';
import CouponsList from '../pages/Marketing/Coupons/CouponsList';
import AddEditCoupons from '../pages/Marketing/Coupons/AddEditCoupons';
import SubscriptionsList from '../pages/Clients/Subscriptions/SubscriptionsList';
import SingleSubscription from '../pages/Clients/Subscriptions/SingleSubscription';

const authProtectedRoutes = [
    { path: '/dashboard', component: <Dashboard /> },

    //Delivery Settings
    { path: '/delivery-settings/states', component: <AllStatesList /> },
    { path: '/delivery-settings/add-states', component: <AddEditStates /> },
    { path: '/delivery-settings/edit-states/:id', component: <AddEditStates /> },
    { path: '/delivery-settings/zipcodes', component: <AllZipCodes /> },
    { path: '/delivery-settings/add-zipcodes', component: <AddEditZipCodes /> },
    { path: '/delivery-settings/edit-zipcodes/:id', component: <AddEditZipCodes /> },
    { path: '/delivery-settings/edit-zipcodes/:id/:zipcode', component: <DeliveryRouteMethod /> },
    { path: '/delivery-settings/requested-zipcodes', component: <RequestedZipCodes /> },
    { path: '/delivery-settings/transporters', component: <AllTransporters /> },
    { path: '/delivery-settings/add-transporters', component: <AddEditTransporters /> },
    { path: '/delivery-settings/edit-transporters/:id', component: <AddEditTransporters /> },
    { path: '/delivery-settings/pickup-points', component: <AllPickupPoints /> },
    { path: '/delivery-settings/add-pickup-points', component: <AddEditPickupPoints /> },
    { path: '/delivery-settings/edit-pickup-points/:id', component: <AddEditPickupPoints /> },
    { path: '/delivery-settings/bag-types', component: <AllBagTypes /> },
    { path: '/delivery-settings/add-bag-types', component: <AddEditBagTypes /> },
    { path: '/delivery-settings/edit-bag-types/:id', component: <AddEditBagTypes /> },

    //Kitchen Settings
    { path: '/kitchen-settings/meal-categories-groups', component: <AllMealCategoriesGroups /> },
    { path: '/kitchen-settings/add-meal-categories', component: <AddEditMealCategories /> },
    { path: '/kitchen-settings/edit-meal-categories/:id', component: <AddEditMealCategories /> },
    { path: '/kitchen-settings/meal-categories', component: <AllMealCategories /> },
    { path: '/kitchen-settings/allergens', component: <AllAllergens /> },
    { path: '/kitchen-settings/dislikes', component: <AllDislikes /> },
    { path: '/kitchen-settings/ingredient-categories', component: <AllCategories /> },
    { path: '/kitchen-settings/add-subscription-creation', component: <AddEditSubscriptionCreation /> },
    { path: '/kitchen-settings/edit-subscription-creation/:id', component: <AddEditSubscriptionCreation /> },
    { path: '/kitchen-settings/subscription-creation', component: <AllSubscriptionCreation /> },
    { path: '/kitchen-settings/funnel-reasons', component: <CancelPauseFunnelReasons /> },
    { path: '/kitchen-settings/add-meal-packs', component: <AddEditMealPacks /> },
    { path: '/kitchen-settings/edit-meal-packs/:id', component: <AddEditMealPacks /> },
    { path: '/kitchen-settings/meal-packs', component: <AllMealPacksList /> },
    { path: '/kitchen-settings/portion-sizes', component: <AllPortionSizes /> },
    { path: '/kitchen-settings/units', component: <AllUnitsList /> },
    { path: '/kitchen-settings/macros', component: <AllMacros /> },

    //Business Settings
    { path: '/business-settings/kitchen-locations', component: <AllKitchenLocations /> },
    { path: '/business-settings/add-kitchen-locations', component: <AddEditKitchenLocation /> },
    { path: '/business-settings/edit-kitchen-locations/:id', component: <AddEditKitchenLocation /> },
    { path: '/business-settings/cutoff-timer', component: <AllCutoffTimer /> },
    { path: '/business-settings/user-profiles', component: <AllUserRoles /> },
    { path: '/business-settings/add-user-profiles', component: <AddEditUserRole /> },
    { path: '/business-settings/edit-user-profiles/:id', component: <AddEditUserRole /> },

    //Kitchen Ordering
    { path: '/kitchen-ordering/ingredients', component: <IngredientsList /> },
    { path: '/kitchen-ordering/add-ingredients', component: <AddEditIngredients /> },
    { path: '/kitchen-ordering/edit-ingredients/:id', component: <AddEditIngredients /> },
    { path: '/kitchen-ordering/add-sub-recipes', component: <AddEditSubRecipes /> },
    { path: '/kitchen-ordering/edit-sub-recipes/:id', component: <AddEditSubRecipes /> },
    { path: '/kitchen-ordering/sub-recipes', component: <SubRecipesList /> },
    { path: '/kitchen-ordering/add-meal-recipes', component: <AddEditMealRecipes /> },
    { path: '/kitchen-ordering/edit-meal-recipes/:id', component: <AddEditMealRecipes /> },
    { path: '/kitchen-ordering/meal-recipes', component: <MealRecipesList /> },
    { path: '/kitchen-ordering/meal-prices', component: <MealPricesList /> },
    { path: '/kitchen-ordering/meal-prep-menu', component: <MenusList /> },

    // clients 
    { path: '/users', component: <UserList /> },
    { path: '/add-users', component: <AddEditUser /> },
    { path: '/edit-users/:id', component: <AddEditUser /> },
    { path: '/subscriptions', component: <SubscriptionsList /> },
    { path: '/view-subscription/:id', component: <SingleSubscription /> },

    { path: '/coupons', component: <CouponsList /> },
    { path: '/add-coupons', component: <AddEditCoupons /> },
    { path: '/edit-coupons/:id', component: <AddEditCoupons /> },

    // this route should be at the end of all other routes
    // eslint-disable-next-line react/display-name
    {
        path: '/',
        exact: true,
        component: <Navigate to="/admin/dashboard" />,
    },
];

export { authProtectedRoutes };
