import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../entity/users.entity';
import { Tag } from 'src/entity/tag.entity';
import { Recognition } from 'src/entity/recognition.entity';
import { Company } from 'src/entity/company.entity';
import { Login } from 'src/entity/login.entity';

@Module({
  imports: [
    UsersModule, 
    TypeOrmModule.forFeature([Users, Tag, Recognition, Company, Login]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports:[AdminService],
})
export class AdminModule {}
