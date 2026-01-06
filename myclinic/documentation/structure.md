### . Dashboard Admin (Vue Globale)
- Fichier : index.js
- Fonctionnalités :
  - Statistiques en temps réel : Total Utilisateurs, Patients, Médecins (Actifs/Inactifs).
  - État des Rendez-vous : En attente, Confirmés, Annulés.
  - Utilise getCountFromServer pour des performances optimales (coût réduit).
### 2. Création de Doctor par l'Admin
- Fichier : doctors.js
- Solution technique : Utilisation d'une instance secondaire Firebase Auth ( secondaryApp ).
- Avantage : L'admin peut créer un compte médecin (Email + Mot de passe + Profil Firestore) sans se déconnecter de sa propre session.
- Données créées :
  - Auth User (Email/Password).
  - Firestore users/{uid} (rôle 'doctor').
  - Firestore doctors/{uid} (Détails, Clinique, Spécialités, Statut).
### 3. Disponibilités Médecin (Strictes)
- Fichier : availability.js
- Créneaux configurés :
  - Lun–Ven : 09h00 – 11h30 et 14h00 – 17h30 (Pause déjeuner 12h-14h respectée).
  - Samedi : 09h00 – 12h30 (Fin à 13h).
- L'interface s'adapte automatiquement selon le jour sélectionné.
### 4. Gestion des Utilisateurs (Activation/Désactivation)
- Fichier : users.js
- Ajout d'un bouton Activer / Désactiver pour chaque utilisateur.
- Met à jour le champ status dans Firestore ( users et doctors si applicable).
📂 DRAWER – ADMIN
txt
Copier le code
Drawer (Admin)
├── Dashboard
├── Doctors
├── Patients
├── Users
├── Appointments
├── Notifications
├── Profile
└── Logout
🧭 Dashboard
Contenu

Statistiques globales

total users

doctors actifs / inactifs

patients

rendez-vous par statut

Accès rapide (cards)

🩺 Doctors
Contenu

Liste des doctors

nom

email

spécialités

clinique

statut

Bouton Créer Doctor

Actions :

activer / désactiver

voir détails

👤 Patients
Contenu

Liste patients

nom

téléphone

assurance

Voir détails (lecture seule)

👥 Users
Contenu

Tous les comptes

email

rôle

statut

Activer / désactiver

❌ pas de modification de rôle

📅 Appointments
Contenu

Liste complète

Filtres :

date

doctor

patient

statut

Actions :

confirmer

annuler

🔔 Notifications
Contenu

Créer notification

Cibler :

tous

doctors

patients

Historique des notifications

👤 Profile
Contenu

Infos admin

Changer mot de passe

Déconnexion

🚪 Logout
Déconnexion Firebase

📂 DRAWER – DOCTOR
txt
Copier le code
Drawer (Doctor)
├── Dashboard
├── Appointments
├── Patients
├── MedicalRecords
├── Prescriptions
├── Availability
├── Notifications
├── Profile
└── Logout
🧭 Dashboard
Contenu

Rendez-vous du jour

Prochains rendez-vous

Statut compte

📅 Appointments
Contenu

Liste des rendez-vous

Actions :

confirmer

annuler

voir détails

👥 Patients
Contenu

Liste patients liés

Allergies

Maladies chroniques

📁 MedicalRecords
Contenu

Liste dossiers patients

Ajouter entrée :

date

type

notes

💊 Prescriptions
Contenu

Liste prescriptions

Créer prescription

Médicaments (nom, dosage, durée)

⏰ Availability
Contenu

Calendrier

Créneaux autorisés :

Lun–Ven : 09h–18h

Sam : 09h–13h

Sauvegarde

🔔 Notifications
Contenu

Notifications reçues

Marquer comme lue

👤 Profile
Contenu

Infos personnelles

Spécialités (lecture seule)

Clinique

🚪 Logout
Déconnexion Firebase

📂 DRAWER – PATIENT
txt
Copier le code
Drawer (Patient)
├── Dashboard
├── FindDoctor
├── MyAppointments
├── MedicalRecords
├── Prescriptions
├── Notifications
├── Profile
└── Logout
🧭 Dashboard
Contenu

Prochain rendez-vous

Médecin assigné

🔍 FindDoctor
Contenu

Recherche par spécialité

Clinique

Disponibilités

📅 MyAppointments
Contenu

Liste rendez-vous

Annuler rendez-vous

📁 MedicalRecords
Contenu

Historique médical (lecture seule)

💊 Prescriptions
Contenu

Ordonnances

Détails médicaments

🔔 Notifications
Contenu

Notifications reçues

👤 Profile
Contenu

Infos personnelles

Assurance

Allergies

Maladies chroniques

🚪 Logout
Déconnexion Firebase

### . Structure de Navigation (Drawers)
J'ai mis à jour les fichiers _layout.js pour respecter strictement vos demandes de menus :

- Admin : Dashboard, Doctors, Patients, Users, Appointments, Notifications, Profile, Logout.
- Doctor : Dashboard, Appointments, Patients, MedicalRecords, Prescriptions, Availability, Notifications, Profile, Logout.
- Patient : Dashboard, FindDoctor, MyAppointments, MedicalRecords, Prescriptions, Notifications, Profile, Logout.
### 2. Tableaux de Bord (Dashboards)
J'ai enrichi les pages d'accueil pour chaque rôle avec les informations pertinentes :

- Admin ( /(admin)/index.js ) :
  - Statistiques globales (Utilisateurs, Médecins, Patients, Rendez-vous).
  - Cartes d'accès rapide vers la gestion des médecins, utilisateurs et notifications.
- Doctor ( /(doctor)/index.js ) :
  - Indicateur de statut du compte (Actif/Inactif).
  - Liste des rendez-vous du jour.
  - Liste des prochains rendez-vous.
- Patient ( /(patient)/index.js ) :
  - Affichage du prochain rendez-vous confirmé.
  - Boutons d'accès rapide pour "Prendre RDV" et voir "Mes RDV".
### 3. Fonctionnalités Clés Implémentées
- Admin Notifications : Interface complète pour créer des notifications ciblées (Tous, Médecins, Patients) et voir l'historique.
- Dossiers Médicaux & Prescriptions :
  - Côté Docteur : CRUD complet (Création, Lecture, Mise à jour, Suppression) avec sélection du patient via un modal.
  - Côté Patient : Vue en lecture seule filtrée uniquement sur leurs propres données.
- Recherche Médecin (Patient) : Filtres par spécialité et clinique, avec lien vers la prise de rendez-vous.
- Détails Rendez-vous :
  - Docteur : Possibilité de confirmer ou annuler un rendez-vous en attente.
  - Patient : Possibilité d'annuler un rendez-vous en attente