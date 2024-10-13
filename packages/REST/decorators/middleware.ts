/**
 * A decorator to tell the [[Server]] to register a middleware for specific method.
 * @param middleware
 */

import { RequestHandler } from 'express';
import { isArray } from 'lodash';

import { ServiceMethod } from '../meta';
import { ServerContainer } from '../Server';

export function Authorization(target: any, propertyKey: string) {
  return AuthorizationMethodDecorator(target, propertyKey);
}

export function Middleware(middleware: RequestHandler | RequestHandler[]) {
  return function (target: any, propertyKey: string) {
    middleware = isArray(middleware) ? middleware : [middleware];
    //
    return MiddlewareMethodDecorator(target, propertyKey, middleware);
  };
}

function AuthorizationMethodDecorator(target: any, propertyKey: string) {
  const serviceMethod: ServiceMethod = ServerContainer.registerServiceMethod(target.constructor, propertyKey);
  serviceMethod.requiresAuthorization = true;
}


function MiddlewareMethodDecorator(target: any, propertyKey: string, middleware: RequestHandler[]): void {
  const serviceMethod: ServiceMethod = ServerContainer.registerServiceMethod(target.constructor, propertyKey);
  serviceMethod.addMiddleware(middleware);
}