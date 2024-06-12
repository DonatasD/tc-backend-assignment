import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CreateDateColumn } from 'typeorm/decorator/columns/CreateDateColumn';
import { IsNotEmpty } from 'class-validator';
import { User } from '../../users/entities/user.entity';

export enum ReviewStatus {
  Scheduled = 'scheduled',
  InProgress = 'inProgress',
  Complete = 'complete',
  Cancelled = 'cancelled',
}

@Entity()
export class Review {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column()
  grade: number;

  @IsNotEmpty()
  @Column()
  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.Scheduled,
  })
  status: ReviewStatus;

  @Column({ type: 'timestamp' })
  startDateTime: Date;

  @ManyToOne(() => User, (student) => student.reviews, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    lazy: true,
  })
  student: User;

  @ManyToOne(() => User, (mentor) => mentor.mentorSessions, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    lazy: true,
  })
  mentor: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
