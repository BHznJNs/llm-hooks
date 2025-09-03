import childProcess from 'node:child_process';

const NPM_EXEC_TIMEOUT = 20_000;

export function npmInstall(dependencies: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = childProcess.exec(
      `npm install --silent ${dependencies.join(' ')}`,
      { cwd },
      (error, _stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        if (stderr) {
          reject(new Error(stderr));
          return;
        }
        resolve();
      }
    );
    setTimeout(() => {
      process.kill();
      reject(new Error('Timeout waiting for npm install'));
    }, NPM_EXEC_TIMEOUT);
  });
}
