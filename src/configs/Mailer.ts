import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import * as path from 'path';

export default class Mailer<T extends Object> {
  dataSource: T;
  templateDir: string;
  options: Mail.Options;

  private readonly _email: string | undefined = process.env.MAIL_USER;
  private readonly _password: string | undefined = process.env.MAIL_PASSWORD;
  private readonly _templateDir = '/templates';

  /**
   * @example - '/src/templates/.....'
   */
  get mailTemplate(): string {
    return path.join(__dirname, '..', this._templateDir, this.templateDir);
  }

  constructor(mailTemplateDir: string, dataSource: T, options: Mail.Options) {
    if (!this._email) {
      throw new Error('Missing MAIL_USER');
    }
    if (!this._password) {
      throw new Error('Missing MAIL_PASSWORD');
    }

    this.options = options;
    this.dataSource = dataSource;
    this.templateDir = mailTemplateDir;
  }

  transporter() {
    return nodemailer.createTransport({
      service: process.env.MAIL_SERVICE ?? 'gmail',
      auth: {
        user: this._email,
        pass: this._password,
      },
    });
  }

  async send() {
    try {
      this.options.html = this._compileHTMLTemplate();
      await this.transporter().sendMail(this.options);
      console.log('Email sent successfully.');
    } catch (error: any) {
      console.error('Error sending email:', error);
      throw new Error(error?.message);
    }
  }

  private _compileHTMLTemplate() {
    const file = fs.readFileSync(this.mailTemplate, 'utf-8');
    const compiler = handlebars.compile(file);
    return compiler(this.dataSource);
  }
}
