/**
 * @constant {number} #MAX_PER_ORDER
 * A private, readonly constant that defines the maximum number of products allowed per order.
 *
 * This value is used to ensure that no order exceeds a predefined limit of products,
 * which in this case is set to 20. The system will throw a validation error if
 * the products array in the request body contains more than 20 items.
 *
 * Example:
 * - Valid: `[ { id: "60c72b2f4f1a2c001f9d4f85", quantity: 10, slotNo: "A1" }, { id: "60c72b2f4f1a2c001f9d4f86", quantity: 5, slotNo: "A2" } ]` (2 items)
 * - Invalid: `[ { id: "60c72b2f4f1a2c001f9d4f85", quantity: 10, slotNo: "A1" }, { id: "60c72b2f4f1a2c001f9d4f86", quantity: 5, slotNo: "A2" }, ... ]` (21 items)
 */
export const MAX_PER_ORDER = 20;

/**
 * @constant {number} #MAX_QUANTITY
 * A private, readonly constant that defines the maximum quantity allowed for each product.
 *
 * This value is used to ensure that no product exceeds a predefined quantity limit,
 * which in this case is set to 30. The system will throw a validation error if
 * any product's quantity exceeds this limit.
 *
 * Example:
 * - Valid: `{ id: "60c72b2f4f1a2c001f9d4f85", quantity: 10, slotNo: "A1" }` (quantity: 10)
 * - Invalid: `{ id: "60c72b2f4f1a2c001f9d4f85", quantity: 31, slotNo: "A1" }` (quantity: 31)
 */
export const MAX_QUANTITY = 30;
