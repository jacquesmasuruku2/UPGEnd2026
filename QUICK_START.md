# Guide de Démarrage Rapide - Monorepo Upgoma

Bienvenue! 👋 Ce guide vous aidera à démarrer rapidement avec le monorepo Upgoma.

## 🚀 Démarrage rapide (5 minutes)

### 1️⃣ Installation initiale
```bash
# Clone le projet
git clone <repository-url>
cd upgoma-website-main

# Installe toutes les dépendances
npm install
```

### 2️⃣ Lancer l'application en développement

**Option A: Tous les services**
```bash
npm run dev
```

**Option B: Services individuels** (ouvrir 3 terminaux)
```bash
# Terminal 1 - Frontend
cd apps/site && npm run dev

# Terminal 2 - Backend
cd apps/server && npm run dev

# Terminal 3 - Modules académiques
cd apps/systems && npm run dev
```

### 3️⃣ Naviguer dans le projet
```bash
# Frontend
cd apps/site

# Backend
cd apps/server

# Modules académiques
cd apps/systems

# Composants partagés
cd packages/ui

# Configuration partagée
cd packages/config
```

## 📁 Structure du monorepo

```
upgoma-website-main/
├── apps/
│   ├── site/           ← Frontend Vite + React
│   ├── server/         ← Backend Node.js/Express
│   └── systems/        ← Modules académiques
├── packages/
│   ├── ui/             ← Composants réutilisables
│   └── config/         ← Configuration commune
├── scripts/            ← Scripts utilitaires
└── docs/               ← Documentation
```

## 🛠️ Commandes principales

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre tous les services |
| `npm run dev:site` | Démarre le frontend |
| `npm run dev:server` | Démarre le backend |
| `npm run dev:systems` | Démarre les modules académiques |
| `npm run build` | Build tous les workspaces |
| `npm run lint` | Lint tous les fichiers |
| `npm run test` | Lance les tests |

## 💡 Conseils utiles

### ✨ Pour ajouter une dépendance
```bash
# Ajouter à une application spécifique
npm install lodash --workspace=@upgoma/site

# Ajouter à un package partagé
npm install react-hook-form --workspace=@upgoma/ui
```

### 🔗 Utiliser les packages internes
```typescript
// Dans apps/site ou apps/systems
import { Button } from '@upgoma/ui';
import { config } from '@upgoma/config';
```

### 📝 Ouvrir le projet comme workspace
```bash
# VSCode va automatically charger le fichier .code-workspace
code upgoma-website.code-workspace
```

## 🐛 Dépannage

### La modification dans packages/ui ne s'affiche pas?
1. Redémarrez le serveur Vite
2. Si ça persiste: `npm install`

### Erreur "workspace not found"?
- Vérifier que les `package.json` existent
- Vérifier les noms dans `"name"` (doivent avoir le prefix `@upgoma/`)
- Relancer `npm install`

### Besoin de nettoyer?
```bash
# Supprimer tous les node_modules
rm -rf node_modules
# Réinstaller
npm install
```

## 📚 Documentation complète

- [MONOREPO.md](./MONOREPO.md) - Vue d'ensemble complète du monorepo
- [docs/MONOREPO_SETUP.md](./docs/MONOREPO_SETUP.md) - Configuration détaillée et workflow

## 🤝 Besoin d'aide?

1. Consultez la documentation mentionnée ci-dessus
2. Vérifiez les logs d'erreur en terminal
3. Consultez votre équipe ou les issues GitHub

## ✅ Vérifier que tout fonctionne

```bash
# Exécutez ces commandes pour vérifier l'installation
npm -v              # Vérifier npm
node -v             # Vérifier Node.js
npm ls              # Afficher l'arborescence des dépendances
npm run build       # Compiler tous les workspaces
npm run lint        # Vérifier le linting
npm run test        # Exécuter les tests
```

---

Vous êtes prêt! 🎉 Commencez à développer: `npm run dev`
