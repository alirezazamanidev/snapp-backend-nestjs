import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Query,
  Req,
  Res,
} from '@nestjs/common';

import type { Request, Response } from 'express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AUTH_SERVICE_NAME,
  IAuthService,
  USER_PACKAGE_NAME,
} from '@app/common';
import type { ClientGrpc } from '@nestjs/microservices';

@Controller('auth')
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
  googleLogin(@Res() res: Response) {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=profile email`;
    res.redirect(url);
  }
  @Get('google/verify')
  verifyGoogle(@Query('code') code: string, @Req() req: Request) {
    return this.authclientService.googleLogin({
      code,
      ipAddress: req.ip as string,
      userAgent: req.headers['user-agent'] as string,
    });
  }
}
