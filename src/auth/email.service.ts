// src/auth/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get<string>('EMAIL_USER'),
        pass: this.config.get<string>('EMAIL_PASS'),
      },
    });

    this.transporter.verify((err, success) => {
      if (err) this.logger.error('SMTP config error', err);
      else this.logger.log('Email transporter ready');
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `http://localhost:3000/auth/verify-email?token=${token}`;
    const mailOptions = {
      from: this.config.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <h2>Email Verification</h2>
        <p>Please verify your email by clicking the link below:</p>
        <p><a href="${url}">${url}</a></p>
      `,
    };
    return this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const url = `http://localhost:3000/auth/reset-password?token=${token}`;
    const mailOptions = {
      from: this.config.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${url}">${url}</a></p>
      `,
    };
    return this.transporter.sendMail(mailOptions);
  }
}
