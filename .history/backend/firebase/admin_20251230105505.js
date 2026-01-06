const admin = require("firebase-admin");

let app;
if (!admin.apps.length) {
  app = admin.initializeApp();
} else {
  app = admin.app();
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { admin, app, auth, db };

