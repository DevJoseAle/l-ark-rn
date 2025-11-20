#!/usr/bin/env node

/**
 * Script de limpieza de código para L-ark
 * Remueve: console.logs, comentarios, debuggers
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
  excludeDirs: ['node_modules', '.expo', 'dist', 'build', 'supabase/functions'],
  removeConsole: true,
  removeComments: true,
  removeDebugger: true,
  preserveComments: ['@ts-', '@eslint-', 'TODO:', 'FIXME:', 'NOTE:'],
};

// Estadísticas
const stats = {
  filesProcessed: 0,
  consolesRemoved: 0,
  commentsRemoved: 0,
  debuggersRemoved: 0,
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
 * Remover console.logs
 */
function removeConsoleLogs(content) {
  let removed = 0;

  // console.log(...) - single line
  content = content.replace(/console\.log\([^)]*\);?\s*/g, () => {
    removed++;
    return '';
  });

  // console.log(...) - multiline
  content = content.replace(/console\.log\([^)]*[\s\S]*?\);?\s*/g, () => {
    removed++;
    return '';
  });

  stats.consolesRemoved += removed;
  return content;
}

/**
 * Remover comentarios preservando algunos importantes
 */
function removeComments(content) {
  let removed = 0;

  // Guardar comentarios importantes
  const preservedComments = [];
  const preserveRegex = new RegExp(
    CONFIG.preserveComments.map(p => `(${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`).join('|')
  );

  // Single-line comments //
  content = content.replace(/\/\/.*$/gm, (match) => {
    if (preserveRegex.test(match)) {
      const placeholder = `__PRESERVED_COMMENT_${preservedComments.length}__`;
      preservedComments.push(match);
      return placeholder;
    }
    removed++;
    return '';
  });

  // Multi-line comments /* */
  content = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    if (preserveRegex.test(match)) {
      const placeholder = `__PRESERVED_COMMENT_${preservedComments.length}__`;
      preservedComments.push(match);
      return placeholder;
    }
    removed++;
    return '';
  });

  // Restaurar comentarios preservados
  preservedComments.forEach((comment, index) => {
    content = content.replace(`__PRESERVED_COMMENT_${index}__`, comment);
  });

  stats.commentsRemoved += removed;
  return content;
}

/**
 * Remover debuggers
 */
function removeDebuggers(content) {
  let removed = 0;

  content = content.replace(/debugger;?\s*/g, () => {
    removed++;
    return '';
  });

  stats.debuggersRemoved += removed;
  return content;
}

/**
 * Limpiar líneas vacías múltiples
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

    // Aplicar transformaciones
    if (CONFIG.removeConsole) {
      content = removeConsoleLogs(content);
    }

    if (CONFIG.removeComments) {
      content = removeComments(content);
    }

    if (CONFIG.removeDebugger) {
      content = removeDebuggers(content);
    }

    // Limpiar líneas vacías
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

  console.log('\n🧹 L-ark Code Cleaner\n');

  if (dryRun) {
    log.warning('Modo DRY RUN - No se modificarán archivos');
  }

  log.info(`Buscando archivos en: ${path.resolve(targetDir)}`);
  log.info(`Extensiones: ${CONFIG.extensions.join(', ')}`);

  console.log('\nConfiguraciones:');
  log.stat('  Remover console.logs', CONFIG.removeConsole ? 'Sí' : 'No');
  log.stat('  Remover comentarios', CONFIG.removeComments ? 'Sí' : 'No');
  log.stat('  Remover debuggers', CONFIG.removeDebugger ? 'Sí' : 'No');

  if (CONFIG.preserveComments.length > 0) {
    log.stat('  Preservar comentarios', CONFIG.preserveComments.join(', '));
  }

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
  log.stat('Console.logs removidos', stats.consolesRemoved);
  log.stat('Comentarios removidos', stats.commentsRemoved);
  log.stat('Debuggers removidos', stats.debuggersRemoved);
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
