import { BaseEntity } from "@app/common";
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from "typeorm";

@Entity('users')
export class UserEntity extends BaseEntity {

    @Column()
    fullname: string
    @Column({unique: true})
    email: string
    @Column({default:false})
    verified: boolean
    @Column({default:'user'})
    role: string
    @CreateDateColumn()
    createdAt: Date
    @UpdateDateColumn()
    updatedAt: Date
}