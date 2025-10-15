import { Injectable } from '@nestjs/common';
import { UserEntity } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GoogleUserProfile } from '../common/interfaces/google-auth.interface';
import {
  ICreateOrUpdateDriverProfileRequest,
  IUpdateUserRoleRequest,
  type IUpdateUserRoleResponse,
  Role,
} from '@app/common';
import { DriverProfilesEntity } from '../database/entities/driver-profiles.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DriverProfilesEntity)
    private readonly driverProfileRepository: Repository<DriverProfilesEntity>,
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
    await this.userRepository.update(dto.userId, { role: dto.role as Role });
    return {
      message: 'User role updated successfully',
    };
  }
  async createOrUpdateDriverProfile(dto: ICreateOrUpdateDriverProfileRequest) {
    const { userId, ...driverProfile } = dto;
    // check user role
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user || user.role !== Role.DRIVER) {
      throw new RpcException({ code: 403, message: 'User is not a driver' });
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
}
