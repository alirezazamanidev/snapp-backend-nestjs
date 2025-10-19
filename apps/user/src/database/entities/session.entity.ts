import { BaseEntity, Role } from '@app/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('sessions')
export class SessionEntity extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  ipAddress: string;
  @Column()
  userAgent: string;
  @Column()
  isActive: boolean;
  @Column()
  expiresAt: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({type: 'enum', enum: Role, nullable: true})
  role: Role | null;
  @Column()
  lastLoginAt: Date;
  // relations
  @ManyToOne(() => UserEntity,(user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
