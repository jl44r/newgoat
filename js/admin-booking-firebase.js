// js/admin-booking-firebase.js
import { db } from './firebase-config.js';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch,
  doc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const ADMIN_PASSWORD = 'admin123'; // كلمة مرور لوحة الإدارة

// تعريف العناصر من الصفحة
const btnLogin = document.getElementById('btnLogin');
const adminPass = document.getElementById('adminPass');
const adminControls = document.getElementById('adminControls');
const loginArea = document.getElementById('loginArea');
const bookingsBody = document.getElementById('bookingsBody');
const adminMsg = document.getElementById('adminMsg');
const btnClear = document.getElementById('btnClear');
const btnExport = document.getElementById('btnExport');
const searchInput = document.getElementById('search');
const clearSearchBtn = document.getElementById('clear');

let unsubscribeRealtime = null;

// دالة لتنظيف النصوص ومنع الاختراق (XSS)
function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

// دالة رسم الجدول بناءً على البيانات القادمة من Firebase
function renderListFromDocs(docs) {
  bookingsBody.innerHTML = '';
  if (docs.length === 0) {
    bookingsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#777;padding:18px;">لا توجد حجوزات حتى الآن.</td></tr>';
    return;
  }

  docs.forEach((docSnap, idx) => {
    const data = docSnap.data();
    const tr = document.createElement('tr');
    
    // تحويل الوقت من نظام Firebase إلى نص مقروء
    const created = data.createdAt && data.createdAt.toDate 
      ? data.createdAt.toDate().toLocaleString('ar-EG') 
      : (data.createdAt || 'غير محدد');

    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td class="service">${escapeHtml(data.service || 'عام')}</td>
      <td class="name">${escapeHtml(data.name || '')}</td>
      <td class="phone">${escapeHtml(data.phone || '')}</td>
      <td class="time">${escapeHtml(data.time || '')}</td>
      <td class="created">${escapeHtml(created)}</td>
    `;
    bookingsBody.appendChild(tr);
  });
}

// تشغيل المستمع اللحظي (يجلب البيانات فور حدوث أي تغيير)
function startRealtimeListener() {
  const col = collection(db, 'reservations');
  const q = query(col, orderBy('createdAt', 'desc'));

  unsubscribeRealtime = onSnapshot(q, (snapshot) => {
    renderListFromDocs(snapshot.docs);
    console.log("تم تحديث البيانات لحظياً");
  }, (err) => {
    console.error('خطأ في الاتصال اللحظي:', err);
    adminMsg.textContent = 'فشل في الاتصال بالقاعدة. تأكد من إعدادات Firestore Rules.';
  });
}

// تسجيل الدخول
if (btnLogin && adminPass) {
  btnLogin.addEventListener('click', () => {
    if (adminPass.value === ADMIN_PASSWORD) {
      loginArea.style.display = 'none';
      adminControls.style.display = 'block';
      startRealtimeListener();
    } else {
      adminMsg.textContent = 'كلمة المرور خاطئة!';
      adminMsg.style.color = 'red';
      setTimeout(() => adminMsg.textContent = '', 2000);
    }
  });
  // الدخول عند ضغط Enter
  adminPass.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnLogin.click();
  });
}

// تصدير البيانات لملف Excel (CSV)
if (btnExport) {
  btnExport.addEventListener('click', async () => {
    const querySnapshot = await getDocs(collection(db, "reservations"));
    let csvContent = "data:text/csv;charset=utf-8,الرقم,الخدمة,الاسم,الهاتف,الوقت,تاريخ الحجز\n";
    
    querySnapshot.forEach((doc, index) => {
      const d = doc.data();
      const date = d.createdAt?.toDate().toLocaleString() || '';
      csvContent += `${index+1},${d.service},${d.name},${d.phone},${d.time},${date}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reservations.csv");
    document.body.appendChild(link);
    link.click();
  });
}

// حذف جميع الحجوزات (للمدير فقط)
if (btnClear) {
  btnClear.addEventListener('click', async () => {
    if (confirm('هل أنت متأكد من حذف "كل" الحجوزات نهائياً؟')) {
      const querySnapshot = await getDocs(collection(db, "reservations"));
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      alert('تم تنظيف قاعدة البيانات بنجاح.');
    }
  });
}

// نظام البحث السريع في الجدول
if (searchInput) {
  searchInput.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    document.querySelectorAll('#bookings tbody tr').forEach(tr => {
      const text = tr.innerText.toLowerCase();
      tr.style.display = text.includes(q) ? '' : 'none';
    });
  });
}