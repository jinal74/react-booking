export const SidebarItems = [
    { label: 'Meal Prep', type: 'heading' },
    { label: 'Dashboard', path: 'dashboard', icon: 'bx bx-home-circle' },
    { label: 'Marketing', type: 'heading' },
    {
        label: 'Coupons',
        path: 'coupons',
        icon: 'bx bx-purchase-tag',
    },
    { label: 'Settings', type: 'heading' },
    {
        label: 'Delivery Settings',
        path: '#',
        icon: 'bx bx-slider-alt',
        options: [
            { path: 'delivery-settings/states', label: 'States' },
            { path: 'delivery-settings/zipcodes', label: 'Delivery Rates - Zipcodes' },
            { path: 'delivery-settings/transporters', label: 'Delivery Routes & Methods' },
            { path: 'delivery-settings/pickup-points', label: 'Pickup Locations' },
            { path: 'delivery-settings/bag-types', label: 'Bag Types' },
        ]
    },
    {
        label: 'Kitchen Settings',
        path: '#',
        icon: 'bx bx-slider-alt',
        options: [
            { path: 'kitchen-settings/meal-categories-groups', label: 'Meal Categories Groups' },
            { path: 'kitchen-settings/meal-categories', label: 'Meal Categories' },
            { path: 'kitchen-settings/ingredient-categories', label: 'Ingredient Categories' },
            // { path: 'kitchen-settings/sub-recipe-groups', label: 'Sub-Recipe Groups' },
            { path: 'kitchen-settings/allergens', label: 'Allergens' },
            { path: 'kitchen-settings/dislikes', label: 'Dislikes' },
            { path: 'kitchen-settings/subscription-creation', label: 'Subscription Creation' },
            // { path: 'kitchen-settings/subscription-creation-group', label: 'Subscription Creation Groups' },
            { path: 'kitchen-settings/funnel-reasons', label: 'Cancel/Pause Funnel Reasons' },
            { path: 'kitchen-settings/meal-packs', label: 'Meal Packs' },
            { path: 'kitchen-settings/macros', label: 'Macros' },
            { path: 'kitchen-settings/portion-sizes', label: 'Portions Sizes' },
            { path: 'kitchen-settings/units', label: 'Units' },
            // { path: 'kitchen-settings/supplier', label: 'Suppliers' },
        ]
    },
    {
        label: 'Business Settings',
        path: '#',
        icon: 'bx bx-slider-alt',
        options: [
            { path: 'business-settings/kitchen-locations', label: 'Kitchen Locations' },
            { path: 'business-settings/cutoff-timer', label: 'Cut-off Timer' },
            { path: 'business-settings/user-profiles', label: 'Users Roles' },
        ]
    },
    { label: 'Ordering', type: 'heading' },
    {
        label: 'Kitchen',
        path: '#',
        icon: 'bx bx-restaurant',
        options: [
            { path: 'kitchen-ordering/ingredients', label: 'Ingredient' },
            { path: 'kitchen-ordering/sub-recipes', label: 'Sub Recipes' },
            { path: 'kitchen-ordering/meal-recipes', label: 'Meal Recipes' },
            { path: 'kitchen-ordering/meal-prices', label: 'Meal Prices' },
            { path: 'kitchen-ordering/meal-prep-menu', label: 'Meal Prep Menu' },
        ]
    },
    { label: 'Clients', type: 'heading' },
    {
        label: 'Users',
        path: 'users',
        icon: 'bx bx-group',
    },
    {
        label: 'Subscriptions',
        path: 'subscriptions',
        icon: 'bx bx-purchase-tag',
    },
]

export const KitchenLocListDisplay = ['/admin/delivery-settings/zipcodes', '/admin/delivery-settings/transporters', '/admin/delivery-settings/pickup-points', '/admin/kitchen-settings/subscription-creation', '/admin/kitchen-ordering/meal-prep-menu', '/admin/dashboard', '/admin/subscriptions']