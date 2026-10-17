import { DataSource } from 'typeorm';

import { env } from '../config/env';
import { Category } from '../entities/Category';
import { Course } from '../entities/Course';
import { Enrollment } from '../entities/Enrollment';
import { Instructor } from '../entities/Instructor';
import { User } from '../entities/User';

/**
 * Single TypeORM data source of the application.
 * Credentials come exclusively from the environment (never hardcoded).
 */
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  synchronize: env.db.synchronize,
  logging: false,
  entities: [User, Instructor, Category, Course, Enrollment],
});
