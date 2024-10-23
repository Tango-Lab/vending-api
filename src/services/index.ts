import { REST } from '../../packages';
import { BakongService, BakongServiceImpl } from './BakongTokenService';
import { DashboardService, DashboardServiceImpl } from './DashboardService';
import { MachineSlotService, MachineSlotServiceImpl } from './MachineSlotService';
import { MachineService, MachineServiceImpl } from './MachinService';
import { OrderService, OrderServiceImpl } from './OrderService';
import { PaymentService, PaymentServiceImpl } from './PaymentService';
import { ProductService, ProductServiceImpl } from './ProductService';
import { SerialPrefixService, SerialPrefixServiceImpl } from './SerialPrefixService';
import { SitAPIService, SitAPIServiceImpl } from './SitAPIService';
import { TransactionService, TransactionServiceImpl } from './TransactionService';
import { UserService, UserServiceImpl } from './UserService';
import { VerificationService, VerificationServiceImpl } from './VerificationSerivce';

REST.register('UserService', UserServiceImpl);
REST.register('VerificationService', VerificationServiceImpl);
REST.register('MachineService', MachineServiceImpl);
REST.register('ProductService', ProductServiceImpl);
REST.register('MachineSlotService', MachineSlotServiceImpl);
REST.register('OrderService', OrderServiceImpl);
REST.register('TransactionService', TransactionServiceImpl);
REST.register('SerialPrefixService', SerialPrefixServiceImpl);
REST.register('PaymentService', PaymentServiceImpl);
REST.register('SitAPIService', SitAPIServiceImpl);
REST.register('BakongService', BakongServiceImpl);
REST.register('DashboardService', DashboardServiceImpl);

export {
  UserService,
  UserServiceImpl,
  VerificationService,
  VerificationServiceImpl,
  MachineService,
  MachineServiceImpl,
  ProductService,
  ProductServiceImpl,
  MachineSlotServiceImpl,
  MachineSlotService,
  OrderService,
  OrderServiceImpl,
  TransactionService,
  TransactionServiceImpl,
  SerialPrefixServiceImpl,
  SerialPrefixService,
  PaymentService,
  PaymentServiceImpl,
  SitAPIService,
  SitAPIServiceImpl,
  BakongService,
  BakongServiceImpl,
  DashboardService,
  DashboardServiceImpl,
};
