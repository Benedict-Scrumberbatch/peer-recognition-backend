import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../entity/users.entity';

@Module({
  imports: [
    UsersModule, 
    TypeOrmModule.forFeature([Users]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports:[AdminService],
})
export class AdminModule {}
