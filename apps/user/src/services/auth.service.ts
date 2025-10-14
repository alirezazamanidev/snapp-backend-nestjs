import { IGoogleLoginRequest, IGoogleLoginResponse } from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, lastValueFrom, map } from 'rxjs';
import { UserEntity } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { GoogleTokenResponse, GoogleUserProfile } from '../common/interfaces/google-auth.interface';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
   
    private readonly httpService: HttpService,
    private readonly userService: UserService
  ) {}

  async googleLogin(
    payload: IGoogleLoginRequest,
  ): Promise<IGoogleLoginResponse> {
    try {
      if (!payload.code) {
        throw new RpcException({
          code: 400,
          message: 'Authorization code is required',
        });
      }

      const accessToken = await this.verifyGoogleCode(payload.code);
      const userProfile = await this.getGoogleUserProfile(accessToken);
      const user=await this.userService.createUser(userProfile);
    
      // generate session
      return {
        message: 'Authentication successful',
      };
    } catch (error) {
      this.logger.error('Google login failed', error);

      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: 500,
        message: 'Internal server error during authentication',
      });
    }
  }

  private async getGoogleUserProfile(
    accessToken: string,
  ): Promise<GoogleUserProfile> {
    try {
      const url = 'https://www.googleapis.com/oauth2/v2/userinfo';

      const response = await lastValueFrom(
        this.httpService
          .get<GoogleUserProfile>(url, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          })
          .pipe(
            map((res) => res.data),
            catchError((error) => {
              this.logger.error('Failed to fetch Google user profile', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
              });

              throw new RpcException({
                code: 401,
                message: 'Failed to fetch user profile from Google',
              });
            }),
          ),
      );
      return response;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error('Unexpected error while fetching user profile', error);
      throw new RpcException({
        code: 500,
        message: 'Failed to retrieve user profile',
      });
    }
  }

  private async verifyGoogleCode(code: string): Promise<string> {
    try {
      
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const requestBody = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      };

      const response = await lastValueFrom(
        this.httpService
          .post<GoogleTokenResponse>(tokenUrl, requestBody, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
            },
          })
          .pipe(
            map((res) => res.data),
            catchError((error) => {
              this.logger.error('Google token exchange failed', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
              });

              const errorMessage =
                error.response?.data?.error_description ||
                error.response?.data?.error ||
                'Invalid authorization code';

              throw new RpcException({
                code: 401,
                message: `Google authentication failed: ${errorMessage}`,
              });
            }),
          ),
      );

      if (!response.access_token) {
        throw new RpcException({
          code: 401,
          message: 'No access token received from Google',
        });
      }

      return response.access_token;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(
        'Unexpected error during Google code verification',
        error,
      );
      throw new RpcException({
        code: 500,
        message: 'Failed to verify Google authorization code',
      });
    }
  }
}
