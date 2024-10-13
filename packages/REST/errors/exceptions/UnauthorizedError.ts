import { ErrorCode } from '../../enums';
import { HttpError } from '../HttpError';

export class UnauthorizedError extends HttpError {

  constructor(message: string, errorCode?: number) {
    super("UNAUTHORIZED", ErrorCode.Unauthorized, message, errorCode);
  }

}