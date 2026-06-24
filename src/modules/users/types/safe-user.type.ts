import type { User } from '@prisma/client';

export type SafeUser = Omit<User, 'passwordHash'>;
export type UserWithPasswordHash = User;

export const toSafeUser = (user: User): SafeUser => {
  const { passwordHash, ...safeUser } = user;

  void passwordHash;

  return safeUser;
};
