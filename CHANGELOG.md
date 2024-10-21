# Release Notes

## v1.0.3-beta

### Fixes

- **Ordering Module:**

  - Updated the ordering process to ensure that all orders with a "pending" status are changed to "cancel" when a new order is placed.

## v1.0.2-beta [18-Oct-2024]

### Fixes

- **Ordering Module:**

  - Fixed issue where quantities were summed by id instead of by slot No.

- **Vending Machine Module:**

  - Added functionality to list vending machines ordered by createdAt.

- **LINT:**

  - Improved linting across the entire codebase for better code quality.

## v1.0.1-beta [15-Oct-2024]

### Fixes

- **Product Module:**

  - Added ordering by created date (DESC) on the admin product listing page.
  - Removed unused APIs in the product listing functionality.

- **Vending Machine Module:**

  - Updated the logic to adjust the available quantity when restocking instead of inserting a new record.

- **LINT:**

  - Improved linting throughout the source code.

## v1.0.0-beta [13-Oct-2024]

### Features

- **Authentication Module:**

  - Admin login, and token-based authentication.

- **Product Management Module:**

  - Create, update, and manage products within the system.
  - Supports product categorization and inventory tracking.

- **Vending Machine Module:**

  - Manage vending machines and their related configurations.
  - Track machine status, available slots, and restocking information.

- **Order Module:**

  - Allows users to place and track orders.
  - Handles order status updates and notifications.

- **Payment Module (Bakong Integration):**
  - Supports payments through the Bakong system.
  - Secure transaction handling and real-time confirmation.
