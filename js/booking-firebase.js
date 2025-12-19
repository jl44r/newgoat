import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// --- أولاً: كود التحكم بالنافذة (Modal) ---
const modal = document.getElementById('bookingModal');
const serviceNameEl = document.getElementById('serviceName');
const bookButtons = document.querySelectorAll('.book-btn');
const closeBtn = document.querySelector('.gc-close');
const cancelBtn = document.getElementById('gc-cancel');
const form = document.getElementById('bookingForm');

// دالة فتح النافذة
function openModal(service = '-') {
    if (serviceNameEl) serviceNameEl.textContent = service;
    if (modal) modal.setAttribute('aria-hidden', 'false');
    if (modal) modal.style.display = 'block'; // للتأكد من ظهورها
}

// دالة إغلاق النافذة
function closeModal() {
    if (modal) modal.setAttribute('aria-hidden', 'true');
    if (modal) modal.style.display = 'none';
    if (form) form.reset();
}

// ربط الأزرار بفتح النافذة
bookButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const service = btn.getAttribute('data-service') || 'عام';
        openModal(service);
    });
});

if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

// --- ثانياً: كود إرسال البيانات إلى Firebase ---
if(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userName = document.getElementById('userName').value;
        const phone = document.getElementById('userPhone').value;
        const service = serviceNameEl ? serviceNameEl.textContent : 'عام';
        const time = document.getElementById('b-time') ? document.getElementById('b-time').value : '-';

        try {
            await addDoc(collection(db, "reservations"), {
                name: userName,
                phone: phone,
                service: service,
                time: time,
                createdAt: serverTimestamp()
            });
            alert("تم الحجز بنجاح!");
            closeModal(); // إغلاق النافذة بعد النجاح
        } catch (error) {
            console.error("خطأ: ", error);
            alert("حدث خطأ أثناء الحجز.");
        }
    });
}
