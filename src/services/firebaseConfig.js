import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDV7-a6rHgK6GRLb8jf-Ymy-h0YjhNAWww",
  authDomain: "productadminapp-899f3.firebaseapp.com",
  projectId: "productadminapp-899f3",
  storageBucket: "productadminapp-899f3.firebasestorage.app",
  messagingSenderId: "481010518963",
  appId: "1:481010518963:web:b39da7f1fee33b8f0c59c6"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Fix lỗi Warning AsyncStorage và khởi tạo Auth chuẩn React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);