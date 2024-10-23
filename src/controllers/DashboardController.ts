import { Request } from 'express';
import { inject, injectable } from 'inversify';
import moment from 'moment-timezone';
import { ITransaction } from 'src/models/Transaction';
import { DashboardService } from 'src/services';

import { ContextRequest, Controller, GET } from '../../packages';

@Controller('/dashboards')
@injectable()
export class DashboardController {

  @inject('DashboardService')
  dashboardSv!: DashboardService

  @GET('/v1/revenue/today')
  async getTotalEarningToday(
    @ContextRequest request: Request<any, any, ITransaction>,
  ) {
    // Define timezone as UTC+7 (Asia/Phnom_Penh)
    const timezone = 'Asia/Phnom_Penh';
    const { machine } = request.query;
    // Get the start and end of the day in UTC+7
    const startOfTodayUTC7 = moment.tz(timezone).startOf('day').utc().toDate(); // Convert to UTC
    const endOfTodayUTC7 = moment.tz(timezone).endOf('day').utc().toDate();     // Convert to UTC

    const response = await this.dashboardSv.getTotalRevenueByDateRange(startOfTodayUTC7, endOfTodayUTC7, machine as string);
    return response;
  }
}
