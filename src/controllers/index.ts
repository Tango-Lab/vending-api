import { REST } from '../../packages';
import { AuthenticationController } from './AuthenticationController';
import { DashboardController } from './DashboardController';
import { FileController } from './FileController';
import { MachineController } from './MachineController';
import { MachineSlotController } from './MachineSlotController';
import { OrderController } from './OrderController';
import { PaymentController } from './PaymentController';
import { ProductController } from './ProductController';
import { ProfileController } from './ProfileController';
import { SerialPrefixController } from './SerialPrefixController';
import { VerificationController } from './VerificationController';

REST.register('AuthenticationController', AuthenticationController);
REST.register('FileController', FileController);
REST.register('ProfileController', ProfileController);
REST.register('VerificationController', VerificationController);
REST.register('MachineController', MachineController);
REST.register('ProductController', ProductController);
REST.register('MachineSlotController', MachineSlotController);
REST.register('OrderController', OrderController);
REST.register('SerialPrefixController', SerialPrefixController);
REST.register('PaymentController', PaymentController);
REST.register('DashboardController', DashboardController);

export default [
  FileController,
  AuthenticationController,
  ProfileController,
  VerificationController,
  MachineController,
  ProductController,
  MachineSlotController,
  OrderController,
  SerialPrefixController,
  PaymentController,
  DashboardController,
];
