import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';

@Controller()
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  // Single file upload
  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: new FileUploadService().getStorage(),
    }),
  )
  uploadSingle(@UploadedFile() file: Express.Multer.File) {
    return this.fileUploadService.formatSingleFileResponse(file);
  }

  // Multiple file upload
  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: new FileUploadService().getStorage(),
    }),
  )
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    return this.fileUploadService.formatMultipleFilesResponse(files);
  }
}
