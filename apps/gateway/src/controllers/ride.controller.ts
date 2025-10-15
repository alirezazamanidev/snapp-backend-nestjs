import {
  Body,
  Controller,
  Inject,
  OnModuleInit,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { SwaggerConsumes } from '../common/enums/swagger.enum';
import { RequestRideDto } from '../dtos/ride.dto';
import {
  IRideMatchingService,
  RIDE_MATCHING_PACKAGE_NAME,
  RIDE_MATCHING_SERVICE_NAME,
} from '@app/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Request } from 'express';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('ride')
@UseGuards(AuthGuard)
export class RideController implements OnModuleInit {
  private rideMatchingClient: IRideMatchingService;
  constructor(
    @Inject(RIDE_MATCHING_PACKAGE_NAME) private readonly client: ClientGrpc,
  ) {}
  onModuleInit() {
    this.rideMatchingClient = this.client.getService<IRideMatchingService>(
      RIDE_MATCHING_SERVICE_NAME,
    );
  }
  @ApiOperation({ summary: 'request a ride' })
  @ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
  @Post('request')
  requestRide(@Body() dto: RequestRideDto, @Req() req: Request) {
    
    const [plat,plng] = dto.pickupLocation.split(',');
    const [dlat,dlng] = dto.destinationLocation.split(',');
    return this.rideMatchingClient.requestRide({
      pickupLocation: {
        latitude: parseFloat(plat),
        longitude: parseFloat(plng),
      },
      destinationLocation: {
        latitude: parseFloat(dlat),
        longitude: parseFloat(dlng),
      },
      userId: req.user.userId,
    });
  }
}
