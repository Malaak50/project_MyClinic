const admin = require("firebase-admin");

let app;
if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
} else {
  app = admin.app();
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { admin, app, auth, db };
