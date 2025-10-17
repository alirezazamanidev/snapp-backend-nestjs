import {
  ICalculateRideRequest,
  ILocationService,
  IRequestRideRequest,
  LOCATION_PACKAGE_NAME,
  LOCATION_SERVICE_NAME,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { RideEntity } from './entities/ride.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  RpcException,
  type ClientGrpc,
  type ClientProxy,
} from '@nestjs/microservices';
import { RideStatus } from './enums/ride-status.enum';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';

@Injectable()
export class RideMatchingService implements OnModuleInit {
  private locationClient: ILocationService;
  constructor(
    @Inject(LOCATION_PACKAGE_NAME)
    private readonly client: ClientGrpc,
    @InjectRepository(RideEntity)
    private readonly rideRepository: Repository<RideEntity>,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    private readonly httpService: HttpService,
  ) {}
  onModuleInit() {
    this.locationClient = this.client.getService<ILocationService>(
      LOCATION_SERVICE_NAME,
    );
  }
  async requestRide(request: IRequestRideRequest) {
    const { pickupLocation, destinationLocation, userId } = request;
    // check if user has a ride in progress or requested
    const rideExists = await this.rideRepository.find({
      where: {
        userId,
        status: In([RideStatus.REQUESTED, RideStatus.IN_PROGRESS]),
      },
    });
    if (rideExists.length > 0) {
      throw new RpcException({
        code: 400,
        message: 'User already has a ride in progress or requested',
      });
    }
    const { price } = await this.calculateRide({ pickupLocation, destinationLocation });
    const ride = this.rideRepository.create({
      pickupLocation,
      destinationLocation,
      userId,
      price,
      status: RideStatus.REQUESTED,
    });
    await this.rideRepository.save(ride);

    // get nearby drivers
    const { drivers } = await this.locationClient.getNearbyDrivers({
      latitude: pickupLocation.lat.toString(),
      longitude: pickupLocation.lng.toString(),
      radius: 10,
    });
    this.notificationClient.emit('ride.requested', {
      rideId: ride.id,
      pickupLocation: ride.pickupLocation,
      destinationLocation: ride.destinationLocation,
      ridePrice: ride.price,
      nearbyDrivers: drivers,
    });

    return {
      message: 'Ride requested successfully',
    };
  }
  async calculateRide(request: ICalculateRideRequest) {
    try {
      const { pickupLocation, destinationLocation } = request;
    
      const apiKey =
        'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg3MzU1MWExZTQwMzQ1N2Q4OTY1ZjIwNTI5ODNhNGMzIiwiaCI6Im11cm11cjY0In0=';
      const result = await lastValueFrom(
        this.httpService
          .get(
            `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${pickupLocation.lng},${pickupLocation.lat}&end=${destinationLocation.lng},${destinationLocation.lat}`,

            {
              headers: {
                Accept:
                  'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
              },
            },
          )
          .pipe(
            map((res) => res.data),
            catchError((error) => {
              console.error('OpenRouteService API error:', error.response?.data || error.message);
              throw new RpcException({
                code: 500,
                message: 'Failed to calculate ride',
              });
            }),
          ),
      );

      const { features } = result;
      const distance = features[0].properties.summary.distance; // distance in meters
      const duration = features[0].properties.segments[0].duration; // duration in seconds
      const routeCoordinates = features[0].geometry.coordinates;
  
      // Calculate price based on distance and duration
      const distanceInKm = distance / 1000;
      const durationInMinutes = duration / 60;

      // Base fare
      const baseFare = 5000; // 5000 toman base fare

      // Distance-based pricing (per km)
      const pricePerKm = 2000; // 2000 toman per km
      const distancePrice = distanceInKm * pricePerKm;

      // Time-based pricing (per minute)
      const pricePerMinute = 500; // 500 toman per minute
      const timePrice = durationInMinutes * pricePerMinute;

      // Peak hour multiplier (example: 6-9 AM and 5-8 PM)
      const currentHour = new Date().getHours();
      const isPeakHour =
        (currentHour >= 6 && currentHour <= 9) ||
        (currentHour >= 17 && currentHour <= 20);
      const peakMultiplier = isPeakHour ? 1.5 : 1;

      // Calculate total price
      const totalPrice = Math.round(
        (baseFare + distancePrice + timePrice) * peakMultiplier,
      );

      return {
        distance: distanceInKm,
        duration: durationInMinutes,
        price: totalPrice,
        routeCoordinates: routeCoordinates.map((coordinate: [number, number]) => ({
          lng: coordinate[1],
          lat: coordinate[0],
        })),
      };
    } catch (error) {
      console.error('Calculate ride error:', error);
      throw new RpcException({
        code: 500,
        message: 'Failed to calculate ride',
      });
    }
  }
}
