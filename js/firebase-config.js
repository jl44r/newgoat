// استيراد المكتبات من روابط مباشرة (CDN) لكي تعمل في المتصفح فوراً
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBM00agQ0KnBOAiT0mti-q36r2qFUMBA9U",
  authDomain: "gaming-center-c0a6c.firebaseapp.com",
  projectId: "gaming-center-c0a6c",
  storageBucket: "gaming-center-c0a6c.firebasestorage.app",
  messagingSenderId: "562698071192",
  appId: "1:562698071192:web:8dbd85f0df93f1d5a834ed",
  measurementId: "G-NN5XQM0VRX"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تصدير قاعدة البيانات لاستخدامها في الملفات الأخرى
export const db = getFirestore(app);