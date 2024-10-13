import express from 'express';
import { JwtPayload } from 'jsonwebtoken';

import { UnauthorizedError } from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';
import Verification from '../models/Verifications';
import { UserServiceImpl } from '../services';
import { verifyJWTToken } from '../utils/jwt';

export default async function (req: express.Request, _R: express.Response, next: express.NextFunction) {
  try {
    const authorization = req.headers['authorization'] ?? '';
    const [_, token] = authorization.split(' ');
    if (!token) {
      throw new UnauthorizedError('Missing Provided `Token`.');
    }
    const payload = (await verifyJWTToken(token)) as JwtPayload;
    const userService = new UserServiceImpl();
    const [verification, user] = await Promise.all([
      Verification.findById(payload.id),
      userService.findOne({ username: payload.email }),
    ]);
    // User has existed or ID of verification does not existed
    if (user || !verification) {
      throw new UnauthorizedError('User has already register!.', ErrorCode.UserIsExisted);
    }
    //
    req.email = payload.email;
    next();
  } catch (error) {
    next(error);
  }
}
