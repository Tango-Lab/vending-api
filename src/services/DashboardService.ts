import { injectable } from 'inversify';

import { PaymentStatus } from '../enums/Order';
import { Transaction } from '../models/Transaction';

export interface DashboardService {
  getTotalRevenueByDateRange: (from: Date, to: Date, machine?: string) => Promise<{ amount: number }>
}

@injectable()
export class DashboardServiceImpl {

  async getTotalRevenueByDateRange(from: Date, to: Date, machine?: string) {
    const matchConditions: any = {
      status: PaymentStatus.Completed,
      paymentTimestamp: {
        $gte: from,
        $lt: to,
      },
    }

    if (machine) {
      matchConditions['machine'] = machine; // Assuming machine is an ObjectId
    }

    const totalEarnings = await Transaction.aggregate([
      {
        $match: matchConditions,
      },
      {
        $group: {
          _id: null, // Grouping all matching documents together
          amount: { $sum: '$amount' },
        },
      },
    ]);

    const amount = totalEarnings[0]?.amount ?? 0;

    return { amount };
  }
}
