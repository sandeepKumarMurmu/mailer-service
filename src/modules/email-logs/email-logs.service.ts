import * as dotenv from 'dotenv';
dotenv.config();

import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { existsSync, unlinkSync } from 'fs';
import { GetEmailsDto, SendMailDto } from './email.dto';
import { EmailLog, MailStatus } from '../../config/entity/email-log.schema';

interface EmailLogLean {
  _id: string;
  to: string;
  from: string;
  subject: string;
  cc?: string;
  bcc?: string;
  html?: string;
  text?: string;
  status: MailStatus;
  messageId?: string;
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class EmailLogsService {
  private readonly logger = new Logger(EmailLogsService.name);
  private readonly transporter;
  private formatDateTime(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hourStr = String(hours).padStart(2, '0');

    return `${day}-${month}-${year} ${hourStr}:${minutes}${ampm}`;
  }

  // Handle mail sending in background
  private async sendMailInBackground(payload: SendMailDto, logId: string) {
    try {
      const mailOptions: Record<string, any> = {
        from: process.env.MAIL_USER,
        to: payload.to,
        subject: payload.subject,
      };

      if (payload.text) mailOptions.text = payload.text;
      if (payload.html) mailOptions.html = payload.html;
      if (payload.cc) mailOptions.cc = payload.cc;
      if (payload.bcc) mailOptions.bcc = payload.bcc;
      if (payload.attachments?.length)
        mailOptions.attachments = payload.attachments;

      // Send mail
      const info = await this.transporter.sendMail(mailOptions);

      // Update log to sent
      await this.emailLogModel.findByIdAndUpdate(logId, {
        status: MailStatus.SENT,
        messageId: info.messageId,
      });

      this.logger.log(
        `Mail sent to ${payload.to}, Message ID: ${info.messageId}`,
      );

      //  Delete files after successful send
      if (payload.attachments?.length) {
        payload.attachments.forEach((file) => this.deleteFile(file.path));
      }
    } catch (error) {
      // Update log to failed
      await this.emailLogModel.findByIdAndUpdate(logId, {
        status: MailStatus.FAILED,
        errorMessage: error.message,
      });

      this.logger.error(`Mail send failed for ${payload.to}: ${error.message}`);
      // Delete files even if sending failed
      if (payload.attachments?.length) {
        payload.attachments.forEach((file) => this.deleteFile(file.path));
      }
    }
  }

  private deleteFile(path?: string) {
    try {
      if (path && existsSync(path)) {
        unlinkSync(path);
        this.logger.log(`Deleted file: ${path}`);
      }
    } catch (err) {
      this.logger.warn(`Failed to delete file ${path}: ${err.message}`);
    }
  }

  constructor(
    @InjectModel(EmailLog.name)
    private readonly emailLogModel: Model<EmailLog>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD, // Gmail app password
      },
    });
  }

  // Queue mail and send it in background
  async sendMail(payload: SendMailDto) {
    try {
      // Create log entry with pending status
      const log = new this.emailLogModel({
        to: payload.to,
        from: process.env.MAIL_USER,
        subject: payload.subject,
        cc: payload.cc,
        bcc: payload.bcc,
        text: payload.text,
        html: payload.html,
        status: MailStatus.PENDING,
      });

      await log.save();
      this.logger.log(`Queued email to ${payload.to}`);

      const logId = log._id?.toString();
      // Run background task without blocking response
      this.sendMailInBackground(payload, logId)
        .then(() =>
          this.logger.log(`Background task started for ${payload.to}`),
        )
        .catch((err) =>
          this.logger.error(`Background task failed: ${err.message}`),
        );

      // Return immediately
      return {
        success: true,
        message: 'Email queued successfully',
        logId: log._id,
      };
    } catch (error) {
      this.logger.error('Failed to queue email', error.stack);
      throw new InternalServerErrorException('Failed to queue email');
    }
  }

  async getEmailLogs(query: GetEmailsDto) {
    try {
      const { page, limit, status, search, from, to } = query;
      const filter: FilterQuery<EmailLog> = {};

      if (status && Object.values(MailStatus).includes(status)) {
        filter.status = status;
      }

      if (from) filter.from = from;
      if (to) filter.to = to;

      if (search) {
        filter.$or = [
          { subject: { $regex: search, $options: 'i' } },
          { from: { $regex: search, $options: 'i' } },
          { to: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;

      // Query database and count concurrently
      const [data, total] = await Promise.all([
        this.emailLogModel
          .find(filter)
          .select('-__v')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean<EmailLogLean[]>(),
        this.emailLogModel.countDocuments(filter),
      ]);

      // Format timestamps
      const formattedData = data.map((item) => ({
        ...item,
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      }));

      return {
        success: true,
        message: 'Email logs fetched successfully',
        data: formattedData,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching email logs', error.stack);
      return {
        success: false,
        message: 'Failed to fetch email logs',
        error: error.message || 'Internal Server Error',
      };
    }
  }
}
