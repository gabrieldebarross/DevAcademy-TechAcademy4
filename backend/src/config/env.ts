import 'dotenv/config';

/**
 * Acesso tipado às variáveis de ambiente.
 * Segredos nunca são fixados no código: vêm do ambiente do processo
 * (`.env` localmente, variáveis de ambiente do compose em produção).
 */
export interface DatabaseEnvironment {
  readonly host: string;
  readonly port: number;
  readonly user: string;
  readonly password: string;
  readonly name: string;
  readonly synchronize: boolean;
}

export interface JwtEnvironment {
  readonly secret: string;
  readonly expiresIn: string;
}

export interface Environment {
  readonly nodeEnv: string;
  readonly port: number;
  readonly db: DatabaseEnvironment;
  readonly jwt: JwtEnvironment;
  readonly bcryptSaltRounds: number;
}

function read(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function readNumber(name: string, fallback: number): number {
  const parsed = Number(read(name, String(fallback)));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env: Environment = {
  nodeEnv: read('NODE_ENV', 'development'),
  port: readNumber('PORT', 3000),
  db: {
    host: read('DB_HOST', 'localhost'),
    port: readNumber('DB_PORT', 3306),
    user: read('DB_USER', 'devacademy'),
    password: read('DB_PASSWORD', 'devacademy'),
    name: read('DB_NAME', 'devacademy'),
    synchronize: read('DB_SYNCHRONIZE', 'true') !== 'false',
  },
  jwt: {
    secret: read('JWT_SECRET', 'devacademy-development-secret'),
    expiresIn: read('JWT_EXPIRES_IN', '1d'),
  },
  bcryptSaltRounds: readNumber('BCRYPT_SALT_ROUNDS', 10),
};
