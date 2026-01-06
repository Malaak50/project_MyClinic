# Backend Node.js/Express

## Installation
Dans `backend/`:
```
npm install
```

## Variables d'environnement
- `PORT=3000`
- `FIREBASE_PROJECT_ID=<votre_projectId>`
- `GOOGLE_APPLICATION_CREDENTIALS=<chemin/vers/service-account.json>`

## Démarrage
```
npm run start
```
Le serveur écoute sur `http://localhost:3000`.

## Endpoints clés
- `POST /auth/verify` : vérifie le token et renvoie le rôle
- `POST /auth/assign-role` : admin attribue un rôle `{ uid, role }`
- Routes par rôle:
  - `/admin/*` (admin)
  - `/doctor/*` (doctor)
  - `/patient/*` (patient)

