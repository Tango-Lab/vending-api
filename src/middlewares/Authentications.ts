import express from 'express';
import { JwtPayload } from 'jsonwebtoken';

import { UnauthorizedError } from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';
import { UserStatus } from '../enums/UserStatus';
import { UserServiceImpl } from '../services';
import { verifyJWTToken } from '../utils/jwt';

export default async function (req: express.Request, _R: express.Response, next: express.NextFunction) {
  try {
    const authorization = req.headers['authorization'] ?? '';
    const [, token] = authorization.split(' ');
    if (!token) {
      throw new UnauthorizedError('Missing Provided `Token`.');
    }
    const payload = (await verifyJWTToken(token)) as JwtPayload;
    const userService = new UserServiceImpl();
    const user = await userService.findOne({ _id: payload.userId, status: UserStatus.Active });

    if (!user) {
      throw new UnauthorizedError('User does not existed!.', ErrorCode.UserDoesNotExist);
    }
    //
    req.userId = user?.id;
    next();
  } catch (error) {
    next(error);
  }
}
