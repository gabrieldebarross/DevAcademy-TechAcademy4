import { LoginInput, RegisterInput } from '../dtos/auth';
import { toUserResponse } from '../dtos/user';
import { UserRepository } from '../repositories/UserRepository';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { JwtTokenProvider } from '../security/JwtTokenProvider';
import { AuthService } from '../services/AuthService';
import { asyncHandler } from '../utils/asyncHandler';

const service = new AuthService(
  new UserRepository(),
  new BcryptPasswordHasher(),
  new JwtTokenProvider(),
);

export const register = asyncHandler(async (req, res) => {
  const user = await service.register(req.body as RegisterInput);

  res.status(201).json(toUserResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const authentication = await service.login(req.body as LoginInput);

  res.status(200).json(authentication);
});
