import { injectable } from 'inversify';
import mongoose, { FilterQuery } from 'mongoose';

import { BadRequestError, NotFoundError } from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';
import { TokenType } from '../enums/TokenType';
import { UserStatus } from '../enums/UserStatus';
import { AccessToken } from '../models/Token';
import User, { IUser } from '../models/User';
import { hashPassword, validatePassword } from '../utils/bycryp';
import { generateAccessToken, getJWTLifeTime } from '../utils/jwt';

export interface UserService {
  save: (param: IUser, session: any) => Promise<IUser>;
  signUp: (user: IUser) => Promise<AccessToken>;
  login: (username: string, password: string) => Promise<AccessToken>;
  findOne: (filter: FilterQuery<IUser>) => Promise<IUser | null>;
  findActiveOne: (filter: FilterQuery<IUser>) => Promise<IUser | null>;
  findByIdActive: (id: mongoose.Types.ObjectId) => Promise<IUser>;
  findByIdAndUpdate: (user: IUser) => Promise<IUser | null>;
  isValidObjectId: (id: string) => boolean;
}

@injectable()
export class UserServiceImpl implements UserService {
  async login(username: string, password: string) {
    let user = await this.findOne({
      username: username,
      status: UserStatus.Active,
    });
    if (!user) {
      throw new BadRequestError('This email does not exited!.');
    }
    const isValidPassword = validatePassword(password, user.password);
    if (!isValidPassword) {
      throw new BadRequestError('Invalid Password!.');
    }
    user.lastLoginAt = new Date();
    await User.updateOne({ username }, user);
    return this._generateToken(user.id);
  }

  async save(param: IUser, session: any): Promise<IUser> {
    if (param.password) {
      param['password'] = hashPassword(param.password);
    }
    param.createdAt = new Date();
    param.hasVerify = false;
    const user = await new User(param).save({ session });
    return user;
  }

  async signUp(param: IUser): Promise<AccessToken> {
    const user = await this.findOneByEmail(param.email);
    if (user) {
      throw new BadRequestError('This emails has registered');
    }
    if (param.password) {
      param['password'] = hashPassword(param.password);
    }
    //
    const data = await new User(param).save();
    return this._generateToken(data.id);
  }

  findOneByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findByIdActive(id: mongoose.Types.ObjectId): Promise<IUser> {
    const user = await User.findOne({ _id: id, status: UserStatus.Active });
    if (!user) {
      throw new NotFoundError('User does not existed!. ', ErrorCode.UserDoesNotExist);
    }
    return user;
  }

  findActiveOne(filter: FilterQuery<IUser>): Promise<IUser | null> {
    return User.findOne({ ...filter, status: UserStatus.Active });
  }

  findOne(filter: FilterQuery<IUser>): Promise<IUser | null> {
    return User.findOne(filter);
  }

  findByIdAndUpdate(user: IUser): Promise<IUser | null> {
    return User.findByIdAndUpdate(user.id, user).exec();
  }

  isValidObjectId(id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    return isValid;
  }

  private _generateToken(userId: string): AccessToken {
    const expiredIn = getJWTLifeTime();
    const token = generateAccessToken(userId, expiredIn);
    return new AccessToken(token, expiredIn, userId, TokenType.Bearer);
  }
}
