import { spawn } from 'node:child_process';

const NPM_EXEC_TIMEOUT = 30_000;

export function npmInstall(dependencies: string[], cwd: string): Promise<void> {
  const args = ['install', '--silent', ...dependencies];
  return new Promise((resolve, reject) => {
    const child = spawn('npm', args, { cwd, stdio: 'inherit', shell: true });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('Timeout waiting for npm install'));
    }, NPM_EXEC_TIMEOUT);

    child.on('exit', (code) => {
      clearTimeout(timer);
      code === 0
        ? resolve()
        : reject(new Error(`npm install exited with ${code}`));
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
