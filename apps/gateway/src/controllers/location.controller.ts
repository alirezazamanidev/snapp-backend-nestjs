import {
  ILocationService,
  LOCATION_PACKAGE_NAME,
  LOCATION_SERVICE_NAME,
} from '@app/common';
import { Body, Controller, Inject, OnModuleInit, Post, Req, UseGuards } from '@nestjs/common';

import type { ClientGrpc } from '@nestjs/microservices';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { GetNearbyDriversDto, UpdateLocationDto } from '../dtos/location.dto';
import type{ Request } from 'express';
import { AuthGuard } from '../common/guards/auth.guard';
import { SwaggerConsumes } from '../common/enums/swagger.enum';

@Controller('location')
export class LocationController implements OnModuleInit {
  private locationClientService: ILocationService;
  constructor(
    @Inject(LOCATION_PACKAGE_NAME) private readonly client: ClientGrpc,
  ) {}
  onModuleInit() {
    this.locationClientService = this.client.getService<ILocationService>(
      LOCATION_SERVICE_NAME,
    );
  }
  @ApiOperation({ summary: 'update location' })
  @Post('update')
  @UseGuards(AuthGuard)
  @ApiConsumes(SwaggerConsumes.URL_ENCODED,SwaggerConsumes.JSON)
  async updateLocation(@Body() dto: UpdateLocationDto, @Req() req: Request) {
    return this.locationClientService.updateLocation({
      userId: req.user.userId,
      ...dto
    });
  }
  @ApiOperation({ summary: 'get nearby drivers' })
  @Post('get-nearby-drivers')
  @UseGuards(AuthGuard)
  @ApiConsumes(SwaggerConsumes.URL_ENCODED,SwaggerConsumes.JSON)
  async getNearbyDrivers(@Body() dto: GetNearbyDriversDto, @Req() req: Request) {
    return this.locationClientService.getNearbyDrivers(dto);
  }
}
