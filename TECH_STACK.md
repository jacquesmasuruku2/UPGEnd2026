# 📋 Stack technologique et versions

## Versions node/npm recommandées
- **Node.js**: 18.x ou 20.x
- **npm**: 9.x ou 10.x
- **Bun**: 1.x (alternative optionnelle)

## Technologies principales

### Frontend (apps/site, apps/systems)
- **Framework**: React 18.3
- **Build tool**: Vite 5.4
- **Language**: TypeScript 5.5
- **Styling**: Tailwind CSS 3.4 + PostCSS
- **UI Library**: Radix UI + Shadcn/ui
- **Forms**: React Hook Form 7.51
- **Query**: TanStack React Query 5.83
- **Animations**: Framer Motion 12.34
- **Icons**: Lucide React 0.460

### Backend (apps/server)
- **Runtime**: Node.js
- **Framework**: Express 5.2
- **Middleware**: CORS 2.8
- **Environment**: Dotenv 17.4

### Database & Backend Services
- **Primary**: Supabase (PostgreSQL)
- **Secondary**: PostgreSQL direct
- **ORM/Query**: À déterminer (Prisma, Drizzle, etc.)

### Development Tools
- **Package Manager**: npm workspaces
- **Linter**: ESLint 9.9 + TypeScript ESLint 8.4
- **Formatter**: Prettier
- **Testing**: Vitest 2.1
- **Git**: Git + GitLens (VSCode)

### DevOps & Deployment
- **Hosting Frontend**: Vercel (via vercel.json)
- **Hosting API**: À déterminer
- **CDN Edge**: Cloudflare
- **Database Hosting**: Supabase (D1 pour Cloudflare)

## Dépendances partagées

### À la racine (développement)
- TypeScript 5.5
- ESLint 9.9
- Prettier
- Tailwind CSS 3.4
- Vitest 2.1

### Importées par tous les workspaces
- React 18.3
- React DOM 18.3
- Tailwind Merge 2.4
- Class Variance Authority 0.7

## Versions des packages importants

| Package | Version | Usage |
|---------|---------|-------|
| react | ^18.3.1 | Frontend |
| vite | ^5.4.6 | Build tool |
| typescript | ^5.5.4 | Type checking |
| tailwindcss | ^3.4.9 | Styling |
| @radix-ui/* | ^1.x | UI components |
| eslint | ^9.9.0 | Linting |
| vitest | ^2.1.1 | Testing |
| supabase-js | ^2.98.0 | Database |
| express | ^5.2.1 | Backend |

## Configuration TypeScript

- **Target**: ES2020
- **Module**: ESNext
- **JSX**: react-jsx
- **Strict Mode**: ✅ Activé
- **Path Aliases**: `@upgoma/ui`, `@upgoma/config`
- **Isolated Modules**: ✅ Activé

## Configuration ESLint

- **Parser**: TypeScript ESLint
- **Config Base**: eslint:recommended + TypeScript recommended
- **Rules Strictes**: Activées
- **Auto-fix**: ✅ Disponible

## Configuration Prettier

- **Semi-colons**: ✅ Activés
- **Single Quotes**: ✅ Activées
- **Tab Width**: 2 espaces
- **Print Width**: 100 caractères
- **Trailing Comma**: es5
- **Arrow Parens**: always

## Configuration Tailwind

- **JIT Mode**: ✅ Par défaut avec Vite
- **Dark Mode**: À configurer
- **Plugins**: tailwindcss-animate
- **Content Paths**: À configurer par workspace

## Browser Support

- Chrome/Edge: Dernière 2 versions
- Firefox: Dernière 2 versions
- Safari: Dernière 2 versions
- ES2020 + JavaScript Moderne

## Environnement de développement recommandé

### VSCode Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin
- GitLens
- Thunder Client (pour API testing)

### Chrome DevTools
- React Developer Tools
- Redux DevTools (si utilisé)

## Mise à jour des dépendances

```bash
# Vérifier les dépendances obsolètes
npm outdated

# Mettre à jour dans un workspace spécifique
npm update --workspace=@upgoma/site

# Mettre à jour à la racine
npm update --workspace-root
```

## Performance Cibles

- **Lighthouse Desktop**: >90
- **First Paint**: <2s
- **Bundle Size**: <250KB (gzipped)
- **Core Web Vitals**: Good

## Notes de compatibilité

- Tous les workspaces utilisent ES2020+
- No IE11 support
- Mobile first approach
- Progressive enhancement

## Maintenance

- Vérifier les mises à jour mensuellement
- Suivre les changements majeurs des dépendances critiques
- Tester après chaque mise à jour
- Documenter les changements de version
