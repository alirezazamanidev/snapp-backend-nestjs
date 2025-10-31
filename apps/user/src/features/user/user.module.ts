import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { DriverProfilesEntity } from '../../database/entities/driver-profiles.entity';
import { SessionEntity } from '../../database/entities/session.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      DriverProfilesEntity,
      SessionEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

