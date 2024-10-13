import { ParamType } from '../enums';

/**
 * Metadata for REST service method parameters
 */
export abstract class Parameter {
  name = '';
  paramType!: ParamType;
}


export class MethodParam extends Parameter {

  constructor(name: string, paramType: ParamType) {
    super();
    this.name = name;
    this.paramType = paramType;
  }
}