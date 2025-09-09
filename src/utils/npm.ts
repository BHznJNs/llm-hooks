import { spawn } from 'node:child_process';
import { platform } from 'node:os';

const NPM_EXEC_TIMEOUT = 60_000;

export function npmInstall(dependencies: string[], cwd: string): Promise<void> {
  if (!dependencies.length) {
    return new Promise((resolve) => resolve());
  }

  const networkOptimizedArgs = [
    '--no-audit',
    '--no-fund',
    '--prefer-offline',
    '--progress=false',
  ];
  const args = [
    'install',
    '--silent',
    ...networkOptimizedArgs,
    ...dependencies,
  ];

  return new Promise((resolve, reject) => {
    const child = spawn('npm', args, {
      cwd,
      shell: true,
      stdio: 'inherit',
      windowsVerbatimArguments: platform() === 'win32',
    });
    const timer = setTimeout(() => {
      const childSecondKillTimeout = 5000;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), childSecondKillTimeout);
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
