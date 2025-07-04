import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // 1️⃣ Validates credentials by comparing raw password to stored hash
  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user && await this.userService.comparePasswords(password, user.password)) {
      const { password: _pw, ...rest } = user;
      return rest;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  // 2️⃣ Login returns a JWT
  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { email: user.email, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  // 3️⃣ Register: pass raw password to UserService.create (which will hash once)
  async register(email: string, password: string) {
    if (await this.userService.findByEmail(email)) {
      throw new BadRequestException('Email already in use');
    }

    // <-- No hashing here; UserService.create will hash once!
    const user = await this.userService.create(email, password);

    // Signup → send verification email
    const payload = { email: user.email, sub: user.id };
    const verificationToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    try {
      await this.emailService.sendVerificationEmail(user.email, verificationToken);
    } catch (err) {
      this.logger.error('Could not send verification email', err);
    }

    return { message: 'Registration successful. Check your inbox to verify.' };
  }

  // 4️⃣ Verify email link
  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify<{ email: string }>(token);
      const user = await this.userService.findByEmail(decoded.email);
      if (!user) throw new UnauthorizedException('Invalid link');
      await this.userService.update(user.id, { verified: true });
      return { message: 'Email verified' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // 5️⃣ Password reset request
  async requestPasswordReset(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const resetToken = this.jwtService.sign(
      { email: user.email, sub: user.id },
      { expiresIn: '1h' },
    );
    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (err) {
      this.logger.error('Could not send reset email', err);
    }
    return { message: 'Password reset email sent' };
  }

  // 6️⃣ Reset password using the token
  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify<{ email: string }>(token);
      const user = await this.userService.findByEmail(decoded.email);
      if (!user) throw new UnauthorizedException('Invalid link');

      // <-- again, pass raw newPassword; UserService.update will handle hashing
      await this.userService.update(user.id, { password: newPassword });
      return { message: 'Password reset successful' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
