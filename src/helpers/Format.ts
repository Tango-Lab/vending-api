import { OrderStatus } from '../enums/Order';

export class FormatHelper {
  static formatOrderStatus(status: number) {
    if (status === OrderStatus.Cancelled) {
      return 'Cancelled';
    }
    if (status === OrderStatus.Completed) {
      return 'Completed';
    }
    return 'Pending';
  }
}
