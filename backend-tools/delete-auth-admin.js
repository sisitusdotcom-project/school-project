/**
 * Firebase Admin SDK - Batch Delete Users
 * 
 * Script ini digunakan untuk menghapus SELURUH pengguna di Firebase Auth.
 * Sangat berguna ketika ingin mengulang import dari awal.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// 1. Load service account
let serviceAccount;
try {
  serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');
} catch (e) {
  console.error("❌ ERROR: File service account tidak ditemukan di keys/");
  process.exit(1);
}

// 2. Initialize App
initializeApp({
  credential: cert(serviceAccount)
});

async function deleteAllUsers() {
  console.log("Memulai penghapusan massal pengguna Firebase Auth...");
  let nextPageToken;
  let deletedCount = 0;

  try {
    do {
      const listUsersResult = await getAuth().listUsers(1000, nextPageToken);
      const uids = listUsersResult.users.map(userRecord => userRecord.uid);
      
      if (uids.length > 0) {
        await getAuth().deleteUsers(uids);
        deletedCount += uids.length;
        console.log(`Berhasil menghapus ${uids.length} pengguna (Total: ${deletedCount})...`);
      }
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`\n✅ SUKSES: Seluruh ${deletedCount} pengguna telah dihapus dari Firebase Auth.`);
  } catch (error) {
    console.error("❌ ERROR saat menghapus:", error.message);
  }
}

deleteAllUsers();
