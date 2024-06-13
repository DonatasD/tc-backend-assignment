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
import { ReviewStatus } from '../types/reviewStatus';

@Entity()
export class Review {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ nullable: true })
  grade: number | null;

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

  @Column()
  studentId: number;

  @ManyToOne(() => User, (mentor) => mentor.mentorSessions, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    lazy: true,
  })
  mentor: User;

  @Column()
  mentorId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
