import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Request, Response } from 'express';
import { Socket } from 'socket.io';

@Injectable()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception instanceof HttpException ? exception.message : 'Internal server error',
      });
    } else if (host.getType() === 'ws') {
      const client = host.switchToWs().getClient<Socket>();
      
      if (exception instanceof WsException) {
        client.emit('error', { message: exception.message });
      } else if (exception instanceof HttpException) {
        client.emit('error', { message: exception.message, code: exception.getStatus() });
      } else if (exception && typeof exception === 'object' && 'details' in exception && 'code' in exception) {
        client.emit('error', { message: (exception as any).details, code: (exception as any).code });
      } else {
        client.emit('error', { message: 'Internal server error' });
      }
    }
  }
}
