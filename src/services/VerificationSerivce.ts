import { inject, injectable } from 'inversify';
import moment from 'moment';

import { BadRequestError } from '../../packages';
import Mailer from '../configs/Mailer';
import { VerificationType } from '../enums/VerificationType';
import Verification, { IVerifications } from '../models/Verifications';
import { Utils } from '../utils';
import { hashPassword, validatePassword } from '../utils/bycryp';
import { UserService } from './UserService';

export interface VerificationService {
  create: (email: string) => Promise<IVerifications>;
  validate: (email: string, code: string) => Promise<IVerifications>;
}

@injectable()
export class VerificationServiceImpl implements VerificationService {
  @inject('UserService')
  userService!: UserService;

  async create(email: string): Promise<IVerifications> {
    let verification = await this.#findByTypeEmailWhereHasExpired(email);
    if (verification) {
      throw new BadRequestError('We have sent verification to this email!');
    }
    const code = Utils.generateVerificationCode();
    verification = new Verification();
    verification.recipient = email;
    verification.verificationCode = hashPassword(code);
    verification.type = VerificationType.EMAIL;
    verification.expiresAt = moment().add(60, 'second').toDate();
    verification.createdAt = new Date();
    verification = await verification.save();
    const templateDir = '/emails/verifications.html';
    const subject = 'Account Verification';
    await this.#sentEmail(templateDir, email, code, subject);
    return verification;
  }

  async validate(recipient: string, code: string) {
    const verification = await this.#findTheLatestOneByType(recipient);
    if (!verification || verification?.expiresAt < new Date()) {
      throw new BadRequestError('Invalid Verification');
    }
    const isValid = validatePassword(code, verification.verificationCode);
    if (!isValid) {
      throw new BadRequestError('Invalid Verification');
    }
    return verification;
  }

  async #findTheLatestOneByType(recipient: string, type = VerificationType.EMAIL) {
    const verification = await Verification.findOne({ recipient, type })
      .sort({ createdAt: -1 }) // Sort by `createdAt` in descending order
      .limit(1);
    return verification;
  }

  async isValidVerification(recipient: string, code: string): Promise<boolean> {
    const verification = await Verification.findOne({
      recipient,
      type: VerificationType.EMAIL,
    })
      .sort({ createdAt: -1 }) // Sort by `createdAt` in descending order
      .limit(1);

    if (!verification || verification?.expiresAt < new Date()) {
      return false;
    }
    return validatePassword(code, verification.verificationCode);
  }

  async #findByTypeEmailWhereHasExpired(email: string) {
    return Verification.findOne({
      recipient: email,
      type: VerificationType.EMAIL,
      expiresAt: { $gt: new Date() },
    });
  }

  async #sentEmail(
    templateDir: string,
    recipientMail: string,
    verificationCode: string,
    subject: string,
  ): Promise<void> {
    const dataSource = { verificationCode };
    const mailer = new Mailer(templateDir, dataSource, {
      to: recipientMail,
      subject,
    });
    return mailer.send();
  }
}
