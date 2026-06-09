#!/usr/bin/env node

/**
 * Script d'affichage de l'information du monorepo
 * Node.js version du script de vérification
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function fileExists(filepath) {
  return fs.existsSync(filepath);
}

function dirExists(dirpath) {
  return fs.existsSync(dirpath) && fs.statSync(dirpath).isDirectory();
}

function checkFile(filepath, relative = true) {
  const displayPath = relative ? filepath : path.relative(process.cwd(), filepath);
  if (fileExists(filepath)) {
    log(`✅ ${displayPath}`, 'green');
    return true;
  } else {
    log(`❌ ${displayPath}`, 'red');
    return false;
  }
}

function checkDir(dirpath, relative = true) {
  const displayPath = relative ? dirpath : path.relative(process.cwd(), dirpath);
  if (dirExists(dirpath)) {
    log(`✅ ${displayPath}/`, 'green');
    return true;
  } else {
    log(`❌ ${displayPath}/`, 'red');
    return false;
  }
}

// Main verification
log('\n🔍 Vérification du monorepo Upgoma...', 'cyan');
log('═══════════════════════════════════════════\n', 'cyan');

let passed = 0;
let failed = 0;

// Check root config files
log('📄 Fichiers de configuration racine:', 'blue');
const rootFiles = [
  'package.json',
  'tsconfig.json.root',
  '.npmrc',
  '.eslintrc',
  '.prettierrc',
  'upgoma-website.code-workspace',
];
rootFiles.forEach(file => {
  if (checkFile(file)) passed++; else failed++;
});
console.log();

// Check app directories
log('📁 Répertoires apps:', 'blue');
const appDirs = ['apps/site', 'apps/server', 'apps/systems'];
appDirs.forEach(dir => {
  if (checkDir(dir)) passed++; else failed++;
});
console.log();

// Check package directories
log('📦 Répertoires packages:', 'blue');
const pkgDirs = ['packages/ui', 'packages/config'];
pkgDirs.forEach(dir => {
  if (checkDir(dir)) passed++; else failed++;
});
console.log();

// Check workspace package.json files
log('🎯 package.json dans chaque workspace:', 'blue');
const workspacePackages = [
  'apps/site/package.json',
  'apps/server/package.json',
  'apps/systems/package.json',
  'packages/ui/package.json',
  'packages/config/package.json',
];
workspacePackages.forEach(file => {
  if (checkFile(file)) passed++; else failed++;
});
console.log();

// Check documentation
log('📚 Fichiers de documentation:', 'blue');
const docFiles = [
  'MONOREPO.md',
  'QUICK_START.md',
  'CONTRIBUTING.md',
  'TECH_STACK.md',
  'MIGRATION_GUIDE.md',
  'CONFIGURATION_SUMMARY.md',
  'SETUP_VERIFICATION.md',
  'docs/MONOREPO_SETUP.md',
];
docFiles.forEach(file => {
  if (checkFile(file)) passed++; else failed++;
});
console.log();

// Check scripts
log('🔧 Scripts:', 'blue');
const scripts = [
  'scripts/setup-monorepo.sh',
  'scripts/setup-monorepo.ps1',
  'scripts/verify-monorepo.sh',
];
scripts.forEach(file => {
  if (checkFile(file)) passed++; else failed++;
});
console.log();

// Summary
log('═══════════════════════════════════════════', 'cyan');
log(`\n✅ Réussi: ${passed}`, 'green');
log(`❌ Échoué: ${failed}`, failed > 0 ? 'red' : 'green');
log('═══════════════════════════════════════════\n', 'cyan');

if (failed === 0) {
  log('🎉 Monorepo correctement configuré!', 'green');
  log('\nCommandes suggérées:\n', 'yellow');
  log('  npm install                 # Installer les dépendances');
  log('  npm run dev                 # Lancer tous les services');
  log('  npm run build               # Builder tous les workspaces');
  log('  npm run lint                # Lint tous les fichiers');
  log('  npm run test                # Tests tous les workspaces');
  log('\nPour plus d\'infos: cat QUICK_START.md\n', 'yellow');
  process.exit(0);
} else {
  log('⚠️  Il y a des problèmes de configuration', 'red');
  process.exit(1);
}
