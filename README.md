# 💊 Scan-Care

Application mobile intelligente pour la gestion des prescriptions médicales et des rappels de médicaments.

## 📱 Description

Scan-Care est une application mobile développée avec React Native et Expo qui permet aux utilisateurs de :

- Scanner des ordonnances médicales
- Extraire automatiquement les informations grâce à l'IA (Mistral)
- Gérer des rappels de prise de médicaments
- Visualiser l'historique des prescriptions
- Suivre leur traitement médical

## 🏗️ Structure du Projet

```
scan-care/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── screens/
│   │   └── services/
```

## 🚀 Technologies Utilisées

### Frontend

- **React Native**
- **Expo**
- **TypeScript**
- **React Navigation**
- **Firebase**

### IA

- **Mistral AI**

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Expo CLI
- Un compte Firebase configuré
- Un compte Mistral AI (pour l'API)

## 🛠️ Installation

### 1. Cloner le repository

```bash
git clone https://github.com/armanceau/scan-care.git
cd scan-care
```

### 2. Installer les dépendances du frontend

```bash
cd frontend
npm install
```

### 3. Configuration

Créer un fichier `.env` avec les variables présentes dans le ficheir `.env.example`, **les vraies valeurs seront disponibles par mail**.

### 4. Lancer l'application

```bash
# Démarrer le serveur de développement
cd frontend
npm start
```

## 📱 Fonctionnalités

### ✅ Implémentées

- 🔐 Authentification utilisateur
- 📸 Scanner des ordonnances
- 🤖 Extraction automatique des informations
- 📋 Gestion des rappels de médicaments
- Historique des prescriptions

### 🔄 En développement

- Mode sombre
- Support multilingue
- Notifications de rappel
