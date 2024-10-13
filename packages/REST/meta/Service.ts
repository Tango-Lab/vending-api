import { RequestHandler } from 'express';

import { Parameter } from '../classes/Parameter';
import { HttpMethod } from '../enums';

/**
 * Metadata for REST service classes
 */
export class ServiceClass {
  constructor(targetClass: any) {
    this.targetClass = targetClass;
    this.methods = new Map<string, ServiceMethod>();
    this.languages = new Array<string>();
    this.accepts = new Array<string>();
  }

  targetClass: any;
  path: string | null = null;
  methods: Map<string, ServiceMethod>;
  languages: Array<string>;
  accepts: Array<string>;
  entityName: string | null = null;
}

/**
 * Metadata for REST service methods
 */
export class ServiceMethod {
  name = '';
  path = '';
  resolvedPath = '';
  httpMethod: HttpMethod = 0;
  parameters: Array<Parameter> = new Array<Parameter>();
  middlewares: Array<RequestHandler> = [];
  requiresAuthorization = false;
  requiresAuthentication = false;

  constructor() {
    this.middlewares = new Array<RequestHandler>();
  }

  addMiddleware(middleware: RequestHandler[]) {
    this.middlewares.push(...middleware);
  }
}

/**
 * The factory used to instantiate the object services
 */
export interface ServiceFactory {
  /**
   * Create a new service object. Called before each request handling.
   */
  create: (serviceClass: Function) => any;
  /**
   * Return the type used to handle requests to the target service.
   * By default, returns the serviceClass received, but you can use this
   * to implement IoC integrations.
   */
  getTargetClass: (serviceClass: Function) => FunctionConstructor;
}