import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const cwd = fileURLToPath(new URL('../', import.meta.url));
const windows = process.platform === 'win32';
const options = process.argv.slice(2);
if (options.some(option => option !== '--sqlite') || options.length > 1) {
  console.error('Uso: node scripts/start.mjs [--sqlite]');
  process.exit(1);
}
await mkdir(resolve(cwd, 'data'), { recursive: true });
console.log('Armazenamento selecionado: SQLite (data/kanban.db).');
const serverEnv = { ...process.env };
if (!serverEnv.JAVA_HOME) {
  const lookup = spawnSync(windows ? 'where.exe' : 'which', ['java'], { encoding: 'utf8' });
  const javaPath = lookup.stdout?.split(/\r?\n/).find(line => line.trim());
  if (javaPath) serverEnv.JAVA_HOME = dirname(dirname(javaPath.trim()));
}
if (!serverEnv.JAVA_HOME) {
  console.error('Java não foi encontrado. Instale o Java 17 e tente novamente.');
  process.exit(1);
}
const mavenArgs = ['-B', 'spring-boot:run'];
const server = windows
  ? spawn('cmd.exe', ['/d', '/s', '/c', 'mvnw.cmd ' + mavenArgs.join(' ')], { cwd, env: serverEnv, windowsHide: true, stdio: ['inherit', 'pipe', 'pipe'] })
  : spawn('./mvnw', mavenArgs, { cwd, env: serverEnv, stdio: ['inherit', 'pipe', 'pipe'] });

let opened = false;
let output = '';
server.stdout.on('data', chunk => {
  process.stdout.write(chunk);
  output = (output + chunk.toString()).slice(-8192);
  const ready = output.match(/Tomcat started on port (\d+)/);
  if (opened || !ready) return;
  opened = true;
  const url = `http://localhost:${ready[1]}`;
  console.log(`\nKanban disponível em ${url}\n`);
  const browser = windows
    ? spawn('powershell.exe', ['-NoProfile', '-Command', `Start-Process '${url}'`], { windowsHide: true, stdio: 'ignore' })
    : spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [url], { stdio: 'ignore' });
  browser.on('error', () => console.error(`Abra o navegador em ${url}`));
});
server.stderr.on('data', chunk => process.stderr.write(chunk));
server.on('error', error => { console.error('Falha ao iniciar o Maven Wrapper:', error.message); process.exitCode = 1; });
server.on('exit', code => { process.exitCode = code ?? 1; });
process.on('SIGINT', () => {
  if (windows && server.pid) {
    const stop = spawn('taskkill', ['/pid', String(server.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' });
    stop.on('error', () => server.kill());
  } else server.kill('SIGINT');
});
