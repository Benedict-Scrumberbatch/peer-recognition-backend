import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { Users } from '../common/entity/users.entity';
import { Login } from '../common/entity/login.entity';
import { Company } from '../common/entity/company.entity';
import { TagStats } from '../common/entity/tagstats.entity';
import { CompanyModule } from '../company/company.module';
import { Recognition} from '../common/entity/recognition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Login, Company, Recognition, TagStats]), CompanyModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
