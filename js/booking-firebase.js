import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ننتظر حتى يتم تحميل الصفحة بالكامل لضمان رؤية الأزرار
document.addEventListener('DOMContentLoaded', () => {
    
    const modal = document.getElementById('bookingModal');
    const serviceNameEl = document.getElementById('serviceName');
    const form = document.getElementById('bookingForm');
    const bookButtons = document.querySelectorAll('.book-btn');
    const closeBtn = document.querySelector('.gc-close');
    const cancelBtn = document.getElementById('gc-cancel');

    // --- 1. وظائف النافذة (Modal) ---
    function openModal(service = 'عام') {
        if (serviceNameEl) serviceNameEl.textContent = service;
        if (modal) {
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
        if (form) form.reset();
    }

    // ربط أزرار "احجز الآن" الموجودة في الصفحة
    bookButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const service = btn.getAttribute('data-service') || 'خدمة غير محددة';
            openModal(service);
        });
    });

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;

    // --- 2. وظيفة إرسال البيانات إلى Firebase ---
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();

            // سحب البيانات من الحقول - تأكد أن هذه الـ IDs موجودة في HTML
            const userName = document.getElementById('userName')?.value || 'بدون اسم';
            const phone = document.getElementById('userPhone')?.value || 'بدون رقم';
            const service = serviceNameEl?.textContent || 'عام';
            const time = document.getElementById('b-time')?.value || '-';

            try {
                // إرسال البيانات للـ Firestore
                const docRef = await addDoc(collection(db, "reservations"), {
                    name: userName,
                    phone: phone,
                    service: service,
                    time: time,
                    createdAt: serverTimestamp()
                });

                alert("✅ تم استلام حجزك بنجاح! شكراً لك.");
                closeModal();
            } catch (error) {
                console.error("خطأ تقني:", error);
                alert("❌ عذراً، فشل الإرسال. تأكد من اتصالك بالإنترنت.");
            }
        };
    } else {
        console.error("خطأ: لم يتم العثور على عنصر باسم id='bookingForm' في صفحة الـ HTML");
    }
});
