# Rapport Universitaire — Projet MyClinic

## Résumé
MyClinic est une application mobile de gestion des rendez-vous médicaux développée avec Expo/React Native et Firebase. Elle propose des interfaces distinctes pour les patients, les médecins et les administrateurs, et assure une réservation de créneaux robuste, atomique et sécurisée via Firestore. Le projet s’articule autour d’une architecture front-end modulaire, d’un modèle de données simplifié et d’un ensemble de flux fonctionnels couvrant la recherche de médecins, la prise de rendez-vous, la confirmation/annulation et la mise à jour automatique des statuts.

## Mots-clés
Gestion de rendez-vous, React Native, Expo, Firebase, Firestore, Authentification, Sécurité, Architecture logicielle, Conception UML.

## Introduction
La digitalisation des services de santé nécessite des solutions fiables pour orchestrer les disponibilités, réduire les conflits de planning et offrir une expérience fluide aux utilisateurs. MyClinic répond à ces enjeux en fournissant un système de réservation simple et cohérent, doté d’une sécurité et d’une intégrité des données adaptées aux cas d’usage courants d’une clinique.

## Problématique et Objectifs
- Éviter les doubles réservations pour un même créneau et médecin.
- Assurer un cycle de vie du rendez-vous clair: pending → confirmed/cancelled → completed.
- Permettre aux médecins de gérer efficacement leurs disponibilités et leurs rendez-vous.
- Offrir une vue simple et intuitive aux patients pour chercher et réserver.
- Garantir la sécurité des accès via des règles Firestore et une authentification fiable.

## Périmètre et Parties Prenantes
- Patients: recherche de médecins, prise et annulation de rendez-vous, consultation des informations médicales.
- Médecins: gestion des disponibilités, visualisation et action sur les rendez-vous, gestion des patients et dossiers.
- Administrateurs: supervision des entités (utilisateurs, médecins, patients) et des rendez-vous.

## Technologies et Outils
- Frontend: Expo/React Native, Expo Router pour organiser l’application par rôles.
- Backend: Firebase Authentication et Firestore (NoSQL).
- UI/UX: composants réutilisables (Card, Badge, Button), thème centralisé.
- Conception: PlantUML pour les diagrammes de classes, cas d’utilisation, séquence et activité.

## Architecture du Système
- Organisation par espaces de rôle:
  - `app/(patient)`: écrans destinés aux patients (recherche, réservation, suivi).
  - `app/(doctor)`: écrans destinés aux médecins (rendez-vous, disponibilités, patients).
  - `app/(admin)`: écrans d’administration (utilisateurs, entités, rendez-vous).
- Services:
  - `services/firebase.js`: initialisation Firebase, exposition de `auth` et `db`.
- Composants et Thème:
  - UI partagée (`components/*`) et palette (`theme/colors.js`) pour cohérence visuelle.
- Hooks:
  - `useAuth`, `useRole`, `useUserDoc`, `usePaginatedQuery` pour encapsuler la logique commune.

## Modèle de Données (Firestore)
- `users`: `uid`, `name`, `email`, `role` (patient|doctor|admin), méta‐données de profil.
- `doctors`: `id`, `name`, `clinicName`, `specialties[]`, `phone`, `status`, `availability[{ day, slots[] }]`.
- `appointments`:
  - `id` = `slotKey` (`doctorId_date_time`) pour imposer l’unicité par créneau.
  - `doctorId`, `patientId`, `doctorName`, `clinicName`, `patientName`.
  - `scheduledAt` (Timestamp), `status` (`pending|confirmed|cancelled|completed`), `reason`, `notes`, `createdAt`.
- Collections complémentaires: `prescriptions`, `medicalRecords`, `notifications`.

## Conception (UML)
- Diagrammes PlantUML centralisés dans `documentation/plantuml_diagrams.puml`:
  - Classes: relations entre User/Doctor/Patient et Appointment/Prescription/MedicalRecord/Availability.
  - Cas d’utilisation: Patient, Doctor, Admin et leurs actions principales.
  - Séquence: prise de rendez-vous atomique et confirmation médecin.
  - Activité: cycle de vie d’un rendez-vous et transitions de statut.

