import { ErrorCode } from '../../enums';
import { HttpError } from '../HttpError';

export class ValidationError extends HttpError {

  constructor(message: string, errorCode: number = 0) {
    super("VALIDATION_ERROR", ErrorCode.ValidationError, message, errorCode);
  }

}