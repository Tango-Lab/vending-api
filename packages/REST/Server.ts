import { Request, RequestHandler, Response, Router } from 'express';
import { NextFunction } from 'express-serve-static-core';

import { ServiceContext } from './classes';
import { HttpMethod, ParamType } from './enums';
import { pathResolver } from './helpers';
import { ServiceClass, ServiceFactory, ServiceMethod } from './meta';
import { DownloadBinaryData, DownloadResource } from './responses';

export class ServerContainer {
  static serverClasses: Map<string, ServiceClass> = new Map<string, ServiceClass>();
  static paths: Map<string, Set<HttpMethod>> = new Map<string, Set<HttpMethod>>();
  static pathsResolved: boolean = false;

  static serviceFactory: ServiceFactory = {
    create: (serviceClass: any) => {
      return new serviceClass();
    },
    getTargetClass: (serviceClass: Function) => {
      return <FunctionConstructor>serviceClass;
    }
  };

  static authorizationMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    next();
  };

  static registerServiceClass(target: Function): ServiceClass {
    const name: string = target["name"] || target.constructor["name"];
    target = ServerContainer.serviceFactory.getTargetClass(target);

    if (!ServerContainer.serverClasses.has(name)) {
      ServerContainer.serverClasses.set(name, new ServiceClass(target));
    }

    const serviceClass: ServiceClass = ServerContainer.serverClasses.get(name) ?? new ServiceClass(target);
    return serviceClass;
  }

  public rootPrefix = '';
  router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  buildServices(types: Array<Function>) {
    if (types) {
      types = types.map(type => ServerContainer.serviceFactory.getTargetClass(type));
    }
    ServerContainer.serverClasses.forEach(classData => {
      classData.methods.forEach(method => {
        if (this.validateTargetType(classData.targetClass, types)) {
          this.buildService(classData, method);
        }
      });
    });
    ServerContainer.pathsResolved = true;
  }

  static registerServiceMethod(target: Function, methodName: string) {
    const classData: ServiceClass = ServerContainer.registerServiceClass(target);

    if (!classData.methods.has(methodName)) {
      classData.methods.set(methodName, new ServiceMethod());
    }

    return classData.methods.get(methodName) ?? new ServiceMethod();
  }

  async buildService(serviceClass: ServiceClass, serviceMethod: ServiceMethod) {
    const serviceObject = this.createService(serviceClass);
    const paths = [this.rootPrefix, serviceClass.path ?? '', serviceMethod.path ?? '']
    const path = pathResolver(paths);
    serviceMethod.resolvedPath = path;

    const handler = async (request: Request, res: Response, next: NextFunction) => {
      try {
        const context = new ServiceContext({ request, response: res, next });

        const args = this._resolveParameter(serviceMethod, context) as any;
        const response = await serviceObject[serviceMethod.name](...args);

        this._sendComplexValue(res, response);

      } catch (error) {
        next(error)
      }
    }

    this._registerRoute(serviceMethod, handler);
  }

  private async _sendComplexValue(response: Response, value: any) {
    if (value instanceof DownloadBinaryData) {
      return this.sendFile(response, value); // Check type and handle DownloadBinaryData
    }

    if (value instanceof DownloadResource && value.filePath) {
      await this.downloadResToPromise(response, value); // Handle DownloadResource with filePath
      return;
    }

    // Default case: handle as JSON response
    response.json(value);
  }

  private downloadResToPromise(res: Response, value: DownloadResource) {
    return new Promise((resolve, reject) => {
      res.download(value.filePath, value.fileName || value.filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  private _resolveParameter(serviceMethod: ServiceMethod, context: ServiceContext) {
    const parameters = [] as any;
    serviceMethod.parameters.forEach((param) => {
      switch (param.paramType) {
        case ParamType.context_request:
          parameters.push(context.request);
          break;
        case ParamType.context_response:
          parameters.push(context.response);
          break;
        case ParamType.context_next:
          parameters.push(context.next);
        case ParamType.body:
          parameters.push(context.request.body);
        case ParamType.context:
          parameters.push(context);
          break;
        default:
          throw new Error("HttpVerb is not supported!.");
      }
    });
    return parameters;
  }

  private _registerRoute(serviceMethod: ServiceMethod, handler: any) {
    const args = [];

    if (serviceMethod.requiresAuthorization) {
      args.push(ServerContainer.authorizationMiddleware);
    }

    args.push(...serviceMethod.middlewares);
    args.push(handler);

    switch (serviceMethod.httpMethod) {
      case HttpMethod.GET:
        return this.router.get(serviceMethod.resolvedPath, [...args]);
      case HttpMethod.PUT:
        return this.router.put(serviceMethod.resolvedPath, [...args]);
      case HttpMethod.POST:
        return this.router.post(serviceMethod.resolvedPath, [...args]);
      case HttpMethod.PATCH:
        return this.router.patch(serviceMethod.resolvedPath, [...args]);
      case HttpMethod.DELETE:
        return this.router.delete(serviceMethod.resolvedPath, [...args]);

      default:
        throw new Error("HttpMethod is not supported!.");
    }
  }


  private createService(serviceClass: ServiceClass) {
    const serviceObject = ServerContainer.serviceFactory.create(serviceClass.targetClass);
    return serviceObject;
  }

  private validateTargetType(targetClass: Function, types: Array<Function>): boolean {
    if (types && types.length > 0) {
      return (types.indexOf(targetClass) > -1);
    }
    return true;
  }

  private sendFile(res: Response, value: DownloadBinaryData) {
    if (value.fileName) {
      res.writeHead(200, {
        'Content-Length': value.content.length,
        'Content-Type': value.mimeType,
        'Content-disposition': 'attachment;filename=' + value.fileName
      });
    }
    else {
      res.writeHead(200, {
        'Content-Length': value.content.length,
        'Content-Type': value.mimeType
      });
    }
    res.end(value.content);
  }
}