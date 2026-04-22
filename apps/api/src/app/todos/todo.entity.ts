import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TodoStatus } from '@webinar/shared-models';

@Entity('todos')
export class TodoEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ default: '' })
  description!: string;

  @Column({ type: 'varchar', default: 'pending' })
  status!: TodoStatus;

  @Column()
  createdAt!: string;

  @Column({ type: 'varchar', nullable: true })
  processedDate?: string;

  @Column({ type: 'varchar', nullable: true })
  processedReason?: string;
}
