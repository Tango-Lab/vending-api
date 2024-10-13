import { ErrorCode } from '../../enums';
import { HttpError } from '../HttpError';

/**
 * Represents a METHOD NOT ALLOWED error. The method specified in the Request-Line is not allowed for
 * the resource identified by the Request-URI. The response MUST include an Allow header
 * containing a list of valid methods for the requested resource.
 */
export class MethodNotAllowedError extends HttpError {

  constructor(message: string, errorCode?: number) {
    super("METHOD_NOT_ALLOWED", ErrorCode.MethodNotAllowed, message, errorCode);
  }

}