import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GoogleUserProfile } from '../common/interfaces/google-auth.interface';
import {
  ICreateOrUpdateDriverProfileRequest,
  IGetProfileRequest,
  IUpdateUserRoleRequest,
  type IUpdateUserRoleResponse,
  REDIS_CLIENT,
  Role,
} from '@app/common';
import { DriverProfilesEntity } from '../database/entities/driver-profiles.entity';
import { RpcException } from '@nestjs/microservices';
import Redis from 'ioredis';
import { SessionEntity } from '../database/entities/session.entity';
import { ICheckDriverProfileRequest, IGetRoleRequest } from '@app/common/interfaces/user-grpc.interface';
@Injectable()
export class UserService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DriverProfilesEntity)
    private readonly driverProfileRepository: Repository<DriverProfilesEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {}
  async createUser(userProfile: GoogleUserProfile): Promise<UserEntity> {
    let user = await this.userRepository.findOne({
      where: { email: userProfile.email },
    });
    if (!user) {
      user = this.userRepository.create({
        email: userProfile.email,
        fullname: userProfile.name,
        avatarUrl: userProfile.picture,
        verified: userProfile.verified_email,
      });
      user = await this.userRepository.save(user);
    }
    if (!user.verified) this.userRepository.update(user.id, { verified: true });
    return user;
  }
  async updateUserRole(
    dto: IUpdateUserRoleRequest,
  ): Promise<IUpdateUserRoleResponse> {
    const session = await this.redisClient.get(`session:${dto.sessionId}`);
    if(!session) throw new RpcException({ code: 401, message: 'Invalid session ID' });
    const sessionData = JSON.parse(session);
    await this.userRepository.update(sessionData.userId, { role: dto.role as Role });
    return {
      message: 'User role updated successfully',
    };
  }
  async createOrUpdateDriverProfile(dto: ICreateOrUpdateDriverProfileRequest) {
    const { userId, ...driverProfile } = dto;
    // check user role
    const user = await this.userRepository.findOne({
      where: { id: userId, role: Role.DRIVER },
    });
    if (!user) {
      throw new RpcException({ code: 404, message: 'User not found' });
    }
    let profile = await this.driverProfileRepository.findOne({
      where: { userId },
    });
    if (profile) {
      await this.driverProfileRepository.update(profile.id, driverProfile);
    } else {
      profile = this.driverProfileRepository.create({...driverProfile, userId});
      await this.driverProfileRepository.save(profile);
    }
    return {
      message: 'Driver profile created successfully',
    };
  }
  async getProfile(payload: IGetProfileRequest) {
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });
    if (!user) throw new RpcException({ code: 404, message: 'User not found' });
    return {
      id: user.id,
      fullname: user.fullname,
      email: user.email || '',
      avatarUrl: user.avatarUrl || '',
    };
  }
  async checkDriverProfile(payload: ICheckDriverProfileRequest) {
    const profile = await this.driverProfileRepository.findOne({
      where: { userId: payload.userId },
    });
    
    return {
      hasProfile: !!profile,
    };
  }
  async getRole(payload: IGetRoleRequest) {
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });
    if (!user) throw new RpcException({ code: 404, message: 'User not found' });
    return {
      role: user?.role || null,
    };
  }
}
