import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rule } from './rule.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RuleService {
  constructor(
    @InjectRepository(Rule)
    private ruleRepo: Repository<Rule>,
  ) {}

  create(data: Partial<Rule>) {
    return this.ruleRepo.save(data);
  }

  findAll() {
    return this.ruleRepo.find();
  }
  update(id: number, data: Partial<Rule>) {
    return this.ruleRepo.update(id, data);
  }
  
  remove(id: number) {
    return this.ruleRepo.delete(id);
  }
}
