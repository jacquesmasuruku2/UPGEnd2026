# 🔄 Guide de Migration vers le Monorepo

Ce document explique comment migrer votre code existant vers la nouvelle structure monorepo.

## 📊 Avant/Après

### AVANT (Structure plate)
```
upgoma-website-main/
├── src/                    # Code frontend mélangé
├── server/                 # Code backend
├── systems/                # Code des modules
├── package.json            # Un seul package.json
└── node_modules/           # Toutes les dépendances
```

### APRÈS (Structure monorepo)
```
upgoma-website-main/
├── apps/
│   ├── site/              # Frontend
│   ├── server/            # Backend
│   └── systems/           # Modules académiques
├── packages/
│   ├── ui/               # Composants partagés
│   └── config/           # Configuration partagée
├── package.json           # Root avec workspaces
└── node_modules/          # Dépendances hoistées
```

---

## 🚀 Plan de migration

### Phase 1: Préparation (Avant de modifier le code)

1. ✅ Structure créée (déjà faite!)
2. Créer des branches Git pour la migration
3. Sauvegarder le code existant

```bash
# Créer une branche pour la migration
git checkout -b feat/monorepo-migration
git commit -m "chore: initialize monorepo structure"
```

### Phase 2: Migration du Frontend (apps/site)

#### Étape 1: Déplacer les fichiers sources
```bash
# Supposant que src/ contient le code frontend
cp -r src/* apps/site/src/
cp -r public/* apps/site/public/

# Copier les fichiers de configuration
cp vite.config.ts apps/site/
cp tsconfig.json apps/site/
cp tailwind.config.ts apps/site/
cp postcss.config.js apps/site/
cp eslint.config.js apps/site/
```

#### Étape 2: Mettre à jour les imports
- ❌ Imports depuis `@/` → ✅ Imports depuis `./`
- ❌ Imports d'utils globaux → ✅ Imports depuis `@upgoma/ui`

**Exemple:**
```typescript
// ❌ AVANT
import { Button } from '@/components/ui/button'
import { config } from '@/config'

// ✅ APRÈS
import { Button } from '@upgoma/ui'
import { config } from '@upgoma/config'
```

#### Étape 3: Tester le frontend
```bash
cd apps/site
npm install
npm run dev
```

### Phase 3: Migration du Backend (apps/server)

#### Étape 1: Déplacer les fichiers backend
```bash
cp -r server/* apps/server/
```

#### Étape 2: Mettre à jour le package.json
```json
{
  "name": "@upgoma/server",
  "scripts": {
    "dev": "node server/admission-api.mjs"
  }
}
```

#### Étape 3: Tester le backend
```bash
cd apps/server
npm install
npm run dev
```

### Phase 4: Migration des Modules Académiques (apps/systems)

#### Étape 1: Déplacer les fichiers
```bash
cp -r systems/upg-systeme/* apps/systems/
```

#### Étape 2: Mettre à jour les imports
- Même processus que le frontend
- Utiliser `@upgoma/ui` et `@upgoma/config`

#### Étape 3: Tester
```bash
cd apps/systems
npm install
npm run dev
```

### Phase 5: Migration des Composants Partagés (packages/ui)

#### Étape 1: Organiser les composants Shadcn/ui
```bash
# Copier les composants UI depuis site/src/components/ui
cp apps/site/src/components/ui/* packages/ui/src/components/
```

#### Étape 2: Créer des exports
```typescript
// packages/ui/src/index.ts
export { Button } from './components/button'
export { Card } from './components/card'
// ... etc
```

#### Étape 3: Mettre à jour les imports dans les apps
```typescript
// ❌ AVANT
import { Button } from '@/components/ui/button'

// ✅ APRÈS
import { Button } from '@upgoma/ui'
```

---

## 🔧 Checklist de migration

### Pour chaque workspace:

- [ ] Code source déplacé
- [ ] package.json créé avec dépendances correctes
- [ ] Configuration transférée (tsconfig, eslint, etc.)
- [ ] Imports mis à jour
- [ ] Tests passent: `npm run test`
- [ ] Pas d'erreurs ESLint: `npm run lint`
- [ ] Build réussit: `npm run build`
- [ ] Application lancée localement: `npm run dev`
- [ ] Fonctionnalités testées manuellement

---

## 🐛 Problèmes courants et solutions

### Problème: "Cannot find module '@upgoma/ui'"

**Solution:**
```bash
# Réinstaller le monorepo
npm install

# Vérifier les liens symboliques (symlinks)
npm ls @upgoma/ui
```

### Problème: Les modifications dans packages/ui ne s'affichent pas

**Solution:**
```bash
# Redémarrer le serveur Vite
# Quit: Ctrl+C
# Relancer: npm run dev
```

### Problème: Erreurs TypeScript avec path aliases

**Solution:**
Vérifier que `tsconfig.json` à la racine contient:
```json
{
  "paths": {
    "@upgoma/ui": ["packages/ui/src"],
    "@upgoma/config": ["packages/config/src"]
  }
}
```

### Problème: Conflits de dépendances

**Solution:**
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Étapes finales

1. **Nettoyage**
   ```bash
   # Supprimer les anciens répertoires (après confirmation)
   rm -rf src/ server/ systems/upg-systeme/
   ```

2. **Tests complets**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

3. **Documentation**
   - Mettre à jour le README principal
   - Documenter les changements de structure
   - Ajouter des notes pour l'équipe

4. **Commit et PR**
   ```bash
   git add .
   git commit -m "feat: migrate to monorepo structure"
   git push origin feat/monorepo-migration
   # Créer une PR pour review
   ```

---

## 🔍 Vérification post-migration

```bash
# À la racine
npm run dev              # Tous les workspaces
npm run build            # Build all
npm run lint             # No errors
npm run test             # All tests pass

# Vérification complète
cd apps/site && npm run dev
cd apps/server && npm run dev
cd apps/systems && npm run dev
```

---

## 📚 Ressources

- [MONOREPO.md](./MONOREPO.md) - Vue d'ensemble
- [QUICK_START.md](./QUICK_START.md) - Démarrage rapide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Conventions

---

## 💡 Conseils

1. **Migrez un workspace à la fois** - Plus facile à debug
2. **Testez après chaque workspace** - Vérifiez que tout fonctionne
3. **Gardez les anciennes branches** - Au cas où vous deviez revenir
4. **Communiquez avec l'équipe** - Informez des changements

---

**Bonne migration! 🚀**
