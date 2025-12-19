import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// لنفترض أن زر الإرسال لديه id="bookingForm"
const form = document.getElementById('bookingForm');

if(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // الحصول على القيم من الحقول (تأكد من الـ ID في HTML)
        const userName = document.getElementById('userName').value;
        const phone = document.getElementById('userPhone').value;

        try {
            const docRef = await addDoc(collection(db, "reservations"), {
                name: userName,
                phone: phone,
                createdAt: serverTimestamp() // يحفظ وقت الحجز تلقائياً
            });
            alert("تم الحجز بنجاح! رقم الطلب: " + docRef.id);
            form.reset(); // تفريغ الحقول بعد النجاح
        } catch (error) {
            console.error("خطأ في الحجز: ", error);
            alert("حدث خطأ، حاول مرة أخرى.");
        }
    });
}