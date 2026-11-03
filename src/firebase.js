import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyDElS-RYAkDwk4iOkL_sFvDw9Y9a4wFrc0',
    authDomain: 'ttp-booking-meal-management.firebaseapp.com',
    projectId: 'ttp-booking-meal-management',
    storageBucket: 'ttp-booking-meal-management.appspot.com',
    messagingSenderId: '547554786596',
    appId: '1:547554786596:web:21433d51e2b875810a87b1',
    measurementId: 'G-F94TBEFG8G',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
