import 'reflect-metadata';

import { ServiceClass } from '../meta';
import { ServerContainer } from '../Server';

/**
 * A decorator to tell the [[Server]] that a class or a method
 * should be bound to a given path.
 *
 * For example:
 *
 * ```
 * @ Controller("people")
 * class PeopleService {
 *   @ PUT(":id")
 *   savePerson(person:Person) {
 *      // ...
 *   }
 *
 *   @ GET (":id")
 *   getPerson():Person {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create services that listen for requests like:
 *
 * ```
 * PUT http://mydomain/people/123 or
 * GET http://mydomain/people/123
 * ```
 */
export function Controller(path: string) {
  return (target: Function) => {
    return PathTypeDecorator(target, path);
  }
}

/**
 * Decorator processor for [[Controller]] decorator on classes
 */
function PathTypeDecorator(target: Function, path: string) {
  const classData: ServiceClass = ServerContainer.registerServiceClass(target);
  classData.path = path;
}