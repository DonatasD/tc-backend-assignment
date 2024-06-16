import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CreateDateColumn } from 'typeorm/decorator/columns/CreateDateColumn';
import { IsNotEmpty } from 'class-validator';
import { User } from '../../user/entities/user.entity';
import { ReviewStatus } from '../types/reviewStatus';

@Entity()
export class Review {
  constructor(review: Partial<Review>) {
    Object.assign(this, review);
  }

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ nullable: true })
  grade: number | null;

  @Column({ nullable: true, type: 'text' })
  comment: string | null;

  @IsNotEmpty()
  @Column()
  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.Scheduled,
  })
  status: ReviewStatus;

  @Column({ type: 'timestamp' })
  startDateTime: Date | string;

  @Column({ type: 'timestamp' })
  endDateTime: Date | string;

  @ManyToOne(() => User, (student) => student.review, {
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
