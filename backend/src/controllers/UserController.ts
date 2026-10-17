import { UpdateProfileInput, toUserResponse, toUserSummary } from '../dtos/user';
import { UserRepository } from '../repositories/UserRepository';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { UserService } from '../services/UserService';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';
import { requireAuthenticatedUser } from '../utils/requireAuthenticatedUser';

const service = new UserService(new UserRepository(), new BcryptPasswordHasher());

/**
 * GET /api/users - read-only, paginated listing used by the enrollment
 * screen to pick a student. It is not a full user CRUD.
 */
export const list = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const result = await service.list(page, limit);

  res.status(200).json({ data: result.data.map(toUserSummary), meta: result.meta });
});

/** GET /api/users/me - the authenticated user data. */
export const me = asyncHandler(async (req, res) => {
  const currentUser = requireAuthenticatedUser(req);
  const user = await service.findById(currentUser.id);

  res.status(200).json(toUserResponse(user));
});

/** PUT /api/users/me - updates only the authenticated user. */
export const updateMe = asyncHandler(async (req, res) => {
  const currentUser = requireAuthenticatedUser(req);
  const user = await service.updateProfile(currentUser.id, req.body as UpdateProfileInput);

  res.status(200).json(toUserResponse(user));
});
