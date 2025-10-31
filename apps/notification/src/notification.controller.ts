import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern } from '@nestjs/microservices';
import {
  type IRideAcceptedPayload,
  type IRideRequestedPayload,
} from '@app/common';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('ride.requested')
  async handleRideRequested(payload: IRideRequestedPayload) {
    return await this.notificationService.handleRideRequested(payload);
  }

  @EventPattern('ride.accepted')
  async handleRideAccepted(payload: IRideAcceptedPayload) {
    return await this.notificationService.handleRideAccepted(payload);
  }
}
