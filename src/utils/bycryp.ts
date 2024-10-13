import bcrypt from 'bcryptjs';

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
}

export function validatePassword(rawPassword: string, encodedPassword: string): boolean {
  return bcrypt.compareSync(rawPassword, encodedPassword);
}
