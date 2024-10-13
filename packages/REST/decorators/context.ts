import { MethodParam } from '../classes/Parameter';
import { ParamType } from '../enums';
import { ServerContainer } from '../Server';

export function ContextRequest(target: Object, propertyKey: string, parameterIndex: number) {
  return processDecoratedParameter(target, propertyKey, parameterIndex, ParamType.context_request);
}

export function ContextResponse(target: Object, propertyKey: string, parameterIndex: number) {
  return processDecoratedParameter(target, propertyKey, parameterIndex, ParamType.context_response);
}

export function ContextNext(target: Object, propertyKey: string, parameterIndex: number) {
  return processDecoratedParameter(target, propertyKey, parameterIndex, ParamType.context_next);
}

/**
 * Decorator processor for parameter annotations on methods
 */
function processDecoratedParameter(target: Object, propertyKey: string, parameterIndex: number,
  paramType: ParamType) {
  const serviceMethod = ServerContainer.registerServiceMethod(target.constructor, propertyKey);
  serviceMethod.parameters[parameterIndex] = new MethodParam('', paramType);
}