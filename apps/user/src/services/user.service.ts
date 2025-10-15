import { Injectable } from '@nestjs/common';
import { UserEntity } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GoogleUserProfile } from '../common/interfaces/google-auth.interface';
import { IUpdateUserRoleRequest, type IUpdateUserRoleResponse, Role } from '@app/common';

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {} 
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
    if(!user.verified) this.userRepository.update(user.id, { verified: true });
    return user;
  }
  async updateUserRole(dto: IUpdateUserRoleRequest): Promise<IUpdateUserRoleResponse> {
    
    await this.userRepository.update(dto.userId, { role: dto.role as Role });
    return {
      message: 'User role updated successfully',
    }
  }
}
