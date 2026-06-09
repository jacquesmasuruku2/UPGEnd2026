# Monorepo Upgoma Website

Structure monorepo organisée pour le projet Upgoma, utilisant npm workspaces.

## Structure

```
upgoma-website/
├── apps/                    # Applications principales
│   ├── site/               # Frontend (Vite + React)
│   ├── server/             # Backend API (Node.js/Express)
│   └── systems/            # Modules institutionnels (gestion académique)
├── packages/               # Packages partagés
│   ├── ui/                # Composants UI réutilisables
│   └── config/            # Configuration partagée
├── scripts/               # Scripts utilitaires
├── supabase/             # Configuration Supabase
├── cloudflare/           # Configuration Cloudflare
└── deploy/               # Configuration déploiement
```

## Installation

1. Cloner le repository:
```bash
git clone <repository-url>
cd upgoma-website-main
```

2. Installer les dépendances (npm installe automatiquement tous les workspaces):
```bash
npm install
```

## Commandes disponibles

### Développement
```bash
# Lancer tous les workspaces en dev
npm run dev

# Lancer uniquement une application
npm run dev:site     # Frontend
npm run dev:server   # Backend
npm run dev:systems  # Modules institutionnels
```

### Build
```bash
# Builder tous les workspaces
npm run build

# Builder une application spécifique
npm run build:site
npm run build:server
npm run build:systems
```

### Linting
```bash
# Lint tous les workspaces
npm run lint
```

### Tests
```bash
# Exécuter les tests
npm run test

# Mode watch
npm run test:watch
```

## Navigation entre les applications

```bash
# Naviguer vers le frontend
cd apps/site

# Naviguer vers le backend
cd apps/server

# Naviguer vers les modules académiques
cd apps/systems

# Naviguer vers les composants UI
cd packages/ui

# Naviguer vers la configuration partagée
cd packages/config
```

## Structure de chaque workspace

### apps/site
- **Frontend web principal**
- Vite + React + TypeScript
- Shadcn/ui + Tailwind CSS
- Scripts disponibles: `dev`, `build`, `lint`, `test`, `preview`

### apps/server
- **Backend API**
- Express.js + Node.js
- Scripts disponibles: `dev`, `lint`, `test`

### apps/systems
- **Modules de gestion académique**
- Vite + React + TypeScript
- Même stack que le site
- Scripts disponibles: `dev`, `build`, `lint`, `test`, `preview`

### packages/ui
- **Composants UI partagés**
- Basé sur Radix UI et Tailwind CSS
- Utilisé par `@upgoma/site` et `@upgoma/systems`

### packages/config
- **Configuration partagée**
- ESLint, TypeScript, etc.
- Utile pour maintenir une cohérence entre tous les workspaces

## Dépendances internes

- `@upgoma/site` dépend de `@upgoma/ui` et `@upgoma/config`
- `@upgoma/server` dépend de `@upgoma/config`
- `@upgoma/systems` dépend de `@upgoma/ui` et `@upgoma/config`
- `@upgoma/ui` dépend de `@upgoma/config`

## Exécution de commandes dans un workspace spécifique

```bash
# Exécuter un script dans un workspace spécifique
npm --workspace=@upgoma/site run dev
npm --workspace=@upgoma/server run lint
npm --workspace=@upgoma/systems run build

# Ou utiliser -w pour raccourcir
npm -w @upgoma/site run dev
npm -w @upgoma/server run dev
```

## Installation de dépendances

### Ajouter une dépendance à un workspace
```bash
# Dans apps/site
npm install express --workspace=@upgoma/site

# Dans un package
npm install react --workspace=@upgoma/ui
```

### Ajouter une dépendance de développement
```bash
npm install --save-dev typescript --workspace=@upgoma/site
```

## Notes

- Chaque workspace a ses propres `package.json` et `node_modules`
- Les dépendances communes sont dédupliquées au niveau de la racine
- Utilisez les chemins `packages/*` et `apps/*` dans les imports, npm va résoudre automatiquement vers les packages locaux

## Support

Pour des questions ou des problèmes, consulter la documentation de chaque package ou communiquer avec l'équipe.
