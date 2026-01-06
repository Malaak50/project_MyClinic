# MyClinic — Documentation Fonctionnelle et Technique

## Aperçu
- Application mobile basée sur Expo/React Native pour la gestion de rendez-vous médicaux.
- Rôles pris en charge: Patient, Médecin, Admin.
- Backend serverless avec Firebase: Authentication et Firestore.

## Prérequis
- Node.js et npm installés.
- Compte Firebase (projet, Firestore en mode production).
- Expo CLI installé globalement (optionnel).
- Configuration Firebase dans `services/firebase.js`.

## Architecture Frontend
- Routage par espaces de rôle avec Expo Router:
  - `app/(patient)/*` — écrans patient
  - `app/(doctor)/*` — écrans médecin
  - `app/(admin)/*` — écrans admin
- Composants UI partagés:
  - `components/Card.js`, `components/Badge.js`, `components/Button.js`
- Thème:
  - `theme/colors.js`, `theme/ThemeProvider.js`
- Hooks utilitaires:
  - `hooks/useAuth.js`, `hooks/useRole.js`, `hooks/useUserDoc.js`, `hooks/usePaginatedQuery.js`
- Services:
  - `services/firebase.js` initialise Firebase et expose `auth`, `db`.

## Écrans Principaux (par rôle)
- Patient:
  - Recherche médecin: `app/(patient)/searchDoctors.js`
  - Détails médecin et prise de rendez-vous: `app/(patient)/doctorDetails.js`
  - Mes rendez-vous: `app/(patient)/myAppointments.js`
  - Dossier médical, prescriptions, notifications: `app/(patient)/medical.js`, `app/(patient)/prescriptions.js`, `app/(patient)/notifications.js`
- Médecin:
  - Mes rendez-vous (actions confirmer/annuler): `app/(doctor)/appointments.js`
  - Disponibilités: `app/(doctor)/availability.js`
  - Patients, dossiers, prescriptions, notifications: `app/(doctor)/patients.js`, `app/(doctor)/medicalRecords.js`, `app/(doctor)/prescriptions.js`, `app/(doctor)/notifications.js`
- Admin:
  - Gestion utilisateurs, médecins, patients, rendez-vous: `app/(admin)/users.js`, `app/(admin)/doctors.js`, `app/(admin)/patients.js`, `app/(admin)/appointments.js`

## Modèle de Données Firestore
- `users`:
  - `uid`, `name`, `email`, `role` (patient|doctor|admin), informations de profil.
- `doctors`:
  - `id`, `name`, `clinicName`, `specialties[]`, `phone`, `status`, `availability[{ day, slots[] }]`.
- `appointments`:
  - `id` = `slotKey` (`doctorId_date_time`) pour unicité du créneau.
  - `doctorId`, `patientId`, `doctorName`, `clinicName`, `patientName`.
  - `scheduledAt` (Timestamp), `status` (`pending|confirmed|cancelled|completed`).
  - `reason`, `notes`, `slotKey`, `createdAt`.
- Collections complémentaires (selon implémentation écran):
  - `prescriptions`, `medicalRecords`, `notifications` (référencées par `patientId`/`doctorId`).

## Sécurité et Règles
- Accès restreint par authentification Firebase et rôle.
- Patients:
  - Peuvent créer/voir/annuler leurs `appointments`.
- Médecins:
  - Peuvent voir/mettre à jour (confirmer/annuler) les `appointments` dont ils sont `doctorId`.
- Admin:
  - Droits élargis de supervision et gestion.
- Unicité des créneaux:
  - Utilisation de `slotKey` comme identifiant du document `appointments` permet d’empêcher les doubles réservations en concurrence.

## Flux Fonctionnels
- Prise de rendez-vous (Patient):
  - Sélectionne date/heure depuis les `availability` du médecin.
  - L’UI calcule les créneaux indisponibles en lisant `appointments` pour le médecin et la date (ignore `status = cancelled`).
  - Réservation atomique via transaction:
    - Lire `appointments/{slotKey}`; si existe avec `status` différent de `cancelled`, refuser.
    - Sinon, écrire le document avec `status = pending`.
- Actions Médecin:
  - Confirmer: `status = confirmed`.
  - Annuler: `status = cancelled`.
- Annulation Patient:
  - Met à jour `status = cancelled`.
- Auto-completion des rendez-vous passés:
  - Au chargement des listes patient/médecin, les rendez-vous passés non `cancelled`/`completed` sont mis à `completed`.

## Disponibilités des Médecins
- `doctors.availability` contient des objets `{ day, slots[] }`.
- L’UI du patient filtre les slots indisponibles en croisant `availability` et les documents `appointments` non annulés pour la date concernée.

## Configuration Firebase
- Fichier `services/firebase.js`:
  - Initialise `firebase`, exporte `auth`, `db`.
- Fichier `firestore.rules`:
  - Définit règles d’accès pour `users`, `doctors`, `appointments` et autres collections.
- Fichier `firestore.indexes.json`:
  - Index Firestore optionnels (si requêtes composites).

## Déploiement Local
- Démarrer l’application mobile:
  - `npm start` puis choisir la plateforme (Android/iOS).
- Option web (facultative):
  - Installer `react-native-web` si utilisé, puis `npm run web`.
- Variables de configuration:
  - Clés Firebase dans `firebase.js` (ne pas exposer publiquement).

## Tests et Validation
- Validation manuelle des flux:
  - Réservation sur un créneau, tentative de double réservation, confirmation/annulation, auto-completion des rendez-vous passés.
- Lint/Typecheck:
  - Utiliser les commandes du projet si disponibles (non définies par défaut).

## Évolutions Possibles
- Notifications push pour confirmations/annulations.
- Gestion avancée des disponibilités (créneaux paramétriques, congés).
- Ajout de filtres et recherche avancée côté patient.
- Historisation détaillée et audit des changements de statut.

