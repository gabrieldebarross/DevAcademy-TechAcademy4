/**
 * Documento OpenAPI 3.1 que descreve a API REST do DevAcademy.
 *
 * Vai dentro do backend compilado e é servido como JSON em
 * `GET /api/docs/openapi.json`. A referência interativa (Scalar) é renderizada
 * em `GET /api/docs`. Manter o documento como um objeto simples evita etapa de
 * build e garante que ele sempre viaje junto com o código.
 */

type JsonObject = Record<string, unknown>;

function schemaRef(name: string): JsonObject {
  return { $ref: `#/components/schemas/${name}` };
}

function jsonContent(schema: JsonObject): JsonObject {
  return { 'application/json': { schema } };
}

function listSchema(itemName: string): JsonObject {
  return {
    type: 'object',
    required: ['data', 'meta'],
    properties: {
      data: { type: 'array', items: schemaRef(itemName) },
      meta: schemaRef('PaginationMeta'),
    },
  };
}

function errorResponse(description: string): JsonObject {
  return { description, content: jsonContent(schemaRef('Error')) };
}

interface ResourceConfig {
  readonly basePath: string;
  readonly tag: string;
  readonly label: string;
  readonly article: 'um' | 'uma';
  readonly singular: string;
  readonly input: string;
  readonly response: string;
  /** Perfis autorizados a escrever (aparece na descrição das rotas de escrita). */
  readonly writeRoles: string;
  /** Observação sobre o escopo de leitura por perfil (opcional). */
  readonly readScope?: string;
}

/** Os quatro recursos têm exatamente a mesma forma REST, então é gerada uma vez. */
function resourcePaths(config: ResourceConfig): JsonObject {
  const unauthorized = { $ref: '#/components/responses/Unauthorized' };
  const notFound = { $ref: '#/components/responses/NotFound' };
  const validationError = { $ref: '#/components/responses/ValidationError' };
  const conflict = { $ref: '#/components/responses/Conflict' };
  const forbidden = { $ref: '#/components/responses/Forbidden' };
  const idParameter = { $ref: '#/components/parameters/ResourceId' };

  return {
    [`/${config.basePath}`]: {
      get: {
        tags: [config.tag],
        summary: `Lista ${config.label} (paginado)`,
        ...(config.readScope ? { description: config.readScope } : {}),
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
        ],
        responses: {
          200: {
            description: `Lista paginada de ${config.label}.`,
            content: jsonContent(listSchema(config.response)),
          },
          401: unauthorized,
        },
      },
      post: {
        tags: [config.tag],
        summary: `Cadastra ${config.article} ${config.singular}`,
        description: `Perfis autorizados: ${config.writeRoles}.`,
        requestBody: { required: true, content: jsonContent(schemaRef(config.input)) },
        responses: {
          201: {
            description: 'Registro criado.',
            content: jsonContent(schemaRef(config.response)),
          },
          400: validationError,
          401: unauthorized,
          403: forbidden,
          409: conflict,
        },
      },
    },
    [`/${config.basePath}/{id}`]: {
      get: {
        tags: [config.tag],
        summary: `Busca ${config.article} ${config.singular} por id`,
        parameters: [idParameter],
        responses: {
          200: {
            description: 'Registro encontrado.',
            content: jsonContent(schemaRef(config.response)),
          },
          401: unauthorized,
          404: notFound,
        },
      },
      put: {
        tags: [config.tag],
        summary: `Atualiza ${config.article} ${config.singular}`,
        description: `Perfis autorizados: ${config.writeRoles}.`,
        parameters: [idParameter],
        requestBody: { required: true, content: jsonContent(schemaRef(config.input)) },
        responses: {
          200: {
            description: 'Registro atualizado.',
            content: jsonContent(schemaRef(config.response)),
          },
          400: validationError,
          401: unauthorized,
          403: forbidden,
          404: notFound,
          409: conflict,
        },
      },
      delete: {
        tags: [config.tag],
        summary: `Remove ${config.article} ${config.singular}`,
        description: `Perfis autorizados: ${config.writeRoles}.`,
        parameters: [idParameter],
        responses: {
          204: { description: 'Registro removido com sucesso.' },
          401: unauthorized,
          403: forbidden,
          404: notFound,
        },
      },
    },
  };
}

