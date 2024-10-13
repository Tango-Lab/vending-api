import express from 'express';

/**
 * Represents the current context of the request being handled.
 */
export class ServiceContext {
  /**
   * The request object.
   */
  request: express.Request;
  /**
   * The response object
   */
  response: express.Response;
  /**
   * The next function. It can be used to delegate to the next middleware
   * registered the processing of the current request.
   */
  next: express.NextFunction;

  constructor(context: ServiceContext) {
    this.request = context.request;
    this.response = context.response;
    this.next = context.next;
  }
}