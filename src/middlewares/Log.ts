import express, { NextFunction, Request, Response } from 'express';

export async function loggerA(
  _: express.Request,
  _R: express.Response,
  next: express.NextFunction,
): Promise<void> {
  try {
    console.log('======LOGGER A======');
    next();
  } catch (error) {
    next(error);
  }
}

export async function loggerB(
  _: express.Request,
  _R: express.Response,
  next: express.NextFunction,
) {
  try {
    console.log('======LOGGER B======');
    next();
  } catch (error) {
    next(error);
  }
}

export async function loggerC(
  _: express.Request,
  _R: express.Response,
  next: express.NextFunction,
) {
  try {
    console.log('======LOGGER C======');
    next();
  } catch (error) {
    next(error);
  }
}
