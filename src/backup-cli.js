const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const backupDir = path.join(__dirname, '../', 'backups');
const BACKUP_LIMIT = 28;

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function mostrarAyuda() {
  log('\n💾 SISTEMA DE BACKUPS - VIMENSTOCK\n', 'blue');
  
  log('\nDESCRIPCIÓN', 'blue');
  log('Sistema automatizado de respaldo y restauración de datos.', 'gray');
  log(`Los backups se almacenan en: ${backupDir}`, 'gray');
  log(`Límite de backups almacenados: ${BACKUP_LIMIT} copias`, 'gray');
  log('Los backups más antiguos se eliminan automáticamente.\n', 'gray');
  
  log('\nCOMANDOS DISPONIBLES', 'blue');
  
  log('\n📦 CREAR BACKUP', 'green');
  log('  npm run backup', 'gray');
  log('  - Crea un respaldo completo de la carpeta data/', 'gray');
  log('  - Incluye: productos, historial, finanzas, tickets, logs', 'gray');
  log('  - Formato: data-YYYY-MM-DDTHH-MM-SS-sssZ/', 'gray');
  
  log('\n📋 LISTAR BACKUPS', 'green');
  log('  npm run backup:list', 'gray');
  log('  - Muestra todos los backups disponibles ordenados por fecha', 'gray');
  log('  - Incluye: índice, nombre, fecha de creación', 'gray');
  
  log('\n🔄 RESTAURAR BACKUP', 'green');
  log('  npm run backup:restore <índice>', 'gray');
  log('  - Restaura un backup específico usando su índice', 'gray');
  log('  - ⚠️  ADVERTENCIA: Sobrescribe TODOS los datos actuales', 'gray');
  log('  - Espera 3 segundos antes de ejecutar', 'gray');
  log('  Ejemplo: npm run backup:restore 0', 'gray');
  
  log('\n🗑️  ELIMINAR BACKUP', 'green');
  log('  npm run backup:delete <índice>', 'gray');
  log('  - Elimina un backup específico de forma permanente', 'gray');
  log('  - Espera 3 segundos antes de ejecutar', 'gray');
  log('  Ejemplo: npm run backup:delete 5', 'gray');
  
  log('\n❓ AYUDA', 'green');
  log('  npm run backup:help', 'gray');
  log('  - Muestra esta ayuda completa', 'gray');
  
  log('\nNOTAS IMPORTANTES', 'blue');
  log('• Los backups automáticos se ejecutan cada 12 horas cuando el servidor está activo', 'gray');
  log('• El índice [0] siempre es el backup más reciente', 'gray');
  log('• Los índices aumentan con la antigüedad del backup', 'gray');
  log('• Máximo de backups: 28 (los más antiguos se eliminan automáticamente)', 'gray');
  log('• La restauración NO se puede deshacer, asegúrate de elegir el backup correcto', 'gray');
  log('• Se recomienda crear un backup manual antes de operaciones importantes\n', 'gray');

}

function crearBackup() {
  try {
    if (!fs.existsSync(dataDir)) {
      log('❌ Error: La carpeta data no existe', 'red');
      process.exit(1);
    }

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFolderName = `data-${timestamp}`;
    const backupFolderPath = path.join(backupDir, backupFolderName);

    fs.mkdirSync(backupFolderPath, { recursive: true });

    function copyDirectory(source, destination) {
      const items = fs.readdirSync(source, { withFileTypes: true });
      
      items.forEach(item => {
        const sourcePath = path.join(source, item.name);
        const destPath = path.join(destination, item.name);
        
        if (item.isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          copyDirectory(sourcePath, destPath);
        } else if (item.isFile()) {
          fs.copyFileSync(sourcePath, destPath);
        }
      });
    }

    copyDirectory(dataDir, backupFolderPath);
    log('✅ Backup creado exitosamente', 'green');
    log(`📁 Nombre: ${backupFolderName}`, 'blue');
    log(`📂 Ubicación: ${backupFolderPath}\n`, 'gray');

    // Limpiar backups antiguos
    const backups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('data-') && fs.statSync(path.join(backupDir, f)).isDirectory())
      .sort()
      .reverse();

    if (backups.length > BACKUP_LIMIT) {
      const backupsEliminados = backups.slice(BACKUP_LIMIT);
      backupsEliminados.forEach(oldBackup => {
        const oldBackupPath = path.join(backupDir, oldBackup);
        fs.rmSync(oldBackupPath, { recursive: true, force: true });
      });
      log(`🗑️  Backups antiguos eliminados: ${backupsEliminados.length}`, 'yellow');
    }

  } catch (error) {
    log(`❌ Error creando backup: ${error.message}`, 'red');
    process.exit(1);
  }
}

