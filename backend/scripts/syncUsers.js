const { db, auth, admin } = require("../firebase/admin");

async function listAllUsers() {
  const users = [];
  let nextPageToken;
  do {
    const result = await auth.listUsers(1000, nextPageToken);
    users.push(...result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);
  return users;
}

function resolveRole(email, existingRole) {
  if (existingRole) return existingRole;
  if (email === "adminmyclinic@gmail.com") return "admin";
  return "patient";
}

async function ensurePatientDoc(uid) {
  const patientRef = db.collection("patients").doc(uid);
  const snap = await patientRef.get();
  if (!snap.exists) {
    await patientRef.set({
      id: uid,
      userId: uid,
      birthDate: "",
      allergies: [],
      chronicConditions: [],
      insuranceNumber: ""
    });
  }
}

async function ensureDoctorDoc(uid) {
  const doctorRef = db.collection("doctors").doc(uid);
  const snap = await doctorRef.get();
  if (!snap.exists) {
    await doctorRef.set({
      id: uid,
      userId: uid,
      specialties: [],
      clinicName: "",
      availability: [],
      status: "active"
    });
  }
}

async function upsertUser(u) {
  const usersRef = db.collection("users").doc(u.uid);
  const snap = await usersRef.get();
  const existing = snap.exists ? snap.data() : null;
  const role = resolveRole(u.email || "", existing?.role);
  const payload = {
    uid: u.uid,
    role,
    email: u.email || "",
    displayName: u.displayName || "",
    phone: u.phoneNumber || "",
    disabled: !!u.disabled
  };
  if (!snap.exists) {
    payload.createdAt = admin.firestore.FieldValue.serverTimestamp();
  }
  await usersRef.set(payload, { merge: true });

  if (role === "patient") await ensurePatientDoc(u.uid);
  if (role === "doctor") await ensureDoctorDoc(u.uid);
}

async function main() {
  const users = await listAllUsers();
  for (const u of users) {
    await upsertUser(u);
    console.log(`Synced user ${u.email} (${u.uid})`);
  }
  console.log("Sync complete");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

