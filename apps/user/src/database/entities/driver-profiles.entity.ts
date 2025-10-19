import { BaseEntity } from "@app/common";
import { Column, CreateDateColumn, Entity, OneToOne, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity('driver_profiles')
export class DriverProfilesEntity extends BaseEntity {
    @Column({ })
    userId : string;
    @Column()
    carPlateNumber: string;
    @Column()
    carModel: string;
    @Column()
    carColor: string;
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
   // relations
   @OneToOne(() => UserEntity, (user) => user.driverProfile)
   user: UserEntity;
}