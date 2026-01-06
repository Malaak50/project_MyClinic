# Frontend React Native (Expo 54)

## Installation des packages
Dans `myclinic/`:
```
npm install
```
Les dépendances incluent:
- expo, expo-router
- react, react-native
- firebase

## Démarrage
```
npm run start
```
Ouvrir sur Expo Go ou web.

## Configuration
- Mettre le logo `logo.png` dans `myclinic/assets/logo.png`
- Définir les variables `EXPO_PUBLIC_*` dans l'environnement (voir 03-firebase-setup)
- La navigation par rôles est gérée via `app/index.js`, `useAuth`, `useRole`.

## Structure
- `app/(auth)` pour login/register
- `app/(admin)`, `app/(doctor)`, `app/(patient)` pour les espaces par rôle
- `services/firebase.js` pour SDK Firebase
- `hooks/` pour l'état Auth et rôle
- `theme/` pour les couleurs et ThemeProvider