export const openApiDocument: JsonObject = {
  openapi: '3.1.0',
  info: {
    title: 'DevAcademy API',
    version: '1.0.0',
    description: [
      'API REST do painel administrativo da **DevAcademy** (escola de tecnologia).',
      '',
      'Autenticação por **JWT**: faça `POST /auth/login`, copie o `token` e use',
      '`Authorization: Bearer <token>` nas rotas protegidas.',
      '',
      'Todos os endpoints de listagem são paginados (`?page=&limit=`) e respondem',
      'com `{ data, meta }`. Os erros seguem o formato `{ statusCode, error, message }`.',
      '',
      'A API usa **RBAC** com três perfis: `ADMIN` (administra tudo), `INSTRUCTOR`',
      '(gerencia os próprios cursos e as matrículas das suas aulas) e `STUDENT`',
      '(consulta cursos e vê apenas as próprias matrículas).',
    ].join('\n'),
  },
  servers: [
    { url: '/api', description: 'Mesma origem da aplicação (atrás do proxy Nginx).' },
  ],
  tags: [
    { name: 'Sistema', description: 'Disponibilidade da API.' },
    { name: 'Autenticação', description: 'Cadastro e login.' },
    { name: 'Usuários', description: 'Perfil do usuário autenticado.' },
    { name: 'Categorias', description: 'Categorias de cursos.' },
    { name: 'Instrutores', description: 'Instrutores da escola.' },
    { name: 'Cursos', description: 'Cursos oferecidos.' },
    { name: 'Matrículas', description: 'Matrículas de alunos em cursos.' },
  ],
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Verifica se a API está no ar',
        security: [],
        responses: {
          200: {
            description: 'API disponível.',
            content: jsonContent({
              type: 'object',
              required: ['status', 'timestamp'],
              properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', format: 'date-time' },
              },
            }),
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastra um novo usuário',
        description:
          'No cadastro é possível escolher o perfil (`role`). O **STUDENT** entra ativo na hora; ' +
          '**INSTRUCTOR** e **ADMIN** ficam `PENDING` e **não conseguem logar até um ADMIN aprovar**.',
        security: [],
        requestBody: { required: true, content: jsonContent(schemaRef('RegisterInput')) },
        responses: {
          201: { description: 'Usuário criado.', content: jsonContent(schemaRef('User')) },
          400: { $ref: '#/components/responses/ValidationError' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autentica e devolve um token JWT',
        security: [],
        requestBody: { required: true, content: jsonContent(schemaRef('LoginInput')) },
        responses: {
          200: {
            description: 'Login realizado.',
            content: jsonContent(schemaRef('AuthResponse')),
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: errorResponse('E-mail ou senha inválidos.'),
          403: errorResponse(
            'Cadastro aguardando aprovação de um administrador, ou recusado, ou ainda com a senha base do primeiro acesso não trocada.',
          ),
        },
      },
    },
    '/users': {
      get: {
        tags: ['Usuários'],
        summary: 'Lista usuários (paginado)',
        description:
          'Listagem somente-leitura usada para escolher o aluno em uma matrícula. Restrita a **ADMIN** e **INSTRUCTOR**. Aceita os filtros opcionais `role` e `status`.',
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'role',
            in: 'query',
            required: false,
            description: 'Filtra pelo perfil de acesso.',
            schema: schemaRef('UserRole'),
          },
          {
            name: 'status',
            in: 'query',
            required: false,
            description: 'Filtra pela situação da conta.',
            schema: schemaRef('UserStatus'),
          },
        ],
        responses: {
          200: {
            description: 'Lista paginada de usuários (sem CPF).',
            content: jsonContent(listSchema('UserSummary')),
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Usuários'],
        summary: 'Cria uma conta com senha base',
        description:
          'Exclusivo do **ADMIN**. Cria a conta já ativa, com o perfil escolhido e uma senha base. ' +
          'O novo usuário é **obrigado a trocar a senha no primeiro acesso** antes de usar as demais rotas. ' +
          'Se o perfil for `INSTRUCTOR`, um cadastro de instrutor é criado automaticamente (especialidade "A definir", editável em /instructors).',
        requestBody: { required: true, content: jsonContent(schemaRef('CreateUserInput')) },
        responses: {
          201: { description: 'Usuário criado.', content: jsonContent(schemaRef('User')) },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/users/{id}/role': {
      patch: {
        tags: ['Usuários'],
        summary: 'Altera o perfil de acesso de um usuário',
        description:
          'Exclusivo do **ADMIN**. Define o perfil do usuário como `ADMIN`, `INSTRUCTOR` ou `STUDENT`. ' +
          'Ao promover para `INSTRUCTOR` (conta ativa), um cadastro de instrutor é criado; ao deixar de ser instrutor, o cadastro é removido (bloqueado se houver cursos vinculados).',
        parameters: [{ $ref: '#/components/parameters/ResourceId' }],
        requestBody: { required: true, content: jsonContent(schemaRef('ChangeRoleInput')) },
        responses: {
          200: { description: 'Perfil atualizado.', content: jsonContent(schemaRef('User')) },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/users/{id}/status': {
      patch: {
        tags: ['Usuários'],
        summary: 'Aprova ou recusa um cadastro pendente',
        description:
          'Exclusivo do **ADMIN**. Aprova (`ACTIVE`) ou recusa (`REJECTED`) um cadastro. ' +
          'Enquanto estiver `PENDING` ou `REJECTED`, a conta não consegue fazer login. ' +
          'Aprovar um cadastro de `INSTRUCTOR` cria o cadastro de instrutor correspondente.',
        parameters: [{ $ref: '#/components/parameters/ResourceId' }],
        requestBody: { required: true, content: jsonContent(schemaRef('UpdateUserStatusInput')) },
        responses: {
          200: { description: 'Situação atualizada.', content: jsonContent(schemaRef('User')) },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Usuários'],
        summary: 'Dados do usuário autenticado',
        responses: {
          200: { description: 'Perfil atual.', content: jsonContent(schemaRef('User')) },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      put: {
        tags: ['Usuários'],
        summary: 'Edita o próprio usuário',
        description:
          'Atualiza apenas o próprio usuário. Os campos são opcionais e podem ser alterados individualmente; o e-mail não pode ser alterado.',
        requestBody: {
          required: true,
          content: jsonContent(schemaRef('UpdateProfileInput')),
        },
        responses: {
          200: { description: 'Perfil atualizado.', content: jsonContent(schemaRef('User')) },
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/Forbidden' },
          401: { $ref: '#/components/responses/Unauthorized' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    ...resourcePaths({
      basePath: 'categories',
      tag: 'Categorias',
      label: 'categorias',
      article: 'uma',
      singular: 'categoria',
      input: 'CategoryInput',
      response: 'Category',
      writeRoles: 'apenas **ADMIN**',
    }),
    ...resourcePaths({
      basePath: 'instructors',
      tag: 'Instrutores',
      label: 'instrutores',
      article: 'um',
      singular: 'instrutor',
      input: 'InstructorInput',
      response: 'Instructor',
      writeRoles:
        'apenas **ADMIN**. Criar um instrutor cria junto a conta de acesso (perfil INSTRUCTOR) com senha base e troca obrigatória no 1º acesso',
      readScope:
        'Qualquer usuário autenticado consulta a lista; o **CPF só é retornado para o perfil ADMIN**.',
    }),
    ...resourcePaths({
      basePath: 'courses',
      tag: 'Cursos',
      label: 'cursos',
      article: 'um',
      singular: 'curso',
      input: 'CourseInput',
      response: 'Course',
      writeRoles: '**ADMIN** (qualquer curso) e **INSTRUCTOR** (apenas os próprios cursos)',
      readScope:
        '**ADMIN** e **STUDENT** enxergam o catálogo completo; **INSTRUCTOR** apenas os cursos que leciona.',
    }),
    ...resourcePaths({
      basePath: 'enrollments',
      tag: 'Matrículas',
      label: 'matrículas',
      article: 'uma',
      singular: 'matrícula',
      input: 'EnrollmentInput',
      response: 'Enrollment',
      writeRoles:
        '**ADMIN** e **INSTRUCTOR** criam e aprovam matrículas; **STUDENT** solicita a própria matrícula (criada como `PENDING`) e pode cancelá-la enquanto pendente',
      readScope:
        '**ADMIN** enxerga todas as matrículas; **INSTRUCTOR** apenas as das próprias aulas; **STUDENT** apenas as próprias.',
    }),
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token devolvido por `POST /auth/login`.',
      },
    },
    parameters: {
      Page: {
        name: 'page',
        in: 'query',
        required: false,
        description: 'Página (começa em 1).',
        schema: { type: 'integer', minimum: 1, default: 1 },
      },
      Limit: {
        name: 'limit',
        in: 'query',
        required: false,
        description: 'Itens por página (máximo 50).',
        schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
      },
      ResourceId: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Identificador (UUID) do recurso.',
        schema: { type: 'string', format: 'uuid' },
      },
    },
    responses: {
      Unauthorized: errorResponse('Token ausente ou inválido.'),
      NotFound: errorResponse('Recurso não encontrado.'),
      ValidationError: errorResponse('Dados inválidos.'),
      Conflict: errorResponse('Conflito de dados (ex.: e-mail ou CPF já cadastrado).'),
      Forbidden: errorResponse('Operação não permitida para este usuário.'),
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['statusCode', 'error', 'message'],
        properties: {
          statusCode: { type: 'integer', example: 404 },
          error: { type: 'string', example: 'NotFoundError' },
          message: { type: 'string', example: 'Recurso não encontrado' },
        },
      },
      PaginationMeta: {
        type: 'object',
        required: ['page', 'limit', 'total', 'totalPages'],
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
      UserRole: {
        type: 'string',
        enum: ['ADMIN', 'INSTRUCTOR', 'STUDENT'],
        description: 'Perfil de acesso (RBAC): ADMIN, INSTRUCTOR ou STUDENT.',
      },
      UserStatus: {
        type: 'string',
        enum: ['PENDING', 'ACTIVE', 'REJECTED'],
        description:
          'Situação da conta: PENDING (aguardando aprovação), ACTIVE (liberada para login) ou REJECTED (recusada).',
      },
      ChangeRoleInput: {
        type: 'object',
        required: ['role'],
        properties: { role: schemaRef('UserRole') },
      },
      CreateUserInput: {
        type: 'object',
        required: ['name', 'email', 'cpf', 'password', 'role'],
        properties: {
          name: { type: 'string', example: 'Maria Silva' },
          email: { type: 'string', format: 'email', example: 'novo@exemplo.com' },
          cpf: { type: 'string', description: '11 dígitos (com ou sem máscara).', example: '00000000000' },
          password: {
            type: 'string',
            format: 'password',
            description:
              'Senha base, seguindo a política de força. O usuário deverá trocá-la no primeiro acesso.',
          },
          role: schemaRef('UserRole'),
        },
      },
      UpdateUserStatusInput: {
        type: 'object',
        required: ['status'],
        description: 'Aprova (`ACTIVE`) ou recusa (`REJECTED`) um cadastro.',
        properties: { status: schemaRef('UserStatus') },
      },
      User: {
        type: 'object',
        required: ['id', 'name', 'email', 'cpf', 'role', 'status', 'mustChangePassword', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Maria Silva' },
          email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
          cpf: { type: 'string', description: 'Somente dígitos.', example: '00000000000' },
          role: schemaRef('UserRole'),
          status: schemaRef('UserStatus'),
          mustChangePassword: {
            type: 'boolean',
            description: 'Quando `true`, o usuário precisa trocar a senha antes de usar as demais rotas.',
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      UserSummary: {
        type: 'object',
        required: ['id', 'name', 'email', 'role', 'status', 'mustChangePassword'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Maria Silva' },
          email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
          role: schemaRef('UserRole'),
          status: schemaRef('UserStatus'),
          mustChangePassword: { type: 'boolean' },
        },
      },
      AuthResponse: {
        type: 'object',
        required: ['token', 'user'],
        properties: {
          token: { type: 'string', description: 'JWT a ser enviado em `Authorization`.' },
          user: schemaRef('User'),
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'cpf', 'password'],
        properties: {
          name: { type: 'string', example: 'Maria Silva' },
          email: { type: 'string', format: 'email' },
          cpf: {
            type: 'string',
            description: '11 dígitos (com ou sem máscara).',
            example: '00000000000',
          },
          password: {
            type: 'string',
            format: 'password',
            description:
              'Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.',
          },
          role: {
            allOf: [schemaRef('UserRole')],
            description:
              'Perfil pretendido (opcional, padrão `STUDENT`). Perfis privilegiados ficam pendentes de aprovação.',
          },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
          password: {
            type: 'string',
            format: 'password',
            description: 'Use as suas próprias credenciais. Não há usuário público de teste.',
          },
        },
      },
      UpdateProfileInput: {
        type: 'object',
        description: 'Informe ao menos um campo. Os campos omitidos são mantidos.',
        properties: {
          name: { type: 'string', description: 'Novo nome (opcional).' },
          email: {
            type: 'string',
            format: 'email',
            description: 'Deve ser o e-mail atual (não é possível alterá-lo).',
          },
          cpf: { type: 'string', description: 'Novo CPF (opcional).' },
          password: {
            type: 'string',
            format: 'password',
            description: 'Nova senha, seguindo a política de força (opcional).',
          },
        },
      },
      Category: {
        type: 'object',
        required: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Front-end' },
          description: { type: ['string', 'null'], example: 'Interfaces e experiência do usuário' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CategoryInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Front-end' },
          description: { type: ['string', 'null'] },
        },
      },
      Instructor: {
        type: 'object',
        required: [
          'id',
          'name',
          'email',
          'cpf',
          'specialty',
          'bio',
          'role',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          cpf: { type: 'string', description: 'Disponível apenas para o perfil ADMIN.' },
          specialty: { type: 'string', example: 'Desenvolvimento Front-end' },
          bio: { type: ['string', 'null'] },
          role: {
            type: 'string',
            enum: ['INSTRUCTOR'],
            description:
              'Sempre INSTRUCTOR. Cada instrutor tem uma conta de acesso vinculada (criada junto no POST).',
            example: 'INSTRUCTOR',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      InstructorInput: {
        type: 'object',
        required: ['name', 'email', 'cpf', 'specialty'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          cpf: { type: 'string' },
          specialty: { type: 'string' },
          bio: { type: ['string', 'null'] },
          password: {
            type: 'string',
            format: 'password',
            description:
              'Senha base da conta de acesso criada junto com o instrutor (obrigatória na criação; ignorada na edição). O instrutor deverá trocá-la no primeiro acesso.',
          },
        },
      },
      CourseLevel: {
        type: 'string',
        enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
        description: 'Iniciante, Intermediário ou Avançado.',
      },
      Course: {
        type: 'object',
        required: [
          'id',
          'title',
          'description',
          'workloadHours',
          'price',
          'level',
          'category',
          'instructor',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          workloadHours: { type: 'integer', example: 40 },
          price: { type: 'number', example: 499.9 },
          level: schemaRef('CourseLevel'),
          category: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
          instructor: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CourseInput: {
        type: 'object',
        required: [
          'title',
          'description',
          'workloadHours',
          'price',
          'level',
          'categoryId',
          'instructorId',
        ],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          workloadHours: { type: 'integer', minimum: 1 },
          price: { type: 'number', minimum: 0 },
          level: schemaRef('CourseLevel'),
          categoryId: { type: 'string', format: 'uuid' },
          instructorId: { type: 'string', format: 'uuid' },
        },
      },
      EnrollmentStatus: {
        type: 'string',
        enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'COMPLETED', 'CANCELLED'],
        description:
          'Pendente (solicitada pelo aluno), Ativa, Suspensa, Concluída ou Cancelada.',
      },
      Enrollment: {
        type: 'object',
        required: ['id', 'status', 'enrolledAt', 'student', 'course'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          status: schemaRef('EnrollmentStatus'),
          enrolledAt: { type: 'string', format: 'date-time' },
          student: {
            type: 'object',
            required: ['id', 'name', 'email'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
          },
          course: {
            type: 'object',
            required: ['id', 'title', 'price'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              price: { type: 'number' },
            },
          },
        },
      },
      EnrollmentInput: {
        type: 'object',
        required: ['courseId'],
        properties: {
          studentId: {
            type: 'string',
            format: 'uuid',
            description:
              'Obrigatório para ADMIN e INSTRUCTOR. Ignorado quando o próprio aluno solicita (usa a conta autenticada).',
          },
          courseId: { type: 'string', format: 'uuid' },
          status: schemaRef('EnrollmentStatus'),
        },
      },
    },
  },
};
