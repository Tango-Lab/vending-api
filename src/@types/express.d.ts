// types/express.d.ts or any appropriate .d.ts file

import mongoose from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      userId?: mongoose.Types.ObjectId; // or string if that's your choice
      orderId?: mongoose.Types.ObjectId; // or string if that's your choice
      email?: string; // or string if that's your choice
    }
  }
}
