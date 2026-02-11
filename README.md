# 🎀 La Mina à La Pate — Site Web

Pâtisserie artisanale — Site vitrine + système de demande de devis.

## Architecture

```
la-mina-a-la-pate/
├── backend/          → API Node.js + Express + PostgreSQL (NeonDB)
└── frontend/         → Next.js 15 (App Router)
```

---

## 🚀 Installation pas à pas

### Prérequis
- **Node.js** v18+ installé → https://nodejs.org
- Un compte **NeonDB** → https://neon.tech (gratuit)

---

### ÉTAPE 1 — Créer la base de données NeonDB

1. Va sur https://console.neon.tech
2. Clique **"New Project"**
3. Nom du projet : `lamina` (ou ce que tu veux)
4. Région : **EU (Frankfurt)** (plus proche de la France)
5. Clique **"Create Project"**
6. Sur la page du projet, copie la **Connection String** qui ressemble à :
   ```
   postgresql://username:password@ep-xxxxx-xxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

---

### ÉTAPE 2 — Configurer le Backend

```bash
cd backend

# 1. Installer les dépendances
npm install

# 2. Créer le fichier .env
cp .env.example .env
```

Ouvre le fichier `backend/.env` et colle ta connection string NeonDB :
```
DATABASE_URL=postgresql://username:password@ep-xxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
PORT=5000
```

```bash
# 3. Initialiser la base de données (crée les tables + données initiales)
npm run db:init

# 4. Lancer le serveur API
npm run dev
```

Tu devrais voir :
```
🎀 La Mina API running on http://localhost:5000
```

Teste dans ton navigateur : http://localhost:5000/api/settings

---

### ÉTAPE 3 — Configurer le Frontend

Ouvre un **nouveau terminal** :

```bash
cd frontend

# 1. Installer les dépendances
npm install

# 2. Créer le fichier .env.local
cp .env.local.example .env.local
```

Le fichier `.env.local` contient déjà la bonne URL par défaut :
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
# 3. Lancer le serveur Next.js
npm run dev
```

Tu devrais voir :
```
▲ Next.js 15.x
- Local:    http://localhost:3000
```

Ouvre http://localhost:3000 🎉

---

## 📦 API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/settings` | Paramètres du site (logo, à propos, contact) |
| GET | `/api/creations?limit=7` | Liste des créations (optionnel: limit) |
| GET | `/api/creations/:id` | Détail d'une création |
| GET | `/api/services` | Liste des services |
| POST | `/api/contact` | Envoyer une demande de devis |
| GET | `/api/contact` | Lister les demandes (futur admin) |

---

## 📁 Structure de la base de données

- **site_settings** : clé/valeur pour logo, texte "à propos", localisation, email, téléphone
- **creations** : titre, description, type d'événement, image principale
- **creation_images** : images supplémentaires par création
- **services** : titre + description de chaque service
- **contact_requests** : demandes de devis des clients

---

## 🖼️ Images des créations

Pour le moment, les créations utilisent des dégradés de couleur comme placeholder.
Pour ajouter de vraies images :

1. Crée un dossier `backend/uploads/creations/`
2. Place tes images dedans (ex: `wedding-cake-romantique.jpg`)
3. Les URLs stockées en base (`/uploads/creations/xxx.jpg`) seront servies automatiquement par le backend

---

## Prochaine étape

→ Application admin pour gérer le contenu (CRUD sur créations, services, paramètres)
