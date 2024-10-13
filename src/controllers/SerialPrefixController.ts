import { inject, injectable } from 'inversify';

import { Controller } from '../../packages';
import { SerialPrefixService } from '../services';

@Controller('/serial-prefixes')
@injectable()
export class SerialPrefixController {
  @inject('SerialPrefixService')
  SerialPrefixSv!: SerialPrefixService;
}
