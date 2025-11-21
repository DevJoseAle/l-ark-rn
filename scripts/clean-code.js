#!/usr/bin/env node

/**
 * Script de limpieza de código para L-ark
 * Remueve SOLO: console.logs marcados con "// erase"
 * Uso: node scripts/clean-code.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configuración
const CONFIG = {
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  excludeDirs: ['node_modules', '.expo', 'dist', 'build', 'supabase/functions', 'scripts'],
};

// Estadísticas
const stats = {
  filesProcessed: 0,
  linesRemoved: 0,
};

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  stat: (label, value) =>
    console.log(`${colors.cyan}${label}:${colors.reset} ${colors.magenta}${value}${colors.reset}`),
};

/**
 * Remover SOLO líneas con "// erase console.log(...)"
 */
function removeMarkedConsoleLogs(content) {
  let removed = 0;

  // Regex para encontrar líneas con: // erase console.log(...)
  // Captura cualquier indentación y el comentario completo
  const regex = /^[ \t]*\/\/\s*erase\s+console\.log\([^)]*\);?\s*[\r\n]*/gm;

  content = content.replace(regex, () => {
    removed++;
    return '';
  });

  stats.linesRemoved += removed;
  return content;
}

/**
 * Limpiar líneas vacías múltiples (máximo 2 seguidas)
 */
function cleanEmptyLines(content) {
  return content.replace(/\n{3,}/g, '\n\n');
}

/**
 * Procesar un archivo
 */
async function processFile(filePath, dryRun = false) {
  try {
    let content = await readFile(filePath, 'utf8');
    const originalContent = content;

    // Remover líneas marcadas
    content = removeMarkedConsoleLogs(content);

    // Limpiar líneas vacías múltiples
    content = cleanEmptyLines(content);

    // Escribir si hay cambios
    if (content !== originalContent) {
      if (!dryRun) {
        await writeFile(filePath, content, 'utf8');
        log.success(`Limpiado: ${filePath}`);
      } else {
        log.info(`[DRY RUN] Se limpiaría: ${filePath}`);
      }
      stats.filesProcessed++;
    }
  } catch (error) {
    log.error(`Error procesando ${filePath}: ${error.message}`);
  }
}

/**
 * Recorrer directorio recursivamente
 */
async function walkDirectory(dir, dryRun = false) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Excluir directorios
      if (!CONFIG.excludeDirs.some(excluded => filePath.includes(excluded))) {
        await walkDirectory(filePath, dryRun);
      }
    } else if (stat.isFile()) {
      // Procesar solo extensiones permitidas
      const ext = path.extname(filePath);
      if (CONFIG.extensions.includes(ext)) {
        await processFile(filePath, dryRun);
      }
    }
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targetDir = args.find(arg => !arg.startsWith('--')) || './';

  console.log('\n🧹 L-ark Code Cleaner - Modo Seguro\n');

  if (dryRun) {
    log.warning('Modo DRY RUN - No se modificarán archivos');
  }

  log.info(`Buscando archivos en: ${path.resolve(targetDir)}`);
  log.info(`Extensiones: ${CONFIG.extensions.join(', ')}`);
  log.info(`Patrón a eliminar: "// erase console.log(...)"`);

  console.log('\n');

  // Procesar
  const startTime = Date.now();
  await walkDirectory(targetDir, dryRun);
  const endTime = Date.now();

  // Resultados
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN');
  console.log('='.repeat(50));

  log.stat('Archivos procesados', stats.filesProcessed);
  log.stat('Líneas eliminadas', stats.linesRemoved);
  log.stat('Tiempo total', `${(endTime - startTime) / 1000}s`);

  console.log('\n');

  if (dryRun) {
    log.warning('Ejecuta sin --dry-run para aplicar los cambios');
  } else {
    log.success('¡Limpieza completada!');
  }

  console.log('\n');
}

// Ejecutar
main().catch((error) => {
  log.error(`Error fatal: ${error.message}`);
  process.exit(1);
});
