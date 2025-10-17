import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('ride.requested')
  async handleRideRequested(payload: any) {
     return this.notificationService.handleRideRequested(payload);
  }
}
