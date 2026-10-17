import 'reflect-metadata';

import { AppDataSource } from './data-source';
import { Category } from '../entities/Category';
import { Course, CourseLevel } from '../entities/Course';
import { Enrollment, EnrollmentStatus } from '../entities/Enrollment';
import { Instructor } from '../entities/Instructor';
import { User } from '../entities/User';
import { UserRole } from '../entities/UserRole';
import { UserStatus } from '../entities/UserStatus';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';

/**
 * Popula o banco com dados de demonstração.
 * Execute com `npm run seed` (dentro de `backend/`).
 */
async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const usersRepository = AppDataSource.getRepository(User);
  const categoriesRepository = AppDataSource.getRepository(Category);
  const instructorsRepository = AppDataSource.getRepository(Instructor);
  const coursesRepository = AppDataSource.getRepository(Course);
  const enrollmentsRepository = AppDataSource.getRepository(Enrollment);

  // Limpeza respeitando a ordem das chaves estrangeiras. `clear()` executa
  // `TRUNCATE`, que o MySQL recusa em tabelas referenciadas, por isso as
  // verificações de FK são desativadas durante a operação.
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

  // Três contas de demonstração, uma por perfil (RBAC).
  const admin = new User({
    name: 'Ana Souza',
    email: 'admin@devacademy.com',
    cpf: '52998224725',
    passwordHash,
    role: UserRole.ADMIN,
  });

  const student = new User({
    name: 'Bruno Lima',
    email: 'bruno@devacademy.com',
    cpf: '11144477735',
    passwordHash,
    role: UserRole.STUDENT,
  });

  const instructorUser = new User({
    name: 'Carlos Mendes',
    email: 'instrutor@devacademy.com',
    cpf: '15350946056',
    passwordHash,
    role: UserRole.INSTRUCTOR,
  });

  // Segunda instrutora COM conta de acesso: mostra que o cadastro de instrutor
  // (entidade Instructor) e a conta de login (entidade User) podem ser ligados.
  const marinaUser = new User({
    name: 'Marina Alves',
    email: 'marina@devacademy.com',
    cpf: '39053344705',
    passwordHash,
    role: UserRole.INSTRUCTOR,
  });

  // Cadastro privilegiado PENDENTE: demonstra a fila de aprovação do ADMIN.
  const pendingInstructor = new User({
    name: 'Pedro Ramos',
    email: 'pedro@devacademy.com',
    cpf: '98765432100',
    passwordHash,
    role: UserRole.INSTRUCTOR,
    status: UserStatus.PENDING,
  });

  await usersRepository.save([admin, student, instructorUser, marinaUser, pendingInstructor]);

  const frontend = new Category({ name: 'Front-end', description: 'Interfaces e experiência do usuário' });
  const backend = new Category({ name: 'Back-end', description: 'APIs, bancos de dados e integrações' });
  const dataAndAi = new Category({ name: 'Dados e IA', description: 'Análise de dados e inteligência artificial' });

  await categoriesRepository.save([frontend, backend, dataAndAi]);

  // O instrutor Carlos é vinculado à conta `instrutor@devacademy.com`, o que
  // permite a esse usuário gerenciar os próprios cursos e matrículas.
  const carlos = new Instructor({
    name: 'Carlos Mendes',
    email: 'carlos@devacademy.com',
    cpf: '12345678909',
    specialty: 'Desenvolvimento Front-end',
    bio: 'Especialista em React, Next.js e design de interfaces acessíveis.',
    user: instructorUser,
  });

  const marina = new Instructor({
    name: 'Marina Alves',
    email: 'marina@devacademy.com',
    cpf: '39053344705',
    specialty: 'Engenharia de Back-end',
    bio: 'Trabalha com Node.js, arquitetura de APIs e bancos relacionais.',
    user: marinaUser,
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
    // Solicitação pendente do aluno, para o instrutor/admin aprovar na demo.
    new Enrollment({ student, course: typescriptCourse, status: EnrollmentStatus.PENDING }),
  ]);

  console.log('Seed concluído com sucesso.');
  console.log('Contas de demonstração (senha: ' + defaultPassword + '):');
  console.log('- ADMIN      -> admin@devacademy.com');
  console.log('- INSTRUCTOR -> instrutor@devacademy.com (Carlos Mendes)');
  console.log('- INSTRUCTOR -> marina@devacademy.com (Marina Alves)');
  console.log('- STUDENT    -> bruno@devacademy.com');
  console.log('- PENDENTE   -> pedro@devacademy.com (aguardando aprovação do ADMIN)');

  await AppDataSource.destroy();
}

seed().catch((error: unknown) => {
  console.error('Falha ao executar o seed:', error);
  process.exit(1);
});
