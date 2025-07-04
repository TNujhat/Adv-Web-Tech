
import { Controller, Post, Get, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { RuleService } from './rule.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Put } from '@nestjs/common'; 


@UseGuards(JwtAuthGuard)
@Controller('rules')
export class RuleController {
  constructor(private readonly service: RuleService) {}

  @Post()
  create(@Body() data) {
    return this.service.create(data);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
  @Put(':id')
update(@Param('id') id: number, @Body() data) {
  return this.service.update(+id, data);
}
}
