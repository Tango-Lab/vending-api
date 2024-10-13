import express from 'express';
import { inject, injectable } from 'inversify';

import { BadRequestError, ContextRequest, Controller, POST } from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';
import { IVerifications } from '../models/Verifications';
import { UserService, VerificationService } from '../services';
import { getJWTLifeTime, signJWT } from '../utils/jwt';

@Controller('/verifications')
@injectable()
export class VerificationController {
  @inject('VerificationService')
  verificationSv!: VerificationService;

  @inject('UserService')
  userSv!: UserService;

  @POST('/v1/send')
  async sendEmailVerification(@ContextRequest req: express.Request): Promise<IVerifications> {
    const email = req.body.email;
    const user = await this.userSv.findOne({ username: email });
    if (user) {
      throw new BadRequestError('This user has already register', ErrorCode.UserIsExisted);
    }
    const verification = await this.verificationSv.create(email);
    return verification;
  }

  @POST('/v1/verify')
  async verifiedEmailCode(@ContextRequest req: express.Request): Promise<any> {
    const { email, code } = req.body;
    const user = await this.userSv.findOne({ username: email });
    if (user) {
      throw new BadRequestError('This user has already register', ErrorCode.UserIsExisted);
    }
    const verification = await this.verificationSv.validate(email, code);
    const payload = { email: verification.recipient, id: verification.id };
    const expired = getJWTLifeTime();
    const token = signJWT(payload, expired);
    return { email, token };
  }
}
