import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { catchError, Observable, throwError } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class ErrorGrpcInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      catchError((exception: any) => {
        if (context.getType() === 'http') {
          throw new HttpException(exception.details, exception.code);
        } else if (context.getType() === 'ws') {
          
          throw new WsException(exception.details);
          
        }
        return throwError(() => exception);
      }),
    );
  }
}
