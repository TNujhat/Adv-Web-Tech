import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Rule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  keyword: string; // e.g. "Uber"

  @Column()
  categoryId: number; // If matched, assign this category
}
