import pino from 'pino';

type PinoLogger = pino.Logger<never, boolean>;

class Logger {
  private readonly _instance: PinoLogger;
  constructor() {
    this._instance = pino({ level: 'debug' });
  }

  get instance(): PinoLogger {
    return this._instance;
  }

  moduleLogger(name: string): PinoLogger {
    return this._instance.child({ module: name });
  }
}

export const logger = new Logger();
