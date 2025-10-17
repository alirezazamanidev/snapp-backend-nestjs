import { BaseEntity, type LatLng } from "@app/common";
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from "typeorm";
import { RideStatus } from "../enums/ride-status.enum";

@Entity('rides')
export class RideEntity extends BaseEntity {
    @Column()
    userId: string;
    @Column({nullable:true})
    driverId: string;
    @Column({type: 'jsonb'})
    pickupLocation: LatLng
    @Column({type: 'jsonb'})
    destinationLocation: LatLng;

    @Column({type: 'enum', enum: RideStatus,default: RideStatus.REQUESTED})
    status: string;
    @Column({})
    price: number;
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}