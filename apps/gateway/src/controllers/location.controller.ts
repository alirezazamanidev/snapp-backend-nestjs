import {
  ILocationService,
  LOCATION_PACKAGE_NAME,
  LOCATION_SERVICE_NAME,
} from '@app/common';
import { Body, Controller, Inject, OnModuleInit, Post, Req, UseGuards } from '@nestjs/common';

import type { ClientGrpc } from '@nestjs/microservices';

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

}
