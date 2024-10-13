import { inject, injectable } from 'inversify';
import moment from 'moment';

import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { TokenType } from '../enums/TokenType';
import { BakongToken, IBakongToken } from '../models/BakongTokenSchema';
import { AccountTransactionResponse } from '../models/SitAPI';
import { SitAPIService } from './SitAPIService';

export interface BakongService extends BaseService<IBakongToken> {
  getToken: () => Promise<string>;
  checkAccountStatus: (md5: string) => Promise<AccountTransactionResponse>;
}

@injectable()
export class BakongServiceImpl extends BaseServiceImpl<IBakongToken> {
  readonly #sevenDaysAgo = moment().subtract(7, 'days').startOf('day').toDate(); // Calculate 7 days ago
  model = BakongToken;

  @inject('SitAPIService')
  sitAPISv!: SitAPIService;

  constructor() {
    super();
  }

  async getToken(): Promise<string> {
    const token = await this.model.findOne({ createdAt: { $gte: this.#sevenDaysAgo } }).exec();
    if (token) {
      return this.#joinToken(token.type, token.token);
    }
    const sitToken = await this.sitAPISv.renewToken();

    const result = await new BakongToken({
      type: TokenType.Bearer,
      token: sitToken.data.token,
    }).save();
    return this.#joinToken(result.type, result.token);
  }

  async checkAccountStatus(md5: string) {
    const token = await this.getToken();
    const accountTransaction = await this.sitAPISv.checkAccountTransaction(token, md5);
    return accountTransaction;
  }

  #joinToken(type: string, token: string) {
    return [type, token].join(' ');
  }
}
