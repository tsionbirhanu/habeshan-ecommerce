import * as bcrypt from 'bcrypt';
import { authConfig } from '../config/auth';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, authConfig.bcrypt.saltRounds);
};

export const comparePassword = async (plain: string, hashed: string): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};
