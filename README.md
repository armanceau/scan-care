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
├── src/
│   ├── components/
│   ├── navigation/
│   ├── screens/
│   └── services/
├── assets/
├── App.tsx
├── app.json
├── package.json
└── README.md
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

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Créer un fichier `.env` avec les variables présentes dans le fichier `.env.example`, **les vraies valeurs seront disponibles par mail**.

### 4. Lancer l'application

```bash
# Démarrer le serveur de développement
npm start
```

## 🔔 Système de Notifications

L'application intègre un système complet de notifications push qui envoie des rappels automatiques pour chaque médicament :

- **Parsing intelligent** : Analyse automatique de la fréquence ("1 matin, 1 après-midi", "3 fois par jour", etc.)
- **Horaires prédéfinis** : Matin (8h), Midi (12h), Après-midi (15h), Soir (19h), Nuit (22h)
- **Notifications quotidiennes** : Répétition automatique chaque jour
- **Personnalisées par médicament** : Chaque notification indique le nom et le dosage du médicament

**Activation :**

1. Lors de la sauvegarde d'une nouvelle ordonnance (automatique)
2. Depuis la liste des rappels avec le bouton "🔔 Rappels"

## 📱 Fonctionnalités

### ✅ Implémentées

- 🔐 Authentification utilisateur (Firebase)
- 📸 Scanner des ordonnances avec la caméra
- 🤖 Extraction automatique des informations (Mistral AI)
- 📋 Gestion et édition des rappels de médicaments
- 📜 Historique des prescriptions
- 🔔 **Notifications push intelligentes** : Rappels automatiques pour chaque médicament selon la fréquence prescrite (matin, midi, soir, etc.)

### 🔄 En développement

- Mode sombre
- Support multilingue
- Historique des prises de médicaments
- Statistiques d'observance
