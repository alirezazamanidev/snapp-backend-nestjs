import { ILocationService, IRequestRideRequest, LOCATION_PACKAGE_NAME, LOCATION_SERVICE_NAME } from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { RideEntity } from './entities/ride.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class RideMatchingService implements OnModuleInit {
  private locationClient: ILocationService
  constructor(
    @Inject(LOCATION_PACKAGE_NAME)
    private readonly client: ClientGrpc,
    @InjectRepository(RideEntity)
    private readonly rideRepository: Repository<RideEntity>,
  ) {}
  onModuleInit() {
    this.locationClient = this.client.getService<ILocationService>(LOCATION_SERVICE_NAME);
  }
  async requestRide(request: IRequestRideRequest) {
    const { pickupLocation, destinationLocation, userId } = request;
    const ride = this.rideRepository.create({
      pickupLocation,
      destinationLocation,
      userId,
      price: 300,

    });
    await this.rideRepository.save(ride);

    // get nearby drivers
    const {drivers} = await this.locationClient.getNearbyDrivers({
      latitude: pickupLocation.latitude.toString(),
      longitude: pickupLocation.longitude.toString(),
      radius: 1,
    });
  

    return {
      message: 'Ride requested successfully',
      data:{
        rideId: ride.id,
        nearbyDrivers: drivers,
        ridePrice: ride.price,
        pickup:ride.pickupLocation,
        destination:ride.destinationLocation
      }
    };
  }
}
