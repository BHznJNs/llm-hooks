export type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  maxConnections?: number;
  idleTimeout?: number;
  connectionTimeout?: number;
};

export function parseDatabaseUrl(url: string): DatabaseConfig {
  const DEFAULT_PORT = 5432;
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number.parseInt(parsed.port, 10) || DEFAULT_PORT,
    database: parsed.pathname.slice(1),
    user: parsed.username,
    password: parsed.password,
  };
}

export function getDatabaseConfig(): DatabaseConfig {
  const baseConfig = parseDatabaseUrl(process.env.DATABASE_URL!);

  return {
    ...baseConfig,
    maxConnections: 10,
    idleTimeout: 30_000,
    connectionTimeout: 2000,
  };
}
