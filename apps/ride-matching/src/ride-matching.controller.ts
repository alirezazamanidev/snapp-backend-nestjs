import { Controller, Get } from '@nestjs/common';
import { RideMatchingService } from './ride-matching.service';

@Controller()
export class RideMatchingController {
  constructor(private readonly rideMatchingService: RideMatchingService) {}

  @Get()
  getHello(): string {
    return this.rideMatchingService.getHello();
  }
}
