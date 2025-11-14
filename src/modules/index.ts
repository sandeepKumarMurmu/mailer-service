import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { EmailLogsModule } from './email-logs/email-logs.module';
import { FileUploadModule } from './file-upload/file-upload.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '',
        children: [
          { path: 'email', module: EmailLogsModule },
          { path: 'upload', module: FileUploadModule },
        ],
      },
    ]),
    EmailLogsModule,
    FileUploadModule,
  ],
})
export class MainModules {}
