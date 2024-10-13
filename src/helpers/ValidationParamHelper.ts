import { Request } from 'express';
import mongoose from 'mongoose';

import { BadRequestError, MissingParamError } from '../../packages/';
import { ErrorCode } from '../enums/ErrorCode';

// Define the validation rules type
interface ValidationRules {
  isRequired?: boolean;
  isObjectId?: boolean;
  isArray?: boolean;
  isPositiveInteger?: boolean;
  minLength?: number;
  maxLength?: number;
  allowNull?: boolean;
  itemRules?: {
    [key: string]: ValidationRules;
  };
  type?: string;
  maxQuantity?: number;
}

export type ValidationRulesMap<T> = {
  [K in keyof T]: ValidationRules;
};

/**
 * GenericParamsChecker is a class designed to assist with validating the request body
 * of any object in an Express.js application. It ensures that each field in the request
 * body meets predefined validation rules passed to the class during construction.
 */
export class GenericParamsChecker<T> {
  #requestBody!: T;
  #VALIDATION_RULES!: ValidationRulesMap<T>;

  constructor(request: Request<any, any, T>, param: ValidationRulesMap<T>) {
    if (!request.body) {
      throw new Error('Request body is missing');
    }
    if (!param) {
      throw new Error('Validation rules are missing');
    }

    this.#VALIDATION_RULES = param;
    this.#requestBody = request.body;

    this.#validate();
  }

  /**
   * Retrieves the validated parameters from the request body.
   *
   * This method returns the validated parameters that were initially passed
   * to the constructor. It can be used to access the parameters after validation
   * has been performed.
   */
  getParams(): T {
    const validatedParams: Partial<T> = {};
    const paramKeys = Object.keys(this.#VALIDATION_RULES) as (keyof T)[];

    paramKeys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(this.#requestBody, key)) {
        Object.assign(validatedParams, { [key]: this.#requestBody[key] });
      }
    });

    return validatedParams as T;
  }

  /**
   * Performs validation on all fields based on the provided rules.
   */
  #validate() {
    const paramKeys = Object.keys(this.#VALIDATION_RULES) as (keyof T)[];

    paramKeys.forEach((key) => {
      const rules = this.#VALIDATION_RULES[key];
      const value = this.#requestBody[key];

      this.#validateField(value, String(key), rules);
    });
  }

  #validateField(value: any, fieldName: string, rules: ValidationRules) {
    if (rules.allowNull) {
      // If allowNull is true, we skip the isRequired check
      if (value === null) {
        return;
      }
    } else if (rules.isRequired && (value === undefined || value === null || value === '')) {
      throw new MissingParamError(fieldName);
    }

    if (rules.type && typeof value !== rules.type) {
      throw new BadRequestError(`'${fieldName}' must be of type ${rules.type}`);
    }

    if (rules.isObjectId && !this.#isObjectId(value)) {
      throw new BadRequestError(`'${fieldName}' must be a valid ObjectId`);
    }

    if (rules.isPositiveInteger) {
      this.#isPositiveInteger(value, fieldName, rules.maxQuantity);
    }

    if (rules.isArray) {
      this.#validateArray(value, fieldName, rules);
    }
  }

  #validateArray(array: any[], fieldName: string, rules: ValidationRules) {
    if (!Array.isArray(array)) {
      throw new MissingParamError(fieldName);
    }

    if (rules.minLength && array.length < rules.minLength) {
      throw new MissingParamError(`${fieldName} must have at least ${rules.minLength} items`);
    }

    if (rules.maxLength && array.length > rules.maxLength) {
      throw new BadRequestError(`${fieldName} must not exceed ${rules.maxLength} items`);
    }

    if (rules.itemRules) {
      array.forEach((item, index) => {
        for (const [key, itemRules] of Object.entries(rules.itemRules as ValidationRules)) {
          this.#validateField(
            item[key],
            `${fieldName}[${index}].${key}`,
            itemRules as ValidationRules,
          );
        }
      });
    }
  }

  /**
   * Checks if the given value is a positive integer and throws an error if not.
   */
  #isPositiveInteger(value: number, paramName: string, maxQuantity?: number) {
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
      throw new MissingParamError(paramName);
    }

    if (maxQuantity && value > maxQuantity) {
      throw new BadRequestError(
        `${paramName} must not exceed ${maxQuantity} items`,
        ErrorCode.ProductQuantityLimitExceeded,
      );
    }
  }

  #isObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }
}
