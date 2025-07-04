import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Rule } from '../rule/rule.entity';
import { Category } from '../category/category.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,

    @InjectRepository(Rule)
    private ruleRepo: Repository<Rule>,

    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(data: Partial<Transaction>) {
    if (!data.categoryId && data.description) {
      const rules = await this.ruleRepo.find();
      for (const rule of rules) {
        if (data.description.toLowerCase().includes(rule.keyword.toLowerCase())) {
          data.categoryId = rule.categoryId;
          break;
        }
      }
    }

    if (data.categoryId) {
      const category = await this.categoryRepo.findOneBy({ id: data.categoryId });
      if (!category) {
        throw new BadRequestException('Invalid categoryId');
      }

      const { totalSpent } = await this.transactionRepo
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'totalSpent')
        .where('transaction.categoryId = :categoryId', { categoryId: data.categoryId })
        .andWhere("date >= date_trunc('month', CURRENT_DATE)")
        .getRawOne();

      const currentSpending = parseFloat(totalSpent) || 0;
      const amount = data.amount ?? 0;

      if (currentSpending + amount > category.monthlyLimit) {
        throw new BadRequestException('Category monthly limit exceeded');
      }
    }

    return this.transactionRepo.save(data);
  }

  findAll() {
    return this.transactionRepo.find();
  }

  findOne(id: number) {
    return this.transactionRepo.findOneBy({ id });
  }

  update(id: number, data: Partial<Transaction>) {
    return this.transactionRepo.update(id, data);
  }

  remove(id: number) {
    return this.transactionRepo.delete(id);
  }
}
