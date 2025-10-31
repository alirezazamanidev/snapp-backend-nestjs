import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AUTH_SERVICE_NAME,
  IAuthService,
  USER_PACKAGE_NAME,
} from '@app/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthGuard } from '../../common/guards/auth.guard';
import { InvalidateSessionDto } from './dto/invalidate-session.dto';
import { ErrorGrpcInterceptor } from '../../common/interceptors/error-grpc.interceptor';

@Controller('auth')
@UseInterceptors(ErrorGrpcInterceptor)
export class AuthController implements OnModuleInit {
  private authclientService: IAuthService;
  constructor(@Inject(USER_PACKAGE_NAME) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authclientService =
      this.client.getService<IAuthService>(AUTH_SERVICE_NAME);
  }

  @ApiOperation({ summary: 'Redirect to Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  @Get('google/login')
  googleLogin() {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=profile email`;
    return {
      googleLoginUrl: url,
    };
  }

  @Get('google/verify')
  async verifyGoogle(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await lastValueFrom(
      this.authclientService.googleLogin({
        code,
        ipAddress: req.ip as string,
        userAgent: req.headers['user-agent'] as string,
      }),
    );

    res
      .cookie('snapp-session', result.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'lax',
        path: '/',
      })
      .redirect('http://localhost:3000');
  }

  @Get('check-login')
  @UseGuards(AuthGuard)
  checkLogin(@Req() req: Request) {
    return {
      success: true,
      user: req.user,
    };
  }

  @Post('invalidate-session')
  @UseGuards(AuthGuard)
  invalidateSession(@Body() dto: InvalidateSessionDto) {
    return lastValueFrom(this.authclientService.invalidateSession(dto));
  }

  @Post('invalidate-all-sessions')
  @UseGuards(AuthGuard)
  invalidateAllSessions(@Req() req: Request) {
    return lastValueFrom(
      this.authclientService.invalidateAllSessions({ userId: req.user.userId }),
    );
  }
}
