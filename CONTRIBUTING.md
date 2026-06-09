# CONTRIBUTING.md - Guide de Contribution au Monorepo

Merci de votre intérêt pour le projet Upgoma! 🙏

## 📋 Prérequis

- Node.js 18+ et npm 9+
- Git configuré avec votre compte
- VSCode (recommandé) avec les extensions listées ci-dessous

## 🔧 Configuration du développeur

### 1. Clone et installation
```bash
git clone <repository-url>
cd upgoma-website-main
npm install
```

### 2. Extensions VSCode recommandées
- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **GitLens** (eamodio.gitlens)

### 3. Ouvrir le workspace
```bash
code upgoma-website.code-workspace
```

## 📁 Structure du projet et contributions

### Pour le **Frontend** (apps/site)
- Utilise Vite + React + TypeScript
- Composants depuis `@upgoma/ui`
- Configuration depuis `@upgoma/config`

### Pour le **Backend** (apps/server)
- Node.js/Express
- Stockage dans Supabase ou PostgreSQL
- API RESTful

### Pour les **Modules académiques** (apps/systems)
- Vite + React + TypeScript
- Gestion académique de l'université
- Réutilise les composants UI

### Pour les **Composants UI** (packages/ui)
- Basés sur Radix UI et Tailwind CSS
- Réutilisables dans le frontend et modules académiques

### Pour la **Configuration** (packages/config)
- ESLint, TypeScript, Prettier
- Configuration commune partagée

## 🎯 Workflow de contribution

### 1. Créer une branche
```bash
git checkout -b feat/nom-de-la-feature
# ou
git checkout -b fix/nom-du-bug
```

### 2. Développer
```bash
# Lancer le service que vous développez
npm run dev:site      # ou dev:server, dev:systems, etc.
```

### 3. Tester et linter
```bash
# À la racine ou dans le workspace spécifique
npm run lint          # Vérifier le code
npm run test          # Lancer les tests
```

### 4. Commit et push
```bash
git add .
git commit -m "feat: description de la change"
git push origin feat/nom-de-la-feature
```

### 5. Créer une Pull Request
- Allez sur le repository GitHub
- Créez une PR avec une description claire
- Attendez la revue

## 📝 Conventions de code

### Nommage
- Composants React: `PascalCase` (ex: `UserProfile.tsx`)
- Fichiers utilitaires: `camelCase` (ex: `formatDate.ts`)
- Constantes: `UPPER_SNAKE_CASE` (ex: `MAX_FILE_SIZE`)

### Commits
```
feat: Ajouter une nouvelle feature
fix: Corriger un bug
docs: Mises à jour de la documentation
style: Changements de style/format
refactor: Refactoriser du code
test: Ajouter ou modifier des tests
chore: Changements de build, dépendances, etc.
```

### TypeScript
- Utiliser les types strictes
- Éviter `any` autant que possible
- Documenter les types complexes

### React
- Utiliser les hooks (pas de class components)
- Composer les composants plutôt que les hériter
- Memoizer les composants si nécessaire

## 🚀 Déployer une modification

### 1. Modification d'un package partagé (ui ou config)
```bash
# Les changements sont automatiquement appliqués aux workspaces dépendants
# Aucune réinstallation nécessaire, juste recharger l'app
```

### 2. Modification d'une application (site, server, systems)
```bash
# Buildez et testez
npm run build:site    # ou build:server, build:systems
npm run test
```

### 3. Vérifier avant de push
```bash
# À la racine
npm run lint          # Linting
npm run test          # Tests
npm run build         # Build de tous les workspaces
```

## 🐛 Debugging

### VSCode Debugger
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch App",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/apps/site",
      "sourceMapPathOverride": {
        "webpack:///./src/*": "${webRoot}/src/*"
      }
    }
  ]
}
```

### Console et Network
- Utilisez les DevTools du navigateur (F12)
- Pour le backend, utilisez `console.log` ou un debugger

## 📚 Documentation

- [MONOREPO.md](./MONOREPO.md) - Structure monorepo
- [QUICK_START.md](./QUICK_START.md) - Démarrage rapide
- [docs/MONOREPO_SETUP.md](./docs/MONOREPO_SETUP.md) - Configuration détaillée

## ✅ Avant de faire une PR

- [ ] Code formaté avec Prettier (`npm run format`)
- [ ] Pas d'erreurs ESLint (`npm run lint`)
- [ ] Tests passent (`npm run test`)
- [ ] Build réussit (`npm run build`)
- [ ] Commit messages suivent les conventions
- [ ] Documentation mise à jour si nécessaire
- [ ] Pas de `console.log` ou `debugger` en production

## 🤝 Code Review

Les reviewers vont vérifier:
- Qualité du code
- Tests adéquats
- Documentation
- Performance
- Sécurité

## ❓ Questions?

N'hésitez pas à:
1. Consulter la documentation
2. Créer une issue GitHub
3. Contacter l'équipe

Merci de contribuer! 🌟
