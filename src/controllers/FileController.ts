import * as express from 'express';
import { injectable } from 'inversify';

import { ContextRequest, Controller, Middleware, POST } from '../../packages';
import Multer from '../middlewares/multer';
import { FileStorage } from '../utils/FileStorage';

@Controller('/file')
@injectable()
export class FileController {
  @POST('/v1/upload')
  @Middleware(Multer)
  async uploadFiles(@ContextRequest request: express.Request) {
    const { folderName = '', fileName = '' } = request.body;
    const file = await new FileStorage({
      fileName,
      folderName,
      request,
    }).write();
    return file;
  }
}
