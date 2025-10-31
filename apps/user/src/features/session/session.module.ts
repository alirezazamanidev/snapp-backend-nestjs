import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from '../../database/entities/session.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { SessionService } from './session.service';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity, UserEntity])],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}

