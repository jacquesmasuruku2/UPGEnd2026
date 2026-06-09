#!/bin/bash
# Script de vérification du monorepo Upgoma

echo "🔍 Vérification du monorepo Upgoma..."
echo ""

# Compteur de vérifications
passed=0
failed=0

# Fonction pour vérifier l'existence d'un fichier
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
        ((passed++))
    else
        echo "❌ $1 - MANQUANT"
        ((failed++))
    fi
}

# Fonction pour vérifier l'existence d'un répertoire
check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1"
        ((passed++))
    else
        echo "❌ $1 - MANQUANT"
        ((failed++))
    fi
}

# Vérifier les fichiers racine
echo "📄 Fichiers de configuration racine:"
check_file "package.json"
check_file "tsconfig.json.root"
check_file ".npmrc"
check_file ".eslintrc"
check_file ".prettierrc"
check_file "upgoma-website.code-workspace"
echo ""

# Vérifier les répertoires apps
echo "📁 Répertoires apps:"
check_dir "apps/site"
check_dir "apps/server"
check_dir "apps/systems"
echo ""

# Vérifier les répertoires packages
echo "📦 Répertoires packages:"
check_dir "packages/ui"
check_dir "packages/config"
echo ""

# Vérifier les package.json dans chaque workspace
echo "🎯 package.json dans chaque workspace:"
check_file "apps/site/package.json"
check_file "apps/server/package.json"
check_file "apps/systems/package.json"
check_file "packages/ui/package.json"
check_file "packages/config/package.json"
echo ""

# Vérifier les fichiers de documentation
echo "📚 Fichiers de documentation:"
check_file "MONOREPO.md"
check_file "QUICK_START.md"
check_file "CONTRIBUTING.md"
check_file "docs/MONOREPO_SETUP.md"
echo ""

# Vérifier les scripts
echo "🔧 Scripts:"
check_file "scripts/setup-monorepo.sh"
check_file "scripts/setup-monorepo.ps1"
echo ""

# Afficher le résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Vérifications terminées:"
echo "✅ Réussi: $passed"
echo "❌ Échoué: $failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $failed -eq 0 ]; then
    echo "🎉 Monorepo correctement configuré!"
    exit 0
else
    echo "⚠️  Il y a des problèmes de configuration"
    exit 1
fi
