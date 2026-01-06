# Configuration Firebase (Auth + Firestore)

## Étape 1 — Créer le projet Firebase
1. Aller sur https://console.firebase.google.com et cliquer “Ajouter un projet”.
2. Nommer le projet (ex: “MyClinic”) et créer.
3. Dans “Build” > “Authentication”, activer “Email/Password”.
4. Dans “Build” > “Firestore Database”, cliquer “Créer une base de données”.

## Étape 2 — Choisir l’édition, l’ID et l’emplacement
1. Sélectionner “Mode production” (recommandé).
2. Édition: utiliser Cloud Firestore standard (par défaut).
3. ID de la base de données:
   - Si proposé, laisser `(default)` ou entrer `myclinic` (si vous utilisez multi-base).
   - L’ID identifie votre base; garder un ID simple.
4. Emplacement:
   - Choisir la région proche des utilisateurs (ex: `nam5 (United States)`).
   - L’emplacement est immuable: choisissez une région stable à long terme.
5. Valider et créer la base.

## Étape 3 — Configurer l’App Web (Frontend)
1. Aller dans “Project settings” > “General” > “Your apps” > “Web app”.
2. Cliquer “Ajouter une app” et récupérer la configuration Web.
3. Définir les variables d’environnement avant de lancer Expo:
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
   - `EXPO_PUBLIC_API_URL=http://localhost:3000`
4. Lancer le frontend: `npm run start` dans le dossier `myclinic/`.

## Étape 4 — Configurer le Backend (Service Account)
1. Aller dans “Project settings” > “Service accounts” > “Firebase Admin SDK”.
2. Cliquer “Générer une nouvelle clé privée” et sauvegarder le JSON.
3. Sur votre machine:
   - Définir `GOOGLE_APPLICATION_CREDENTIALS` vers le chemin du JSON.
   - Définir `FIREBASE_PROJECT_ID` avec l’ID du projet.
   - Optionnel: `PORT=3000`.
4. Lancer le backend: `npm run start` dans `backend/`.

## Étape 5 — Créer les Collections et Champs (Modèle MyClinic)
Créez les collections suivantes (les documents sont libres, mais voici le schéma recommandé):

- `users`
  - uid (string, ID utilisateur Firebase)
  - role (string: "admin" | "doctor" | "patient")
  - email (string)
  - displayName (string)
  - phone (string)
  - createdAt (timestamp)
  - disabled (boolean, optionnel)

- `doctors`
  - id (string, égal au uid)
  - userId (string, uid)
  - specialties (array<string>)
  - clinicName (string)
  - availability (array<object> ex: { day: "2025-12-31", slots: ["09:00","10:00"] })
  - status (string: "active" | "inactive")

- `patients`
  - id (string, égal au uid)
  - userId (string, uid)
  - birthDate (string "YYYY-MM-DD")
  - allergies (array<string>)
  - chronicConditions (array<string>)
  - insuranceNumber (string)

- `appointments`
  - patientId (string, uid patient)
  - doctorId (string, uid doctor)
  - status (string: "requested" | "confirmed" | "canceled" | "completed")
  - scheduledAt (timestamp)
  - reason (string)
  - notes (string, optionnel)
  - createdAt (timestamp)

- `medicalRecords`
  - patientId (string)
  - doctorId (string)
  - entries (array<object> ex: { date: timestamp, type: string, notes: string })
  - lastUpdated (timestamp)

- `prescriptions`
  - patientId (string)
  - doctorId (string)
  - items (array<object> ex: { drug: string, dosage: string, duration: string })
  - issuedAt (timestamp)
  - expiresAt (timestamp)

- `notifications`
  - userId (string)
  - type (string)
  - title (string)
  - body (string)
  - createdAt (timestamp)
  - read (boolean)

Conseils de types:
- Utilisez `timestamp` pour les dates stockées (facilite tri et requêtes).
- Gardez des champs string pour les IDs (uid).
- Les tableaux doivent rester simples pour éviter des index coûteux.

## Étape 6 — Règles de Sécurité (Principes)
- Admin: pas d’accès lecture/écriture aux données médicales (medicalRecords, prescriptions).
- Patient: accès à ses propres documents uniquement (patientId == uid).
- Doctor: accès aux documents des patients avec qui il a un rendez-vous confirmé.
- Notifications: accès uniquement sur `userId == uid`.

Appliquez les règles dans la Console Firestore > Rules. Testez avec le simulateur avant mise en prod.

## Étape 7 — Index et Performances
- Créez des index composites si vous filtrez par `doctorId` + `status` ou triez par `scheduledAt`.
- Exemple d’index utile:
  - Collection `appointments`: filter `doctorId`, `status`, orderBy `scheduledAt`.
  - Collection `notifications`: filter `userId`, orderBy `createdAt`.
- Utilisez la pagination (limit/offset ou cursors) côté client.

## Étape 8 — Vérification End-to-End
1. Créez un utilisateur via Register dans l’app et connectez-vous.
2. Attribuez un rôle via `POST /auth/assign-role` (admin).
3. Vérifiez la redirection par rôle (admin/doctor/patient).
4. Créez un `appointments` et vérifiez lecture/écriture selon les rôles.
5. Vérifiez que les règles bloquent bien l’admin sur `medicalRecords`/`prescriptions`.

## Checklist Rapide
- Auth activée (Email/Password).
- Firestore créé en mode production, région choisie (ex: `nam5`).
- Variables Frontend `EXPO_PUBLIC_*` et `EXPO_PUBLIC_API_URL` définies.
- Backend `GOOGLE_APPLICATION_CREDENTIALS` et `FIREBASE_PROJECT_ID` définis.
- Collections créées avec champs conformes au modèle ci-dessus.
- Règles de sécurité en place et testées.
- Index configurés pour requêtes fréquentes.
