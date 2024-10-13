import { Request } from 'express';
import mongoose from 'mongoose';

import { BadRequestError, MissingParamError } from '../../packages/';
import { ErrorCode } from '../enums/ErrorCode';

// Define the interface
export interface PaymentParamHelper {
  machine: string; // Machine is represented as an ObjectId in string format
  note?: string | null;
  orderNo: string;
  orderId: string;
  serialNo: string;
}

// Define the validation rules type
interface ValidationRules {
  isRequired?: boolean;
  isObjectId?: boolean;
  isArray?: boolean;
  isPositiveInteger?: boolean;
  minLength?: number;
  maxLength?: number;
  itemRules?: {
    [key: string]: ValidationRules;
  };
  type?: string;
  maxQuantity?: number;
}

export type ValidationRulesMap = {
  [K in keyof PaymentParamHelper]: ValidationRules;
};

/**
 * OrderParamsChecker is a class designed to assist with validating the request body
 * of an order in an Express.js application. It primarily ensures that the machine
 * identifier, serial number, and the list of products meet predefined criteria
 * before processing the order.
 *
 * Key Responsibilities:
 * 1. **Validation of Machine and Serial Number:**
 *    - The `machine` field is expected to be a valid MongoDB ObjectId (string format).
 *      - Example: `"60c72b2f4f1a2c001f9d4f84"`
 *    - The `serialNo` field must be a non-empty string.
 *      - Example: `"ABC123"`
 *
 * 2. **Validation of Products Array:**
 *    - Ensures the 'products' field is an array with at least one item.
 *      - Example: `[ { id: "60c72b2f4f1a2c001f9d4f85", quantity: 10, slotNo: "A1" } ]`
 *    - Validates each product in the array, checking the following:
 *      - `id`: Must be a valid MongoDB ObjectId.
 *        - Example: `"60c72b2f4f1a2c001f9d4f85"`
 *      - `quantity`: Must be a positive integer and within the maximum allowed quantity.
 *        - Example: `10`
 *      - `slotNo`: Must be a non-empty string.
 *        - Example: `"A1"`
 *
 * 3. **Maximum Product Limit:**
 *    - The class enforces a maximum number of products per order, defined by the
 *      private constant `#maxPerOrder`, which is set to 20. If the number of products
 *      exceeds this limit, a `BadRequestError` is thrown.
 *      - Example: If an order contains 21 products, an error will be thrown.
 *
 * 4. **Maximum Quantity Limit per Product:**
 *    - The class also enforces a maximum allowed quantity for each product, defined
 *      by the private constant `#maxQuantity`, which is set to 30. If the quantity
 *      of any product exceeds this limit, a `BadRequestError` is thrown.
 *      - Example: If a product has a quantity of 31, an error will be thrown.
 *
 * This class enhances code modularity by separating validation logic and provides a
 * structured approach to handle common request validations for order processing.
 */
export class OrderParamsChecker {
  #requestBody!: PaymentParamHelper;

  /**
   * @constant {object} #VALIDATION_RULES
   * Defines the validation rules for the order parameters.
   * - **machine**: Must be a required string and a valid ObjectId.
   *   - Example: `"60c72b2f4f1a2c001f9d4f84"`
   * - **serialNo**: Must be a required string.
   *   - Example: `"ABC123"`
   * - **products**: Must be an array with a minimum length of 1 and a maximum length of 20.
   *   Each item in the array must follow specific rules:
   *     - **id**: Must be a required string and a valid ObjectId.
   *       - Example: `"60c72b2f4f1a2c001f9d4f85"`
   *     - **quantity**: Must be a required positive integer and within a maximum quantity of 30.
   *       - Example: `10`
   *     - **slotNo**: Must be a required string.
   *       - Example: `"A1"`
   */
  #VALIDATION_RULES!: ValidationRulesMap;

  constructor(request: Request<any, any, PaymentParamHelper>, param: ValidationRulesMap) {
    if (!request.body) {
      throw new Error('Request body is missing');
    }
    if (!param) {
      throw new Error('Validation Is Missing');
    }

    this.#VALIDATION_RULES = param;
    this.#requestBody = request.body;

    this.#validate();
  }

  /**
   * Retrieves the validated parameters from the request body.
   *
   * This method returns the validated order parameters that were initially passed
   * to the constructor. It can be used to access the parameters after validation
   * has been performed.
   *
   * Example:
   * ```typescript
   * const checker = new OrderParamsChecker(request);
   * const params = checker.getParams();
   * console.log(params.machine); // Outputs: "60c72b2f4f1a2c001f9d4f84"
   * console.log(params.serialNo); // Outputs: "ABC123"
   * console.log(params.products); // Outputs: [ { id: "60c72b2f4f1a2c001f9d4f85", quantity: 10, slotNo: "A1" } ]
   * ```
   *
   * @returns {OrderRequestParams} The validated request parameters.
   */
  getParams(): PaymentParamHelper {
    const validatedParams: Partial<PaymentParamHelper> = {};
    const paramKeys = Object.keys(this.#VALIDATION_RULES) as (keyof PaymentParamHelper)[];

    paramKeys.forEach((key) => {
      if (this.#requestBody.hasOwnProperty(key) && key) {
        Object.assign(validatedParams, { [key]: this.#requestBody[key] });
      }
    });

    return validatedParams as PaymentParamHelper;
  }

  /**
   * Performs the validation for the machine and serialNo fields.
   * Calls #validateOrderedProduct to handle the validation of products.
   */
  #validate() {
    const { serialNo, machine, orderId, orderNo, note } = this.#requestBody;

    this.#validateField(machine, 'machine', this.#VALIDATION_RULES.machine);
    this.#validateField(serialNo, 'serialNo', this.#VALIDATION_RULES.serialNo);
    this.#validateField(orderId, 'orderId', this.#VALIDATION_RULES.orderId);
    this.#validateField(orderNo, 'orderNo', this.#VALIDATION_RULES.orderNo);
    this.#validateField(note, 'note', this.#VALIDATION_RULES.note);
  }

  #validateField(value: any, fieldName: string, rules?: ValidationRules) {
    if (!rules) {
      return;
    }
    if (rules.isRequired && (value === undefined || value === null || value === '')) {
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
  }

  /**
   * Checks if the given value is a positive integer and throws a MissingParamError if not.
   *
   * @param value - The value to check.
   * @param paramName - The name of the parameter to include in the error message.
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
