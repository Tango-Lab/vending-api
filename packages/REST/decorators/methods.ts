import { HttpMethod } from '../enums';
import { ServiceMethod } from '../meta';
import { ServerContainer } from '../Server';

/**
 * A decorator to tell the [[Server]] that a method
 * should be called to process HTTP GET requests.
 *
 * For example:
 *
 * ```
 * @ Controller('people')
 * class PeopleService {
 *   @ GET('people')
 *   getPeople() {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * GET http://mydomain/people
 * ```
 */
export function GET(path: string) {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    processHttpVerb(target, propertyKey, HttpMethod.GET, path);
  }
}

/**
 * A decorator to tell the [[Server]] that a method
 * should be called to process HTTP POST requests.
 *
 * For example:
 *
 * ```
 * @ Controller('people')
 * class PeopleService {
 *   @ PUT('create')
 *   addPerson() {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * POST http://mydomain/people
 * ```
 */
export function PUT(path: string) {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    processHttpVerb(target, propertyKey, HttpMethod.PUT, path);
  }
}

/**
 * A decorator to tell the [[Server]] that a method
 * should be called to process HTTP POST requests.
 *
 * For example:
 *
 * ```
 * @ Controller('people')
 * class PeopleService {
 *   @ POST('create')
 *   addPerson() {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * POST http://mydomain/people
 * ```
 */
export function POST(path: string) {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    processHttpVerb(target, propertyKey, HttpMethod.POST, path);
  }
}

/**
 * A decorator to tell the [[Server]] that a method
 * should be called to process HTTP POST requests.
 *
 * For example:
 *
 * ```
 * @ Controller('people')
 * class PeopleService {
 *   @ PATCH('create')
 *   addPerson() {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * POST http://mydomain/people
 * ```
 */
export function PATCH(path: string) {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    processHttpVerb(target, propertyKey, HttpMethod.PATCH, path);
  }
}

/**
 * A decorator to tell the [[Server]] that a method
 * should be called to process HTTP POST requests.
 *
 * For example:
 *
 * ```
 * @ Controller('people')
 * class PeopleService {
 *   @ DELETE('create')
 *   addPerson() {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * POST http://mydomain/people
 * ```
 */
export function DELETE(path: string) {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    processHttpVerb(target, propertyKey, HttpMethod.DELETE, path);
  }
}

function processHttpVerb(target: Object, propertyKey: string,
  httpMethod: HttpMethod, path: string): void {
  const serviceMethod: ServiceMethod = ServerContainer.registerServiceMethod(target.constructor, propertyKey);
  serviceMethod.httpMethod = httpMethod;
  serviceMethod.path = path;
  serviceMethod.name = propertyKey;
}