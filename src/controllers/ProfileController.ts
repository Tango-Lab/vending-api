import { Request } from 'express';
import { inject, injectable } from 'inversify';

import { Authorization, ContextRequest, Controller, GET, NotFoundError } from '../../packages';
import { UserService } from '../services';

@Controller('/profile')
@injectable()
export class ProfileController {
  @inject('UserService')
  userService!: UserService;

  @GET('/v1/me')
  @Authorization
  async getAllBaby(@ContextRequest request: Request) {
    if (!request.userId) {
      return {};
    }
    const user = await this.userService.findByIdActive(request.userId);
    if (!user) {
      throw new NotFoundError('You are UnAuthorization!.');
    }
    return user;
  }
}
