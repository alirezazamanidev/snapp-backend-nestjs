import { BaseEntity } from "@app/common";
import { Column, CreateDateColumn, Entity, Index, UpdateDateColumn } from "typeorm";

@Entity('sessions')
export class SessionEntity extends BaseEntity {
    @Column()
    @Index()
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
}