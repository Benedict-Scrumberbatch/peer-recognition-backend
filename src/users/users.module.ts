import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { Users } from '../peer-recognition-dtos/entity/users.entity';
import { Login } from '../peer-recognition-dtos/entity/login.entity';
import { Company } from '../peer-recognition-dtos/entity/company.entity';
import { TagStats } from '../peer-recognition-dtos/entity/tagstats.entity';
import { CompanyModule } from 'src/company/company.module';
import { Recognition} from '../peer-recognition-dtos/entity/recognition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Login, Company, Recognition, TagStats]), CompanyModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
