import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { logger } from '../utils/logger.ts';
import { runtime } from '../utils/runtime.ts';
import { appConfigs } from './schema.ts';

function removeSslModeFromUrl(urlString: string): string {
  const url = new URL(urlString);

  if (url.searchParams.get('sslmode') === 'require') {
    url.searchParams.delete('sslmode');
  }

  return url.toString();
}

// --- --- --- --- --- ---

if (runtime !== 'docker') {
  throw new Error('Database is only supported in docker runtime');
}

const envConnectionString = process.env.DATABASE_URL!;
if (!envConnectionString) {
  throw new Error('DATABASE_URL is not defined');
}

type DrizzleDatabase = ReturnType<typeof drizzle>;
const sslConfig = { rejectUnauthorized: false };
const moduleLogger = logger.moduleLogger('db');

class DatabaseController {
  private readonly connectionString: string;
  private isInitialized = false;
  private migrationsClient: Pool | null = null;
  private migrationDb: DrizzleDatabase | null = null;
  private client: Pool | null = null;
  private _db: DrizzleDatabase | null = null;

  constructor(connectionString: string) {
    this.connectionString = removeSslModeFromUrl(connectionString);
    process.on('SIGINT', this.closeConnections.bind(this));
    process.on('SIGTERM', this.closeConnections.bind(this));
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }
    this.createConnections();
    await this.ensureConnections();
    await this.runMigrations();
    this.isInitialized = true;
  }

  private createConnections() {
    this.migrationsClient = new Pool({
      connectionString: this.connectionString,
      max: 1,
      ssl: sslConfig,
    });
    this.migrationDb = drizzle(this.migrationsClient);

    this.client = new Pool({
      connectionString: this.connectionString,
      ssl: sslConfig,
    });
    this._db = drizzle(this.client);
  }

  private async ensureConnections() {
    try {
      await this._db?.select({ value: sql<number>`1` }).from(appConfigs);
    } catch (error) {
      moduleLogger.error(`Error connecting to database: ${error}`);
      this.closeConnections();
      process.exit(1);
    }
  }

  private async runMigrations() {
    try {
      await migrate(this.migrationDb!, { migrationsFolder: './drizzle' });
    } catch (error) {
      moduleLogger.error(`Error running migrations: ${error}`);
    } finally {
      await this.migrationsClient?.end();
      this.migrationsClient = null;
      this.migrationDb = null;
    }
  }

  private async closeConnections() {
    return await Promise.all([
      this.migrationsClient?.end(),
      this.client?.end(),
    ]);
  }

  get db(): DrizzleDatabase {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }
    return this._db!;
  }
}

const dbController = new DatabaseController(envConnectionString);
await dbController.initialize();
export type Database = typeof dbController.db;
export const db = dbController.db;
