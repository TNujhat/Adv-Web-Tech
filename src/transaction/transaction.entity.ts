import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column({ type: 'timestamp' })
  date: Date;
  
  @Column({ nullable: true })
  description?: string;

  @Column()
  categoryId: number; 
}
