import * as dotenv from 'dotenv';

dotenv.config();
export class Utils {
  static generateVerificationCode(): string {
    if (process.env.VERIFICATION_CODE_ENABLED == 'true') {
      // Generate a random 6-digit number and pad with leading zeros if necessary
      return Math.floor(100000 + Math.random() * 900000).toString();
    }

    return '1111';
  }
}
