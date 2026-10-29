const SCHOOL_LOCATION = Object.freeze({
  lat: -7.378448579234777,
  lng: 112.75929775962251,
  radiusMeters: 50
});
const DEFAULT_ATTENDANCE_RULES = Object.freeze({
  checkInStart: '07:00',
  checkInEnd: '09:00',
  checkOutStart: '15:00',
  checkOutEnd: '17:00',
  attendanceStartDate: '',
  attendanceEndDate: ''
});
const MAX_ACCURACY_METERS = 200;
function getCorsHeaders(origin) {
  const allowOrigin = origin && /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/.test(origin)
    ? origin
    : '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };
}
function jsonResponse(statusCode, body, request) {
  const origin = request ? request.headers.get('Origin') : '';
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...getCorsHeaders(origin)
    }
  });
}
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function timeToMinutes(value) {
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/^([0-1]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}
function isTimeInWindow(currentTime, start, end) {
  const currentMinutes = timeToMinutes(currentTime);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (currentMinutes == null || startMinutes == null || endMinutes == null) return true;
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }
  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
}
function isDateRangeAllowed(dateStr, startDate, endDate) {
  if (!dateStr) return true;
  if (!startDate && !endDate) return true;
  const current = new Date(`${dateStr}T00:00:00+07:00`);
  if (startDate) {
    const start = new Date(`${startDate}T00:00:00+07:00`);
    if (current < start) return false;
  }
  if (endDate) {
    const end = new Date(`${endDate}T23:59:59+07:00`);
    if (current > end) return false;
  }
  return true;
}
let cachedAttendanceRules = null;
let cachedAttendanceRulesTime = 0;
const ATTENDANCE_RULES_CACHE_TTL = 300000;
async function getAttendanceRules(env) {
  const now = Date.now();
  if (cachedAttendanceRules && (now - cachedAttendanceRulesTime) < ATTENDANCE_RULES_CACHE_TTL) {
    return cachedAttendanceRules;
  }
  const runtimeEnv = typeof globalThis !== 'undefined' && globalThis.ATTENDANCE_ENV ? globalThis.ATTENDANCE_ENV : {};
  const databaseUrl = env?.FIREBASE_DATABASE_URL || runtimeEnv.FIREBASE_DATABASE_URL || '';
  const secret = env?.FIREBASE_DB_SECRET || runtimeEnv.FIREBASE_DB_SECRET || '';
  if (!databaseUrl || !secret) {
    return { ...DEFAULT_ATTENDANCE_RULES };
  }
  try {
    const url = `${databaseUrl}/settings.json?auth=${encodeURIComponent(secret)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      return { ...DEFAULT_ATTENDANCE_RULES };
    }
    const settings = await response.json();
    const rules = settings && typeof settings.attendanceRules === 'object' ? settings.attendanceRules : {};
    cachedAttendanceRules = {
      ...DEFAULT_ATTENDANCE_RULES,
      ...rules
    };
    cachedAttendanceRulesTime = now;
    return cachedAttendanceRules;
  } catch (error) {
    return { ...DEFAULT_ATTENDANCE_RULES };
  }
}
async function hashString(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function signPayload(payload, secret) {
  const text = `${secret}:${JSON.stringify(payload)}`;
  const hash = await hashString(text);
  return hash;
}
async function forwardToDriveUploadUrl({ gasUploadUrl, fileName, mimeType, photoDataUrl }) {
  const gasUrl = (gasUploadUrl || '').trim();
  if (!gasUrl) {
    throw new Error('GOOGLE_DRIVE_UPLOAD_URL / GAS_UPLOAD_URL belum di-set di env Worker.');
  }
  const base64Data = (photoDataUrl || '').includes('base64,')
    ? photoDataUrl.split('base64,')[1]
    : photoDataUrl;
  if (!base64Data) {
    throw new Error('photoDataUrl kosong.');
  }
  const params = new URLSearchParams();
  params.append('action', 'upload');
  params.append('fileName', fileName);
  params.append('mimeType', mimeType);
  params.append('fileData', base64Data);
  params.append('folderKey', 'attendance');
  const response = await fetch(gasUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: params.toString()
  });
  let result = {};
  try {
    result = await response.json();
  } catch (error) {
    const text = await response.text();
    throw new Error(text || 'Upload ke server gagal.');
  }
  if (!response.ok || result.status !== 'success') {
    return '';
  }
  return result.fileUrl || '';
}
async function saveAttendanceRecord(record, env) {
  const runtimeEnv = typeof globalThis !== 'undefined' && globalThis.ATTENDANCE_ENV ? globalThis.ATTENDANCE_ENV : {};
  const databaseUrl = env?.FIREBASE_DATABASE_URL || runtimeEnv.FIREBASE_DATABASE_URL || (typeof process !== 'undefined' ? process.env.FIREBASE_DATABASE_URL : '');
  const secret = env?.FIREBASE_DB_SECRET || runtimeEnv.FIREBASE_DB_SECRET || (typeof process !== 'undefined' ? process.env.FIREBASE_DB_SECRET : '');
  if (!databaseUrl || !secret) {
    return;
  }
  const url = `${databaseUrl}/teacher_attendance/${record.dateStr}/${record.teacherId}.json?auth=${encodeURIComponent(secret)}`;
  await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record.record)
  });
}
export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...getCorsHeaders(request.headers.get('Origin'))
        }
      });
    }
    if (request.method !== 'POST') {
      return jsonResponse(405, { status: 'error', message: 'Method not allowed.' }, request);
    }
    try {
      const body = await request.json();
      const { dateStr, teacherId, type, photoDataUrl, location, accuracy, clientTimestamp } = body || {};
      const authHeader = request.headers.get('Authorization') || '';
      const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const attendanceRules = await getAttendanceRules(env);
      if (!teacherId || !dateStr || !photoDataUrl || !location || !location.lat || !location.lng) {
        return jsonResponse(400, { status: 'error', message: 'Payload absensi tidak lengkap.' }, request);
      }
      if (!idToken) {
        return jsonResponse(401, { status: 'error', message: 'Token otentikasi belum dikirim.' }, request);
      }
      if (!isDateRangeAllowed(dateStr, attendanceRules.attendanceStartDate, attendanceRules.attendanceEndDate)) {
        return jsonResponse(403, {
          status: 'error',
          message: `Tanggal absensi tidak dalam rentang yang diizinkan oleh admin.`
        }, request);
      }
      const serverTimestamp = new Date().toISOString();
      const serverDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());
      const effectiveDateStr = serverDateStr;
      const jakartaNow = new Date(new Date(serverTimestamp).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const currentTimeText = jakartaNow.toTimeString().slice(0, 5);
      const windowName = type === 'in' ? 'hadir' : 'pulang';
      const dayNames = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
      const currentDayKey = dayNames[jakartaNow.getDay()] || 'senin';
      const isUmmi = body.isUmmi || body.roleGroup === 'ummi';
      const groupKey = isUmmi ? 'ummi' : 'gtk';
      const sched = attendanceRules.schedules?.[groupKey]?.[currentDayKey] || {};
      const allowFlexible = attendanceRules.allowFlexibleTime === true;
      if (!allowFlexible && sched.isOff) {
        return jsonResponse(403, {
          status: 'error',
          message: `Hari ini (${currentDayKey}) adalah hari libur untuk ${isUmmi ? 'Guru Ummi' : 'GTK'}. Presensi tidak dibuka.`
        }, request);
      }
      const inStart = sched.inStart || (currentDayKey === 'sabtu' && !isUmmi ? '07:00' : '06:00');
      const outStart = sched.outStart || (groupKey === 'ummi' ? '12:00' : (currentDayKey === 'jumat' ? '12:45' : '14:30'));
      if (!allowFlexible) {
        if (type === 'in' && timeToMinutes(currentTimeText) < timeToMinutes(inStart)) {
          return jsonResponse(403, {
            status: 'error',
            message: `Presensi datang hari ${currentDayKey} baru dibuka mulai pukul ${inStart}. Saat ini pukul ${currentTimeText}.`
          }, request);
        }
        if (type === 'out' && timeToMinutes(currentTimeText) < timeToMinutes(outStart)) {
          return jsonResponse(403, {
            status: 'error',
            message: `Presensi pulang hari ${currentDayKey} belum dapat dilakukan sebelum pukul ${outStart}. Saat ini pukul ${currentTimeText}.`
          }, request);
        }
      }
      const distance = getDistanceMeters(location.lat, location.lng, SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng);
      const radius = SCHOOL_LOCATION.radiusMeters;
      const accuracyValue = Number(accuracy || 0);
      if (distance > radius) {
        return jsonResponse(403, { status: 'error', message: `Lokasi di luar area sekolah. Jarak: ${Math.round(distance)}m.` }, request);
      }
      if (accuracyValue > MAX_ACCURACY_METERS) {
        return jsonResponse(403, { status: 'error', message: `Akurasi posisi terlalu besar: ${Math.round(accuracyValue)}m. Maksimal ${MAX_ACCURACY_METERS}m.` }, request);
      }
      const photoHash = await hashString(photoDataUrl);
      const signedPayload = {
        teacherId,
        dateStr: effectiveDateStr,
        type,
        lat: Number(location.lat),
        lng: Number(location.lng),
        accuracy: accuracyValue,
        distanceMeters: Math.round(distance),
        clientTimestamp: clientTimestamp || serverTimestamp,
        serverTimestamp,
        userTokenPresent: !!idToken,
        photoHash
      };
      const serverSignature = await signPayload(signedPayload, env?.WORKER_SECRET || 'local-dev-secret');
      const timeFormatted = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(serverTimestamp)).replace('.', ':');
      const initialPatch = {
        serverTimestamp,
        serverSignature,
        photoHash,
        distanceMeters: Math.round(distance),
        ...(type === 'in' ? {
          time_in: timeFormatted,
          location_in: { lat: Number(location.lat), lng: Number(location.lng), accuracy: accuracyValue, checkedAt: serverTimestamp },
          ...(body.lateReason ? {
            late_reason: body.lateReason,
            appeal_status: 'pending',
            appeal_created_at: serverTimestamp
          } : {})
        } : {
          time_out: timeFormatted,
          location_out: { lat: Number(location.lat), lng: Number(location.lng), accuracy: accuracyValue, checkedAt: serverTimestamp }
        })
      };
      await saveAttendanceRecord({ dateStr: effectiveDateStr, teacherId, record: initialPatch }, env);
      const backgroundTask = async () => {
        try {
          const fileName = `attendance_${teacherId}_${effectiveDateStr}_${Date.now()}.jpg`;
          const gasUrl = env?.GOOGLE_DRIVE_UPLOAD_URL || env?.GAS_UPLOAD_URL;
          const proofUrl = await forwardToDriveUploadUrl({
            gasUploadUrl: gasUrl,
            fileName,
            mimeType: 'image/jpeg',
            photoDataUrl
          });
          if (proofUrl) {
            const proofPatch = type === 'out'
              ? { proof_url_out: proofUrl, proof_url: proofUrl }
              : { proof_url: proofUrl };
            await saveAttendanceRecord({ dateStr: effectiveDateStr, teacherId, record: proofPatch }, env);
          }
        } catch (bgError) {
        }
      };
      if (ctx && typeof ctx.waitUntil === 'function') {
        ctx.waitUntil(backgroundTask());
      } else {
        void backgroundTask();
      }
      return jsonResponse(200, {
        status: 'success',
        message: 'Absensi valid dan berhasil disimpan.',
        proof_url: '',
        location: type === 'in' ? initialPatch.location_in : initialPatch.location_out,
        serverTimestamp,
        serverSignature,
        record: initialPatch,
        distanceMeters: Math.round(distance)
      }, request);
    } catch (error) {
      return jsonResponse(500, {
        status: 'error',
        message: error && error.message ? error.message : 'Terjadi error di Worker.'
      }, request);
    }
  }
};