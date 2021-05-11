import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../dtos/entity/company.entity';
import { Users } from '../dtos/entity/users.entity';
import { Login } from '../dtos/entity/login.entity';
import { Tag } from '../dtos/entity/tag.entity';
import { TagService } from '../tag/tag.service';


@Module({
  imports: [TypeOrmModule.forFeature([Users, Login, Company, Tag])],
  providers: [CompanyService,TagService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