## Implémentation des Flux Clés
- Recherche et Détails Médecin:
  - Le patient sélectionne une date et visualise les créneaux disponibles. Les créneaux indisponibles sont déduits des `appointments` non annulés pour la date et le médecin choisis.
- Réservation Atomique:
  - La création de rendez-vous utilise `slotKey` comme identifiant de document dans `appointments`.
  - Une transaction lit `appointments/{slotKey}` et refuse l’écriture si un rendez-vous actif existe; sinon écrit un rendez-vous `pending`.
- Actions Médecin:
  - Confirmation: mise à jour du statut en `confirmed`.
  - Annulation: mise à jour en `cancelled` (le créneau redevient réservable).
- Annulation Patient:
  - Mise à jour en `cancelled`, cohérente avec la logique médecin.
- Auto‐completion:
  - Au chargement des listes, les rendez-vous passés non `cancelled`/`completed` sont convertis en `completed` pour assainir le backlog.

## Sécurité et Confidentialité
- Authentification Firebase: contrôle d’accès et identification des rôles.
- Règles Firestore:
  - Lecture/écriture limitées aux acteurs concernés (patient/doctor/admin).
  - Imposition de l’unicité des créneaux via `slotKey` et logique transactionnelle.
- Bonnes pratiques:
  - Pas de stockage de secrets côté client, utilisation des SDK officiels.
  - Réduction des lectures sur des collections sensibles (préférence aux données dénormalisées dans `appointments`).

## Méthodologie de Développement
- Itérative et incrémentale:
  - Mise en place du socle (routage, thème, services), puis ajout progressif des flux métier.
- Revue et refactor:
  - Nettoyage des doublons UI (ex. blocs JSX redondants), consolidation des actions.
- Conception orientée usage:
  - Focalisation sur les parcours Patient/Médecin et robustesse de la réservation.

## Tests et Validation
- Tests manuels:
  - Vérifier la non double réservation, l’annulation et la confirmation, l’auto‐completion des rendez-vous passés.
- Validation fonctionnelle:
  - Parcours Patient/Médecin/Admin exécutés sur émulateurs ou appareils.
- Lint/Typecheck:
  - À activer selon les scripts du projet (non forcés par défaut).

## Déploiement et Exécution
- Démarrage:
  - `npm start` pour lancer Expo (app mobile).
  - Option web: installer `react-native-web` puis `npm run web` si nécessaire.
- Configuration Firebase:
  - Mettre à jour les clés dans `services/firebase.js` (ne pas exposer publiquement).
- Règles de sécurité:
  - Ajuster `firestore.rules` selon les besoins précis d’accès et d’audit.

## Résultats
- Élimination des doubles réservations grâce à l’ID de rendez‐vous basé sur `slotKey` et la transaction.
- Expérience cohérente pour le médecin (actions rapides sur pending).
- Mise à jour automatique des états pour clarifier l’historique des rendez-vous.

## Limites et Risques
- Concurrence à grande échelle:
  - Transactions Firestore adaptées, mais des cas extrêmes peuvent nécessiter des files d’attente ou verrous supplémentaires côté backend dédié.
- Index Firestore:
  - Certaines requêtes composites peuvent demander des index spécifiques.
- Confidentialité renforcée:
  - Selon les réglementations locales (ex. RGPD), étendre chiffrement et journalisation.

## Perspectives
- Notifications push (confirmation, rappel).
- Gestion avancée des absences/congés médecins.
- Intégration d’un agenda iCal et synchronisation externe.
- Tableau de bord analytics (taux de confirmation, annulations, temps d’attente).

## Conclusion
MyClinic démontre une architecture mobile moderne, portée par une conception claire et des flux robustes. L’usage d’Expo/React Native couplé à Firebase permet une livraison rapide et une maintenance simplifiée, tout en respectant les contraintes d’un système de réservation critique.

## Références
- Documentation React Native et Expo.
- Documentation Firebase (Auth, Firestore, règles de sécurité).
- Bonnes pratiques d’architecture front‐end et conception UML.

## Annexes
- Dossiers clés:
  - `app/` (écrans par rôle), `components/`, `theme/`, `hooks/`, `services/`.
  - `documentation/Documentation_Fonctionnelle_Technique.md`, `documentation/plantuml_diagrams.puml`.
- Commandes utiles:
  - `npm start`, `npm run android`, `npm run ios`, optionnellement `npm run web`.
