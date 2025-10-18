import { ArgumentsHost, Catch, ExceptionFilter, RpcExceptionFilter } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Observable } from "rxjs";
import { Socket } from "socket.io";

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {

    catch(exception: WsException, host: ArgumentsHost) {
     const ctx = host.switchToWs();
     const client = ctx.getClient<Socket>();
     const message = exception.message;
     client.emit('error', message);
    
    }
}