import { ErrorCode } from '../../enums';
import { HttpError } from '../HttpError';

export class InternalServerError extends HttpError {

  constructor(message: string, errorCode?: number) {
    super("INTERNAL_SERVER_ERROR", ErrorCode.InternalServerError, message, errorCode);
  }

}