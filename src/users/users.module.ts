import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { Users } from '../entity/users.entity';
import { Login } from '../entity/login.entity';
import { Company } from '../entity/company.entity';
import { CompanyModule } from 'src/company/company.module';
import { Recognition} from '../entity/recognition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Login, Company, Recognition]), CompanyModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
