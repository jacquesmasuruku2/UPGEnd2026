# Script pour initialiser le monorepo Upgoma (Windows)

Write-Host "🚀 Initialisation du monorepo Upgoma..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si npm est installé
$npmVersion = npm --version 2>$null
if (-not $npmVersion) {
    Write-Host "❌ npm n'est pas installé. Veuillez installer Node.js et npm." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "✅ Monorepo initialisé avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Commandes disponibles:" -ForegroundColor Cyan
Write-Host "   npm run dev           - Lance tous les workspaces en dev"
Write-Host "   npm run dev:site      - Lance le frontend uniquement"
Write-Host "   npm run dev:server    - Lance le backend uniquement"
Write-Host "   npm run dev:systems   - Lance les modules académiques uniquement"
Write-Host "   npm run build         - Build tous les workspaces"
Write-Host "   npm run lint          - Lint tous les workspaces"
Write-Host "   npm run test          - Tests tous les workspaces"
Write-Host ""
Write-Host "📁 Navigation:" -ForegroundColor Cyan
Write-Host "   cd apps\site          - Frontend"
Write-Host "   cd apps\server        - Backend"
Write-Host "   cd apps\systems       - Modules académiques"
Write-Host "   cd packages\ui        - Composants partagés"
Write-Host "   cd packages\config    - Configuration partagée"
Write-Host ""
