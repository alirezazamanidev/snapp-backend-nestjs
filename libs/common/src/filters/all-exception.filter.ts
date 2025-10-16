import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { throwError } from "rxjs";
@Catch()
export class AllExceptionFilter implements ExceptionFilter {

    catch(exception: unknown, host: ArgumentsHost) {
        if(exception instanceof RpcException)
            return throwError(() =>exception.getError());
        if(exception instanceof Error)
            return throwError(()=>exception);
    }
}