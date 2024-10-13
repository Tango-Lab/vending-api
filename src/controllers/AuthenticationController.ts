import * as express from 'express';
import { inject, injectable } from 'inversify';

import { ContextRequest, Controller, Middleware, MissingParamError, POST } from '../../packages';
import VerifyExhibitionToken from '../middlewares/VerifyExhibitionToken';
import { AccessToken } from '../models/Token';
import { IUser } from '../models/User';
import { UserService } from '../services/UserService';

@Controller('/oauth2')
@injectable()
export class AuthenticationController {
  @inject('UserService')
  userService!: UserService;

  @POST('/v1/login')
  async createUserLogin(
    @ContextRequest request: express.Request<any, any, IUser>,
  ): Promise<AccessToken> {
    const param = request.body;
    const token = await this.userService.login(param.username, param.password);
    return token;
  }

  @POST('/v1/logout')
  async userLogOut(): Promise<{ message: string }> {
    return { message: 'Logout Successfully' };
  }

  @POST('/v1/email/valid')
  async checkIfEmailIsExisted(@ContextRequest request: express.Request<any, any, IUser>) {
    const { email } = request.body;
    const user = await this.userService.findActiveOne({ email });
    return { isValid: !user };
  }

  @POST('/v1/username/valid')
  async checkIfUserNameExisted(@ContextRequest request: express.Request<any, any, IUser>) {
    const { username } = request.body;
    const user = await this.userService.findActiveOne({ username });
    return { isValid: !user };
  }

  @POST('/v1/sign-up')
  async createSignUp(
    @ContextRequest request: express.Request<any, any, IUser>,
  ): Promise<AccessToken> {
    const param = request.body;
    const token = await this.userService.signUp(param);
    return token;
  }

  @POST('/v1/exhibition/sign-up')
  @Middleware(VerifyExhibitionToken)
  async createExhibitionUser(
    @ContextRequest request: express.Request<any, any, IUser>,
  ): Promise<AccessToken> {
    if (!request.email) {
      throw new MissingParamError('email');
    }
    const param = request.body;
    param['username'] = request.email;
    param['email'] = request.email;
    param['isExhibitor'] = true;
    param['hasVerify'] = true;
    const token = await this.userService.signUp(param);
    return token;
  }
}
