import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern } from '@nestjs/microservices';
import type { IRideRequestedPayload } from '@app/common';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('ride.requested')
   handleRideRequested(payload: IRideRequestedPayload) {
     return this.notificationService.handleRideRequested(payload);
  }
}
