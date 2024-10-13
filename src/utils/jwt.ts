import jwt from 'jsonwebtoken';
import moment from 'moment';

import { UnauthorizedError } from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';

export function generateAccessToken(userId: number | string, expiresIn: string | number): string {
  const secret = process.env.JWT_SECRET_KEY ?? ('JWT_SECRET_KEY' as string);
  return jwt.sign({ userId, expiresIn }, secret);
}

export function signJWT(payload: string | Buffer | object, expiresIn: string | number): string {
  const secret = process.env.JWT_SECRET_KEY ?? ('JWT_SECRET_KEY' as string);
  Object.assign(payload, { expiresIn });
  return jwt.sign(payload, secret);
}

export function verifyJWTToken(token: string): Promise<string | jwt.JwtPayload | undefined> {
  return new Promise((resolve) => {
    jwt.verify(token, process.env.JWT_SECRET_KEY ?? '', (error, decoded: string | jwt.JwtPayload | undefined) => {
      if (error) {
        throw new UnauthorizedError('Invalid Access Token', ErrorCode.InvalidToken);
      }
      const decodedToken = jwt.decode(token) as jwt.JwtPayload;
      const hasExpired = moment(decodedToken.expiresIn).isBefore(new Date());
      if (hasExpired) {
        throw new UnauthorizedError('Invalid Access Token', ErrorCode.InvalidToken);
      }
      resolve(decodedToken);
    });
  });
}

export function getJWTLifeTime() {
  const expiresInMinutes = process.env.JWT_LIFE_TIME ? parseInt(process.env.JWT_LIFE_TIME) : 20;
  const date = moment().add(expiresInMinutes, 'minutes').valueOf();
  return new Date(date).getTime();
}
