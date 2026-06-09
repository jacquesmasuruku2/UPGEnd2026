# Monorepo Configuration Guide

Ce guide explique comment travailler avec la structure monorepo Upgoma.

## Structure du monorepo

### Applications (apps/)
- **site** - Application web frontend principale
- **server** - API backend
- **systems** - Modules de gestion académique

### Packages partagés (packages/)
- **ui** - Composants React réutilisables
- **config** - Configuration commune (ESLint, TypeScript, etc.)

## Workflow de développement

### 1. Configuration initiale

```bash
# Cloner et installer
git clone <repo>
cd upgoma-website-main
npm install
```

### 2. Développement concurrent

Pour développer sur plusieurs applications à la fois:

```bash
# Terminal 1: Frontend
cd apps/site && npm run dev

# Terminal 2: Backend  
cd apps/server && npm run dev

# Terminal 3: Modules académiques
cd apps/systems && npm run dev
```

### 3. Travail sur les packages partagés

Si vous modifiez `@upgoma/ui` ou `@upgoma/config`:

```bash
# Les modifications sont automatiquement visibles dans les autres workspaces
# Pas de besoin de reconstruire ou réinstaller

# Après des modifications, simplement recharger l'application
```

## Ajouter des dépendances

### À une application spécifique
```bash
npm install lodash --workspace=@upgoma/site
npm install express-cors --workspace=@upgoma/server
```

### À un package partagé
```bash
npm install react-hook-form --workspace=@upgoma/ui
npm install typescript --workspace=@upgoma/config --save-dev
```

### À la racine (DevDependencies partagées)
```bash
npm install --save-dev husky --workspace-root
```

## Résolution des problèmes

### Les modifications dans packages/ui ne s'affichent pas

1. Vérifier que le workspace est correctement linké:
```bash
npm ls @upgoma/ui
```

2. Si nécessaire, réinstaller:
```bash
npm install
```

3. Redémarrer le serveur de développement:
```bash
# Terminez le serveur Vite et relancez-le
```

### Erreur "workspace not found"

- Vérifier que les `package.json` existent dans le workspace
- Vérifier que le nom dans `"name"` correspond aux références (ex: `@upgoma/site`)
- Relancer `npm install`

### Conflit de dépendances

Pour résoudre un conflit:

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## Scripts utiles

### À la racine
```bash
npm run dev              # Tous les workspaces
npm run build            # Builder tous les workspaces
npm run lint             # Lint tous les workspaces
npm run test             # Tests tous les workspaces
```

### Pour une app spécifique
```bash
npm run dev:site         # Frontend
npm run dev:server       # Backend
npm run dev:systems      # Modules académiques

npm run build:site       # Build frontend
npm run build:server     # Build backend
npm run build:systems    # Build modules académiques
```

## Meilleures pratiques

1. **Utiliser les imports relatifs pour les packages locaux**:
   ```typescript
   import { Button } from '@upgoma/ui';
   import { config } from '@upgoma/config';
   ```

2. **Mettre à jour les versions coherently**: Si vous changez la version dans package.json racine, mettez à jour aussi les workspaces

3. **Committer les changements ensemble**: Si vous modifiez un package partagé et une application, committer ensemble pour éviter les conflits

4. **Documenter les breaking changes**: Si vous modifiez l'API d'un package partagé, documentez les changements

## Déploiement

Voir le dossier `deploy/` pour les instructions de déploiement spécifiques à chaque environnement.

## Support et questions

Pour des questions sur la structure du monorepo, consulter `MONOREPO.md` ou contacter l'équipe.
