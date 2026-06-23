import { findUserByEmail } from '../repositories/userRepo.js';
import { signToken } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';

export function login(email: string) {
  const user = findUserByEmail(email);
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Invalid email or credentials', 401);
  }

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}
