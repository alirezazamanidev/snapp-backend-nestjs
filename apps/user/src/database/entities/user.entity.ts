import { BaseEntity, Role } from '@app/common';
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column()
  fullname: string;
  @Column({ unique: true })
  email: string;
  @Column({ default: false })
  verified: boolean;
  @Column({type: 'enum', enum: Role, nullable: true })
  role: Role;
  @Column({ default: null })
  avatarUrl: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
