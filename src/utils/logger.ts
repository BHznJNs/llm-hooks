import pino from 'pino';
import pretty from 'pino-pretty';

type PinoLogger = pino.Logger<never, boolean>;

class Logger {
  private readonly _instance: PinoLogger;
  constructor() {
    const stream = pretty({ colorize: true, destination: process.stdout });
    this._instance = pino({ level: 'debug' }, stream);
  }

  get instance(): PinoLogger {
    return this._instance;
  }

  moduleLogger(name: string): PinoLogger {
    return this._instance.child({ module: name });
  }
}

export const logger = new Logger();
