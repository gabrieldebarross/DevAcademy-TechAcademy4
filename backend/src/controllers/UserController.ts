import {
  ChangeRoleInput,
  CreateUserInput,
  UpdateProfileInput,
  UpdateUserStatusInput,
  toUserResponse,
  toUserSummary,
} from '../dtos/user';
import { UserRole } from '../entities/UserRole';
import { UserStatus } from '../entities/UserStatus';
import { CourseRepository } from '../repositories/CourseRepository';
import { InstructorRepository } from '../repositories/InstructorRepository';
import { UserRepository } from '../repositories/UserRepository';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { InstructorService } from '../services/InstructorService';
import { UserService } from '../services/UserService';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';
import { requireAuthenticatedUser } from '../utils/requireAuthenticatedUser';

// O serviço de usuários reaproveita o de instrutores para manter o cadastro de
// instrutor em sincronia com a conta de acesso.
const instructorService = new InstructorService(
  new InstructorRepository(),
  new CourseRepository(),
  new UserRepository(),
  new BcryptPasswordHasher(),
);
const service = new UserService(
  new UserRepository(),
  new BcryptPasswordHasher(),
  instructorService,
);

/**
 * GET /api/users - listagem paginada somente-leitura usada pela tela de
 * matrículas para escolher o aluno. Aceita os filtros opcionais `role` e
 * `status` (por exemplo, `/users?role=STUDENT&status=ACTIVE`).
 */
export const list = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);

  // Valida os filtros contra os enums: valores desconhecidos são ignorados
  // em vez de irem para a query, evitando respostas vazias por engano.
  const role = Object.values(UserRole).includes(req.query.role as UserRole)
    ? (req.query.role as UserRole)
    : undefined;
  const status = Object.values(UserStatus).includes(req.query.status as UserStatus)
    ? (req.query.status as UserStatus)
    : undefined;

  const result = await service.list(page, limit, { role, status });

  res.status(200).json({ data: result.data.map(toUserSummary), meta: result.meta });
});

/** GET /api/users/me - dados do usuário autenticado. */
export const me = asyncHandler(async (req, res) => {
  const currentUser = requireAuthenticatedUser(req);
  const user = await service.findById(currentUser.id);

  res.status(200).json(toUserResponse(user));
});

/** PUT /api/users/me - atualiza apenas o usuário autenticado. */
export const updateMe = asyncHandler(async (req, res) => {
  const currentUser = requireAuthenticatedUser(req);
  const user = await service.updateProfile(currentUser.id, req.body as UpdateProfileInput);

  res.status(200).json(toUserResponse(user));
});

/** POST /api/users - ADMIN cria uma conta com senha base (troca no 1º acesso). */
export const create = asyncHandler(async (req, res) => {
  const user = await service.create(req.body as CreateUserInput);

  res.status(201).json(toUserResponse(user));
});

/** PATCH /api/users/:id/role - troca o perfil de acesso (exclusivo do ADMIN). */
export const changeRole = asyncHandler(async (req, res) => {
  const { role } = req.body as ChangeRoleInput;
  const user = await service.changeRole(req.params.id, role);

  res.status(200).json(toUserResponse(user));
});

/** PATCH /api/users/:id/status - ADMIN aprova ou recusa um cadastro pendente. */
export const changeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body as UpdateUserStatusInput;
  const user = await service.changeStatus(req.params.id, status);

  res.status(200).json(toUserResponse(user));
});
