import { Injectable } from '@nestjs/common';

@Injectable()
export class RideMatchingService {
  getHello(): string {
    return 'Hello World!';
  }
}
