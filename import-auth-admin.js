/**
 * Firebase Admin SDK - Batch Import Users
 * 
 * Script ini digunakan untuk membuat akun Firebase Authentication secara masal
 * dengan UID yang diset sama persis dengan UID di RTDB (contoh: SISWA_3192042116).
 * 
 * Cara menggunakan:
 * 1. Dapatkan file serviceAccountKey.json dari Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
 * 2. Taruh file tersebut di folder yang sama dengan script ini.
 * 3. Jalankan: npm install firebase-admin
 * 4. Jalankan: node import-auth-admin.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');

// 1. Load service account
let serviceAccount;
try {
  serviceAccount = require('./musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');
} catch (e) {
  console.error("❌ ERROR: File musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json tidak ditemukan!");
  console.log("Silakan unduh dari Firebase Console dan letakkan di folder ini.");
  process.exit(1);
}

// 2. Initialize App
initializeApp({
  credential: cert(serviceAccount)
});

// 3. Load Generated DB
const rtdbExport = JSON.parse(fs.readFileSync('musada-sd-default-rtdb-export.json', 'utf-8'));
const users = rtdbExport.users || {};

const defaultPassword = 'Password123!';

async function importUsers() {
  console.log(`Mulai memproses ${Object.keys(users).length} pengguna...`);
  
  for (const [uid, userData] of Object.entries(users)) {
    try {
      // Periksa apakah user sudah ada
      try {
        await getAuth().getUser(uid);
        console.log(`[SKIP] Akun sudah ada: ${uid}`);
        continue;
      } catch (e) {
        if (e.code !== 'auth/user-not-found') throw e;
      }

      // Buat akun baru
      const cleanUid = uid.toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `${cleanUid}@musada.sch.id`;

      await getAuth().createUser({
        uid: uid,
        email: email,
        password: defaultPassword,
        displayName: userData.name
      });

      console.log(`[SUCCESS] Dibuat: ${uid} - Email: ${email}`);
    } catch (error) {
      console.error(`[ERROR] Gagal membuat ${uid}:`, error.message);
    }
  }

  console.log("Selesai memproses semua pengguna!");
}

importUsers();
