# MyClinic - Documentation Technique et Résolution de Problèmes

Ce document fournit des solutions aux problèmes courants rencontrés et des instructions pour la configuration correcte de l'application MyClinic.

## 1. Configuration de la Base de Données (Firestore)

### Règles de Sécurité (Security Rules)
Pour résoudre les erreurs "Missing or insufficient permissions", copiez et collez les règles suivantes dans votre console Firebase (Firestore Database > Règles) :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Fonctions utilitaires
    function isAuthenticated() {
      return request.auth != null;
    }
    function hasRole(role) {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }

    // Utilisateurs
    match /users/{userId} {
      allow read, write: if isAuthenticated() && (request.auth.uid == userId || hasRole('admin'));
    }

    // Patients
    match /patients/{patientId} {
      allow read: if isAuthenticated() && (request.auth.uid == patientId || hasRole('doctor') || hasRole('admin'));
      allow write: if isAuthenticated() && (request.auth.uid == patientId || hasRole('admin'));
    }

    // Médecins
    match /doctors/{doctorId} {
      allow read: if true;
      allow write: if isAuthenticated() && (hasRole('admin') || request.auth.uid == doctorId);
    }

    // Rendez-vous
    match /appointments/{appointmentId} {
      allow read, update: if isAuthenticated() && (
        resource.data.patientId == request.auth.uid || 
        resource.data.doctorId == request.auth.uid || 
        hasRole('admin')
      );
      allow create: if isAuthenticated();
    }

    // Dossiers Médicaux et Prescriptions
    match /medical_records/{recordId} {
      allow read: if isAuthenticated() && (resource.data.patientId == request.auth.uid || hasRole('doctor') || hasRole('admin'));
      allow write: if isAuthenticated() && (hasRole('doctor') || hasRole('admin'));
    }
    match /prescriptions/{prescriptionId} {
      allow read: if isAuthenticated() && (resource.data.patientId == request.auth.uid || hasRole('doctor') || hasRole('admin'));
      allow write: if isAuthenticated() && (hasRole('doctor') || hasRole('admin'));
    }

    // Notifications
    match /notifications/{notificationId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('admin');
    }
  }
}
```

### Index Firestore
Grâce aux informations sur les index existants, j'ai optimisé l'application pour les utiliser :

1.  **Dashboard Patient** : Utilise l'index composite `patientId` + `status` + `scheduledAt`.
    *   La requête filtre désormais sur `status == "confirmed"` et trie par `scheduledAt`.
2.  **Mes Rendez-vous / Rendez-vous Docteur** : 
    *   Utilise un tri côté client (JavaScript) pour éviter les erreurs d'index manquant, tout en garantissant un affichage rapide et trié par date.

**Note :** Le système de prise de rendez-vous enregistre maintenant correctement le champ `scheduledAt` (Timestamp) nécessaire pour ces index.

### 3. Gestion des Index & Requêtes
Pour éviter d'avoir à créer des douzaines d'index composites complexes dans la console Firebase, j'ai optimisé les listes suivantes pour utiliser un **tri côté client** (JavaScript) après avoir récupéré les données filtrées simplement :
- **Admin / Patients** : Liste triée par date d'inscription.
- **Admin / Médecins** : Recherche par Nom et Spécialité ajoutée. Tri client.
- **Notifications** : Tri par date décroissante.
- **Dossiers Médicaux & Prescriptions** : Tri par date décroissante.

Cela corrige les erreurs `The query requires an index` pour ces sections.

### 4. Corrections Diverses
- **Route manquante "book"** : Suppression du lien mort dans le menu latéral.
- **Profil Docteur** : Affichage correct du Nom, Téléphone, Spécialité et Clinique.
- **Admin / Médecins** : Affichage du Nom et Téléphone dans la liste.

## 2. Problèmes Résolus

### Notifications Admin non affichées
- **Problème :** Les notifications créées par l'admin n'apparaissaient pas chez les patients/médecins.
- **Solution :** J'ai mis à jour les pages de notification pour récupérer correctement les messages ciblés ("all", "patients", "doctors").

### Liste des Patients vide (Admin)
- **Problème :** L'admin ne voyait pas les patients.
- **Solution :** La requête cherchait dans la collection `patients` (profils médicaux) au lieu de `users` (comptes utilisateurs avec rôle 'patient'). J'ai corrigé la requête pour cibler `users` et filtrer par rôle.

### Erreur "Network request failed" / Persistance Auth
- **Problème :** Crash au démarrage ou déconnexion inattendue.
- **Solution :** 
    1. La persistance de l'authentification est correctement configurée avec `AsyncStorage`.
    2. J'ai ajouté une gestion d'erreur robuste : si le backend est inaccessible, l'application bascule automatiquement en mode "Firestore direct" sans planter.

## 3. Bonnes Pratiques pour le Développement Futur

1. **Toujours utiliser `usePaginatedQuery`** pour les listes de données afin de gérer efficacement le chargement.
2. **Éviter les index complexes** : Si possible, triez les données côté client (dans l'application) après les avoir récupérées, surtout pour les petites listes (< 100 éléments), plutôt que d'exiger des index Firestore complexes.
3. **Gestion des erreurs** : Toujours envelopper les appels réseau (fetch/firestore) dans des blocs `try/catch` pour afficher des messages conviviaux à l'utilisateur au lieu de planter.

Pour toute autre question ou erreur, consultez les logs dans votre terminal Metro Bundler.