function listarBackups() {
  try {
    if (!fs.existsSync(backupDir)) {
      log('❌ No existe el directorio de backups', 'red');
      process.exit(1);
    }

    const backups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('data-') && fs.statSync(path.join(backupDir, f)).isDirectory())
      .sort()
      .reverse();

    if (backups.length === 0) {
      log('\n⚠️  No hay backups disponibles\n', 'yellow');
      return;
    }

    log('\n📋 Lista de Backups Disponibles:\n', 'blue');
    log('─'.repeat(80), 'gray');

    backups.forEach((backup, index) => {
      const backupPath = path.join(backupDir, backup);
      const stats = fs.statSync(backupPath);
      const fecha = stats.mtime.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      log(`[${index}] - ${backup}`, 'green');
      log(`     Fecha: ${fecha}`, 'gray');
      log('─'.repeat(80), 'gray');
    });

    log(`\n💾 Total de backups: ${backups.length}/${BACKUP_LIMIT}\n`, 'blue');

  } catch (error) {
    log(`❌ Error listando backups: ${error.message}`, 'red');
    process.exit(1);
  }
}

function restaurarBackup(index) {
  try {
    if (!fs.existsSync(backupDir)) {
      log('❌ No existe el directorio de backups', 'red');
      process.exit(1);
    }

    const backups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('data-') && fs.statSync(path.join(backupDir, f)).isDirectory())
      .sort()
      .reverse();

    if (backups.length === 0) {
      log('❌ No hay backups disponibles', 'red');
      process.exit(1);
    }

    const idx = parseInt(index);
    if (isNaN(idx) || idx < 0 || idx >= backups.length) {
      log(`❌ Índice inválido. Usa un número entre 0 y ${backups.length - 1}`, 'red');
      process.exit(1);
    }

    const backupToRestore = backups[idx];
    const backupPath = path.join(backupDir, backupToRestore);

    log(`\n⚠️  ¿Estás seguro de que quieres restaurar el backup: ${backupToRestore}?`, 'yellow');
    log('⚠️  Esto sobrescribirá todos los datos actuales.', 'yellow');
    log('\nProcediendo en 3 segundos...', 'gray');

    setTimeout(() => {
      if (fs.existsSync(dataDir)) {
        fs.rmSync(dataDir, { recursive: true, force: true });
      }

      fs.mkdirSync(dataDir, { recursive: true });

      function copyDirectory(source, destination) {
        const items = fs.readdirSync(source, { withFileTypes: true });
        
        items.forEach(item => {
          const sourcePath = path.join(source, item.name);
          const destPath = path.join(destination, item.name);
          
          if (item.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyDirectory(sourcePath, destPath);
          } else if (item.isFile()) {
            fs.copyFileSync(sourcePath, destPath);
          }
        });
      }

      copyDirectory(backupPath, dataDir);

      log('\n✅ Backup restaurado exitosamente', 'green');
      log(`📁 Desde: ${backupToRestore}`, 'blue');
      log(`📂 A: ${dataDir}\n`, 'gray');
    }, 3000);

  } catch (error) {
    log(`❌ Error restaurando backup: ${error.message}`, 'red');
    process.exit(1);
  }
}

function eliminarBackup(index) {
  try {
    if (!fs.existsSync(backupDir)) {
      log('❌ No existe el directorio de backups', 'red');
      process.exit(1);
    }

    const backups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('data-') && fs.statSync(path.join(backupDir, f)).isDirectory())
      .sort()
      .reverse();

    if (backups.length === 0) {
      log('❌ No hay backups disponibles', 'red');
      process.exit(1);
    }

    const idx = parseInt(index);
    if (isNaN(idx) || idx < 0 || idx >= backups.length) {
      log(`❌ Índice inválido. Usa un número entre 0 y ${backups.length - 1}`, 'red');
      process.exit(1);
    }

    const backupToDelete = backups[idx];
    const backupPath = path.join(backupDir, backupToDelete);

    log(`\n⚠️  ¿Estás seguro de que quieres eliminar el backup: ${backupToDelete}?`, 'yellow');
    log('Procediendo en 3 segundos...', 'gray');

    setTimeout(() => {
      fs.rmSync(backupPath, { recursive: true, force: true });

      log('\n✅ Backup eliminado exitosamente', 'green');
      log(`📁 ${backupToDelete}\n`, 'blue');
    }, 3000);

  } catch (error) {
    log(`❌ Error eliminando backup: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Procesar argumentos
const args = process.argv.slice(2);

if (args.length === 0) {
  crearBackup();
} else if (args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
  mostrarAyuda();
} else if (args[0] === 'list') {
  listarBackups();
} else if (args[0] === 'restore' || args[0] === 'restart') {
  if (args.length < 2) {
    log('❌ Debes especificar el índice del backup a restaurar', 'red');
    log('Ejemplo: npm run backup:restore 0', 'gray');
    log('Usa "npm run backup:help" para más información\n', 'gray');
    process.exit(1);
  }
  restaurarBackup(args[1]);
} else if (args[0] === 'delete') {
  if (args.length < 2) {
    log('❌ Debes especificar el índice del backup a eliminar', 'red');
    log('Ejemplo: npm run backup:delete 0', 'gray');
    log('Usa "npm run backup:help" para más información\n', 'gray');
    process.exit(1);
  }
  eliminarBackup(args[1]);
} else {
  log('❌ Comando no reconocido', 'red');
  log('Usa "npm run backup:help" para ver todos los comandos disponibles\n', 'gray');
  process.exit(1);
}