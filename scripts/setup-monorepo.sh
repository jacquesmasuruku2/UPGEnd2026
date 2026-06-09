#!/bin/bash
# Script pour initialiser le monorepo Upgoma

echo "🚀 Initialisation du monorepo Upgoma..."
echo ""

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez installer Node.js et npm."
    exit 1
fi

echo "📦 Installation des dépendances..."
npm install

echo ""
echo "✅ Monorepo initialisé avec succès!"
echo ""
echo "🎯 Commandes disponibles:"
echo "   npm run dev           - Lance tous les workspaces en dev"
echo "   npm run dev:site      - Lance le frontend uniquement"
echo "   npm run dev:server    - Lance le backend uniquement"
echo "   npm run dev:systems   - Lance les modules académiques uniquement"
echo "   npm run build         - Build tous les workspaces"
echo "   npm run lint          - Lint tous les workspaces"
echo "   npm run test          - Tests tous les workspaces"
echo ""
echo "📁 Navigation:"
echo "   cd apps/site          - Frontend"
echo "   cd apps/server        - Backend"
echo "   cd apps/systems       - Modules académiques"
echo "   cd packages/ui        - Composants partagés"
echo "   cd packages/config    - Configuration partagée"
echo ""
