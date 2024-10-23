import { Request } from 'express';
import { inject, injectable } from 'inversify';
import moment from 'moment-timezone';
import { ITransaction } from 'src/models/Transaction';
import { DashboardService } from 'src/services';

import { BadRequestError, ContextRequest, Controller, GET } from '../../packages';

@Controller('/dashboards')
@injectable()
export class DashboardController {
  @inject('DashboardService')
  dashboardSv!: DashboardService;

  @GET('/v1/revenue')
  async getTotalEarningToday(@ContextRequest request: Request<any, any, ITransaction>) {
    const timezone = 'Asia/Phnom_Penh';
    const { machine, from, to } = request.query;

    // Get the start and end of the day in UTC+7
    let startOfTodayUTC7 = moment.tz(timezone).startOf('day').utc().toDate(); // Convert to UTC
    let endOfTodayUTC7 = moment.tz(timezone).endOf('day').utc().toDate(); // Convert to UTC

    // Adjust start and end dates if 'from' and 'to' parameters are provided
    if (from) {
      startOfTodayUTC7 = moment
        .tz(from as string, 'DD-MM-YYYY', timezone)
        .startOf('day')
        .utc()
        .toDate(); // Convert to UTC

      if (!moment(startOfTodayUTC7).isValid()) {
        throw new BadRequestError('Invalid Date Format');
      }
    }

    if (to) {
      endOfTodayUTC7 = moment
        .tz(to as string, 'DD-MM-YYYY', timezone)
        .endOf('day')
        .utc()
        .toDate(); // Convert to UTC

      if (!moment(endOfTodayUTC7).isValid()) {
        throw new BadRequestError('Invalid Date Format');
      }
    }

    const response = await this.dashboardSv.getTotalRevenueByDateRange(
      startOfTodayUTC7,
      endOfTodayUTC7,
      machine as string,
    );
    return response;
  }
}
