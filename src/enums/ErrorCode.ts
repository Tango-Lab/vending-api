export enum ErrorCode {
  UserDoesNotExist = 1000,
  UserIsExisted = 1001,
  //
  InvalidPassword = 2000,
  InvalidToken = 2001,

  // Exhibition
  VendingMachineDoesNoExisted = 3000,

  // BoothType
  BoothTypeDoesNotExisted = 4000,
  BoothDoesNotExisted = 4001,

  // Exhibition
  OrderProductLimitExceeded = 5000,
  ProductQuantityLimitExceeded = 5001,

  // Transaction
  TransactionDoesNotExisted = 6000,
  OrderItemDoesNotExisted = 6001,
  TransactionHaveNotCompletedYet = 6002,
  TransactionHaveCompleted = 6003,
}
