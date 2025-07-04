import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(email: string, password: string): Promise<User> {
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = this.repo.create({ email, password: hashed });
    return this.repo.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.repo.findOne({ where: { email } }) ?? undefined;
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.repo.update(id, updateData);
    return await this.repo.findOneOrFail({ where: { id } });
  }

  async comparePasswords(raw: string, hash: string): Promise<boolean> {
    return bcrypt.compare(raw, hash);
  }
}
