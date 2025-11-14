import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailLogsService } from './email-logs.service';
import { EmailLogsController } from './email-logs.controller';
import { EmailLog, EmailLogSchema } from '../../config/entity/email-log.schema';

@Module({
  controllers: [EmailLogsController],
  imports: [
    MongooseModule.forFeature([
      { name: EmailLog.name, schema: EmailLogSchema },
    ]),
  ],
  providers: [EmailLogsService],
  exports: [EmailLogsService],
})
export class EmailLogsModule {}
