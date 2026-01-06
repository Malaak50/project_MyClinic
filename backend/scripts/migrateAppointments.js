const { db } = require("../firebase/admin");

async function getDoctorInfo(doctorId) {
  if (!doctorId) return { doctorName: "", clinicName: "" };
  let doctorName = "";
  let clinicName = "";
  try {
    const dSnap = await db.collection("doctors").doc(doctorId).get();
    if (dSnap.exists) {
      const d = dSnap.data();
      clinicName = d.clinicName || clinicName;
      doctorName = d.name || doctorName;
    }
  } catch {}
  try {
    const uSnap = await db.collection("users").doc(doctorId).get();
    if (uSnap.exists) {
      const u = uSnap.data();
      doctorName = doctorName || u.displayName || u.name || "";
    }
  } catch {}
  return { doctorName, clinicName };
}

async function getPatientName(patientId) {
  if (!patientId) return "";
  try {
    const uSnap = await db.collection("users").doc(patientId).get();
    if (uSnap.exists) {
      const u = uSnap.data();
      return u.displayName || u.name || u.email || "";
    }
  } catch {}
  return "";
}

async function migrate() {
  console.log("Starting appointments migration...");
  const appsSnap = await db.collection("appointments").get();
  const total = appsSnap.size;
  let updated = 0;
  const batchSize = 400;
  let batch = db.batch();
  let counter = 0;

  for (const docRef of appsSnap.docs) {
    const data = docRef.data();
    const update = {};

    // doctor info
    if (!data.doctorName || !data.clinicName) {
      const info = await getDoctorInfo(data.doctorId);
      if (!data.doctorName && info.doctorName) update.doctorName = info.doctorName;
      if (!data.clinicName) update.clinicName = info.clinicName || "MyClinic";
    }

    // patient info
    if (!data.patientName) {
      const pn = await getPatientName(data.patientId);
      if (pn) update.patientName = pn;
    }

    if (Object.keys(update).length > 0) {
      batch.update(docRef.ref, update);
      updated++;
      counter++;
      if (counter >= batchSize) {
        await batch.commit();
        console.log(`Committed batch of ${counter} updates...`);
        batch = db.batch();
        counter = 0;
      }
    }
  }

  if (counter > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${counter} updates...`);
  }

  console.log(`Migration finished. Total: ${total}, Updated: ${updated}`);
}

migrate().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});

