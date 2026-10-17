import 'reflect-metadata';

import { AppDataSource } from './data-source';
import { Category } from '../entities/Category';
import { Course, CourseLevel } from '../entities/Course';
import { Enrollment, EnrollmentStatus } from '../entities/Enrollment';
import { Instructor } from '../entities/Instructor';
import { User } from '../entities/User';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';

/**
 * Populates the database with demonstration data.
 * Run it with `npm run seed` (inside `backend/`).
 */
async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const usersRepository = AppDataSource.getRepository(User);
  const categoriesRepository = AppDataSource.getRepository(Category);
  const instructorsRepository = AppDataSource.getRepository(Instructor);
  const coursesRepository = AppDataSource.getRepository(Course);
  const enrollmentsRepository = AppDataSource.getRepository(Enrollment);

  // Clean up in foreign key order. `clear()` runs `TRUNCATE`, which MySQL
  // refuses on tables referenced by a foreign key, so the checks are disabled.
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

  try {
    await queryRunner.clearTable('enrollments');
    await queryRunner.clearTable('courses');
    await queryRunner.clearTable('instructors');
    await queryRunner.clearTable('categories');
    await queryRunner.clearTable('users');
  } finally {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
    await queryRunner.release();
  }

  const hasher = new BcryptPasswordHasher();
  const defaultPassword = 'DevAcademy@123';
  const passwordHash = await hasher.hash(defaultPassword);

  const admin = new User({
    name: 'Ana Souza',
    email: 'admin@devacademy.com',
    cpf: '52998224725',
    passwordHash,
  });

  const student = new User({
    name: 'Bruno Lima',
    email: 'bruno@devacademy.com',
    cpf: '11144477735',
    passwordHash,
  });

  await usersRepository.save([admin, student]);

  const frontend = new Category({ name: 'Front-end', description: 'Interfaces e experiência do usuário' });
  const backend = new Category({ name: 'Back-end', description: 'APIs, bancos de dados e integrações' });
  const dataAndAi = new Category({ name: 'Dados e IA', description: 'Análise de dados e inteligência artificial' });

  await categoriesRepository.save([frontend, backend, dataAndAi]);

  const carlos = new Instructor({
    name: 'Carlos Mendes',
    email: 'carlos@devacademy.com',
    cpf: '12345678909',
    specialty: 'Desenvolvimento Front-end',
    bio: 'Especialista em React, Next.js e design de interfaces acessíveis.',
  });

  const marina = new Instructor({
    name: 'Marina Alves',
    email: 'marina@devacademy.com',
    cpf: '39053344705',
    specialty: 'Engenharia de Back-end',
    bio: 'Trabalha com Node.js, arquitetura de APIs e bancos relacionais.',
  });

  await instructorsRepository.save([carlos, marina]);

  const nextCourse = new Course({
    title: 'Next.js do Zero ao Deploy',
    description: 'Construa aplicações modernas com o App Router, autenticação e deploy em produção.',
    workloadHours: 40,
    price: 499.9,
    level: CourseLevel.INTERMEDIATE,
    category: frontend,
    instructor: carlos,
  });

  const typescriptCourse = new Course({
    title: 'TypeScript Profissional',
    description: 'Domine tipos avançados, generics, orientação a objetos e boas práticas de arquitetura.',
    workloadHours: 32,
    price: 399.9,
    level: CourseLevel.ADVANCED,
    category: frontend,
    instructor: carlos,
  });

  const expressCourse = new Course({
    title: 'APIs REST com Express e TypeORM',
    description: 'Crie APIs seguras com autenticação JWT, validações, paginação e testes.',
    workloadHours: 48,
    price: 549.9,
    level: CourseLevel.INTERMEDIATE,
    category: backend,
    instructor: marina,
  });

  const dataCourse = new Course({
    title: 'Introdução a Dados e IA',
    description: 'Fundamentos de análise de dados e primeiros passos com modelos de inteligência artificial.',
    workloadHours: 24,
    price: 299.9,
    level: CourseLevel.BEGINNER,
    category: dataAndAi,
    instructor: marina,
  });

  await coursesRepository.save([nextCourse, typescriptCourse, expressCourse, dataCourse]);

  await enrollmentsRepository.save([
    new Enrollment({ student, course: nextCourse, status: EnrollmentStatus.ACTIVE }),
    new Enrollment({ student, course: expressCourse, status: EnrollmentStatus.COMPLETED }),
    new Enrollment({ student: admin, course: typescriptCourse, status: EnrollmentStatus.ACTIVE }),
  ]);

  console.log('Seed finished successfully.');
  console.log(`Login with admin@devacademy.com / ${defaultPassword}`);

  await AppDataSource.destroy();
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
