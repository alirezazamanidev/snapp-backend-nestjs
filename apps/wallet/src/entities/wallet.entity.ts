import { BaseEntity } from "@app/common";
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from "typeorm";

@Entity('wallet')
export class WalletEntity extends BaseEntity {
    @Column()
    userId: string;
    @Column({type:'decimal',precision:10,scale:2,default:0})
    balance: number;

    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}