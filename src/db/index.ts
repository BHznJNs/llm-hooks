import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { runtime } from '../utils/runtime.ts';

if (runtime !== 'docker') {
  throw new Error('Database is only supported in docker runtime');
}

const envConnectionString = process.env.DATABASE_URL!;
if (!envConnectionString) {
  throw new Error('DATABASE_URL is not defined');
}

type PostgresClient = postgres.Sql;
type DrizzleDatabase = ReturnType<typeof drizzle>;

class DatabaseController {
  private readonly connectionString: string;
  private migrationsClient?: PostgresClient;
  private migrationDb?: DrizzleDatabase;
  private client?: PostgresClient;
  private _db?: DrizzleDatabase;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
    this.createConnections();
    this.runMigrations();
    process.on('SIGINT', this.closeConnections.bind(this));
    process.on('SIGTERM', this.closeConnections.bind(this));
  }

  createConnections() {
    this.migrationsClient = postgres(this.connectionString, { max: 1 });
    this.migrationDb = drizzle(this.migrationsClient);

    this.client = postgres(this.connectionString);
    this._db = drizzle(this.client);
  }

  async runMigrations() {
    await migrate(this.migrationDb!, { migrationsFolder: './drizzle' });
  }

  async closeConnections() {
    return await Promise.all([
      this.migrationsClient!.end(),
      this.client!.end(),
    ]);
  }
  get db() {
    return this._db;
  }
}

const dbController = new DatabaseController(envConnectionString);
export const db = dbController.db;
