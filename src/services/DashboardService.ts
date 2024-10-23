import { injectable } from 'inversify';

import { PaymentStatus } from '../enums/Order';
import { Transaction } from '../models/Transaction';
import mongoose from 'mongoose';

export interface DashboardService {
  getTotalRevenueByDateRange: (from: Date, to: Date, machine?: string) => Promise<{ amount: number }>;
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
    };

    const pipeline: any[] = [
      {
        $match: matchConditions,
      },
      {
        $lookup: {
          from: 'orders', // The name of the Order collection
          localField: 'order', // Field in Transaction that references the Order
          foreignField: '_id', // Field in Order that is the primary key
          as: 'orderData', // Alias for the populated Order data
        },
      },
      {
        $unwind: '$orderData', // Flatten the array created by $lookup
      },
    ];

    // Conditionally add the machine filter if it is provided
    if (machine) {
      pipeline.push({
        $match: {
          'orderData.machine': new mongoose.Types.ObjectId(machine), // Filter by machine in the populated Order data
        },
      });
    }

    // Add the $group stage to sum the amounts
    pipeline.push({
      $group: {
        _id: null, // Group all matching documents together
        amount: { $sum: '$amount' }, // Sum the 'amount' field
      },
    });

    // Execute the aggregation pipeline
    const totalEarnings = await Transaction.aggregate(pipeline);

    const amount = totalEarnings[0]?.amount ?? 0;

    return { amount };
  }
}
