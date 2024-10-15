import axios, { AxiosInstance } from 'axios';
import { injectable } from 'inversify';

import { BadRequestError, MissingParamError } from '../../packages';
import { AccountTransactionResponse, RenewTokenResponse } from '../models/SitAPI';

export interface SitAPIService {
  renewToken: () => Promise<RenewTokenResponse>;
  checkAccountTransaction: (token: string, md5: string) => Promise<AccountTransactionResponse>;
}

@injectable()
export class SitAPIServiceImpl implements SitAPIService {
  readonly #BASE_URL = 'https://api-bakong.nbc.gov.kh';

  #api: AxiosInstance;

  constructor() {
    this.#api = axios.create({
      baseURL: this.#BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Method to renew the token
  async renewToken(): Promise<RenewTokenResponse> {
    const bodyParam = { email: 'yanputy123@gmail.com' };
    const data = await this.#POST<RenewTokenResponse>('/v1/renew_token', bodyParam);

    if (!data.data?.token) {
      throw new BadRequestError(data.responseMessage, data.errorCode as number);
    }

    return data; // Return the token
  }

  // Method to renew the token
  async checkAccountTransaction(token: string, md5: string): Promise<AccountTransactionResponse> {
    if (!token) {
      throw new MissingParamError('Authorization');
    }

    if (!md5) {
      throw new MissingParamError('MD5');
    }

    const bodyParam = { md5 };
    const headers = { Authorization: token };

    const data = await this.#POST<AccountTransactionResponse>(
      '/v1/check_transaction_by_md5',
      bodyParam,
      headers,
    );
    return data; // Return the token
  }

  // Generic POST method
  async #POST<T>(url: string, payload: object, headers = {}): Promise<T> {
    try {
      const response = await this.#api.post<T>(url, payload, { headers });
      return response.data;
    } catch (error) {
      this.#handleError(error);
      throw new Error(error as any); // Rethrow for further handling
    }
  }

  // Method to handle errors
  #handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('API error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
