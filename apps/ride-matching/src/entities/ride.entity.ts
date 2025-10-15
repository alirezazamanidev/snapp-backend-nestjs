import { BaseEntity } from "@app/common";
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from "typeorm";
import { RideStatus } from "../enums/ride-status.enum";

@Entity('rides')
export class RideEntity extends BaseEntity {
    @Column()
    userId: string;
    @Column({nullable:true})
    driverId: string;
    @Column({type: 'jsonb'})
    pickupLocation: Record<string, number>;
    @Column({type: 'jsonb'})
    destinationLocation: Record<string, number>;

    @Column({type: 'enum', enum: RideStatus,default: RideStatus.REQUESTED})
    status: string;
    @Column({})
    price: number;
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}