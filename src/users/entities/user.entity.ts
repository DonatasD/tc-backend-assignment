import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Exclude } from 'class-transformer';
import { CreateDateColumn } from 'typeorm/decorator/columns/CreateDateColumn';
import { Review } from '../../reviews/entities/review.entity';
import { UserRole } from '../types/userRole';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @IsNotEmpty()
  @Column()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @Column()
  @Index({ unique: true })
  email: string;

  @IsNotEmpty()
  @Column()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Student,
  })
  role: UserRole;

  @Column({ select: false })
  @Exclude()
  password: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Review, (review) => review.student, {
    cascade: true,
    eager: true,
  })
  reviews?: Review[];

  @OneToMany(() => Review, (review) => review.mentor, {
    cascade: true,
    eager: true,
  })
  mentorSessions?: Review[];
}
