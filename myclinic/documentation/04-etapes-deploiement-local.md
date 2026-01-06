# Étapes de Déploiement Local

## 1. Préparer les variables
- Frontend (Expo): définir `EXPO_PUBLIC_*` et `EXPO_PUBLIC_API_URL=http://localhost:3000`
- Backend (Node): définir `PORT`, `FIREBASE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS`

## 2. Installer et démarrer
```
cd backend
npm install
npm run start
```
Dans un autre terminal:
```
cd myclinic
npm install
npm run start
```

## 3. Créer un compte et attribuer un rôle
- S’inscrire via l’écran Register
- Récupérer `uid` (via Firebase Console)
- Appeler `POST /auth/assign-role` avec un token Admin

## 4. Vérifier la navigation par rôle
- Se connecter, l’app redirige vers Admin/Doctor/Patient automatiquement

