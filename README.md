
# 🏥 MyClinic

MyClinic est une application web de gestion de clinique conçue pour faciliter l'administration médicale et améliorer le suivi des patients. Elle permet aux médecins, secrétaires et administrateurs de gérer efficacement les rendez-vous, les dossiers patients et les consultations.

## 📖 Présentation

La digitalisation du secteur de la santé est devenue essentielle pour optimiser la gestion des établissements médicaux. MyClinic répond à ce besoin en proposant une plateforme centralisée permettant de :

- Gérer les informations des patients.
- Organiser les rendez-vous médicaux.
- Suivre les consultations et traitements.
- Faciliter l'accès aux données médicales.
- Réduire les tâches administratives répétitives.

---

## ✨ Fonctionnalités

### 👤 Gestion des patients
- Création d'un dossier patient.
- Modification et suppression des informations.
- Recherche rapide des patients.
- Consultation de l'historique médical.

### 👨‍⚕️ Gestion des médecins
- Enregistrement des médecins.
- Gestion des spécialités.
- Consultation du planning.

### 📅 Gestion des rendez-vous
- Prise de rendez-vous.
- Modification ou annulation.
- Visualisation des rendez-vous planifiés.
- Gestion des disponibilités.

### 🩺 Gestion des consultations
- Enregistrement des consultations.
- Suivi des diagnostics.
- Historique des visites médicales.

### 🔒 Authentification
- Connexion sécurisée des utilisateurs.
- Gestion des rôles et permissions.
- Protection des données sensibles.

---

## 🛠 Technologies utilisées

### Backend
- ASP.NET
- C#
- Entity Framework

### Frontend
- HTML5
- CSS3
- Bootstrap
- JavaScript

### Base de données
- SQL Server

### Outils de développement
- Visual Studio
- Git
- GitHub

---

## 📂 Architecture du projet

```text
MyClinic/
│
├── Controllers/
│   ├── PatientController
│   ├── DoctorController
│   └── AppointmentController
│
├── Models/
│   ├── Patient
│   ├── Doctor
│   └── Appointment
│
├── Views/
│
├── Services/
│
├── Data/
│
├── wwwroot/
│
├── appsettings.json
│
└── README.md
```

---

## ⚙️ Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/Malaak50/project_MyClinic.git
cd project_MyClinic
```

### 2. Ouvrir la solution

Ouvrir le projet avec **Visual Studio**.

### 3. Configurer la base de données

Modifier la chaîne de connexion dans :

```json
appsettings.json
```

Exemple :

```json
"ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=MyClinicDB;Trusted_Connection=True;"
}
```

### 4. Appliquer les migrations

```bash
Update-Database
```

### 5. Lancer l'application

```bash
dotnet run
```

---

## 🎯 Objectifs du projet

- Mettre en pratique le développement d'applications web ASP.NET.
- Concevoir une architecture MVC robuste.
- Gérer les opérations CRUD.
- Intégrer une base de données relationnelle.
- Appliquer les bonnes pratiques de développement logiciel.

---

## 🚀 Améliorations futures

- Notifications automatiques de rendez-vous.
- Génération d'ordonnances PDF.
- Tableau de bord statistique.
- Gestion des paiements.
- API REST.
- Déploiement Cloud.

---

## 📸 Captures d'écran

Ajouter ici des captures de :

- Page de connexion
- Tableau de bord
- Gestion des patients
- Gestion des rendez-vous
- Gestion des consultations

---
