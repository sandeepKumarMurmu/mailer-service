import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { EmailLogsService } from './email-logs.service';
import { GetEmailsDto, SendMailDto } from './email.dto';

@Controller()
export class EmailLogsController {
  private readonly logger = new Logger(EmailLogsController.name);
  constructor(private readonly emailLogsService: EmailLogsService) {}

  @Post()
  async sendMail(@Body() body: SendMailDto) {
    try {
      this.logger.log('Sending email with data:', JSON.stringify(body));
      return this.emailLogsService.sendMail(body);
    } catch (error) {
      this.logger.error('Error sending mail:', error.message);
      return { error: 'Failed to send email', details: error.message };
    }
  }

  @Get()
  async getEmailLogs(@Query() query: GetEmailsDto) {
    return await this.emailLogsService.getEmailLogs(query);
  }
}
