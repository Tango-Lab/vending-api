import 'reflect-metadata';
import './services';

import cors from 'cors';
import * as dotenv from 'dotenv';
import express, { Application } from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import morgan from 'morgan';
import * as path from 'path';

import { ErrorCode, HttpError, InternalServerError, MissingParamError, NotFoundError, REST } from '../packages';
import controllers from './controllers';
import Authentications from './middlewares/Authentications';

class Server {
  readonly #app: Application;

  public static bootstrap(): Server {
    return new Server();
  }

  constructor() {
    this.#app = express();
    this.#config();
  }

  #config() {
    dotenv.config();
    this.#app.use(cors());

    // set port server
    this.#app.set('port', process.env.PORT ?? 3000);

    // views
    this.#app.set('views', path.join(__dirname, 'views'));
    this.#app.set('view engine', 'ejs');

    // Morgan logging middleware
    this.#app.use(morgan('dev'));

    // add static paths
    this.#app.use(express.static('public'));

    this.#app.use(express.json());
    this.#app.use(express.urlencoded({ extended: true }));
  }

  #routes() {
    REST.registerAuthorizationMiddleware(Authentications);
    REST.useIoC();
    REST.buildServices(this.#app, '/api', ...controllers);
    this.handlerError();
  }

  private handlerError() {
    // catch 404 and forward to error handler
    this.#app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      const err = new NotFoundError('Not found');
      next(err);
    });

    // catch exceptions
    this.#app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      // Handle known exceptions
      if (err instanceof HttpError) {
        const httpError = err;
        return res.status(httpError.statusCode).json(httpError.toJSON());
      }

      if (err instanceof mongoose.Error.ValidationError) {
        // Handle Mongoose validation errors
        const missingField = Object.keys(err.errors)[0]; // Get the first missing field
        const error = new MissingParamError(missingField);
        return res.status(error.statusCode).json(error.toJSON()); // Throw your custom error
      }

      // Handle uncaught or unknown exceptions
      if (err instanceof Error) {
        const error = new InternalServerError(`Uncaught Exception: ${err.message}`);
        return res.status(ErrorCode.InternalServerError).json(error.toJSON());
      }
      next(err);
    });
  }

  public start() {
    this.#initDatabaseConnection()
      .then(() => {
        this.#app.listen(this.#app.get('port'), () => {
          this.#routes();
          console.log('App is running at http://localhost:%d in %s mode', this.#app.get('port'), this.#app.get('env'));
          console.log('Database Connected!');
          console.log('Press CTRL-C to stop\n');
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  #initDatabaseConnection(): Promise<typeof mongoose> {
    const URL = process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27017';
    const auth: ConnectOptions = {
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASSWORD,
      dbName: process.env.MONGO_DB,
    };
    return mongoose.connect(URL, auth);
  }
}

const server = new Server();
server.start();
