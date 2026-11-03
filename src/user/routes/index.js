import React from 'react';
import MealsByUnit from '../pages/Orders/MealsByUnit';
import MealPacks from '../pages/Orders/MealPacks';
import Subscription from '../pages/Orders/Subscription';
import GiftCards from '../pages/Orders/GiftCards';
import CartPage from '../pages/checkout/CartPage';
import CartConfirm from '../pages/checkout/CartConfirm';
import CurrentMenus from '../pages/CurrentMenu/CurrentMenus';
import CurrentMenuDetails from '../pages/CurrentMenu/CurrentMenuDetails';
import Profile from '../pages/UserMenu/Profile';
import SelectMeals from '../pages/UserMenu/SelectMeals';
import FAQ from '../pages/FAQ';
import Stats from '../pages/UserMenu/Stats';
import Bags from '../pages/UserMenu/Bags';
import Checkouts from '../pages/UserMenu/Checkouts';
import Transactions from '../pages/UserMenu/Transactions';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import PickupLocations from '../pages/PickupLocations';
import Subscriptions from '../pages/UserMenu/Subscriptions';
import CheckoutDetails from '../pages/UserMenu/CheckoutDetails';

const authProtectedRoutes = [
    { path: '/profile', component: <Profile /> },
    { path: '/stats', component: <Stats /> },
    { path: '/checkouts', component: <Checkouts /> },
    { path: '/checkouts/:id', component: <CheckoutDetails /> },
    { path: '/subscriptions', component: <Subscriptions /> },
    { path: '/profile/transactions', component: <Transactions /> },
];

const authNotProtectedRoutes = [
    { path: '/mealsbyunit', component: <MealsByUnit /> },
    { path: '/packs', component: <MealPacks /> },
    { path: '/subscription', component: <Subscription /> },
    { path: '/giftcard', component: <GiftCards /> },
    { path: '/currentmenu', component: <CurrentMenus /> },
    { path: '/currentmenu/:id', component: <CurrentMenuDetails /> },
    { path: '/cart', component: <CartPage /> },
    { path: '/cart-confirm', component: <CartConfirm /> },
    { path: '/pages/faq', component: <FAQ /> },
    { path: '/pages/privacy', component: <PrivacyPolicy /> },
    { path: '/pickuppoints', component: <PickupLocations /> },
    { path: '/meals', component: <SelectMeals /> },
    { path: '/profile/bags', component: <Bags /> },
];

export { authProtectedRoutes, authNotProtectedRoutes };
