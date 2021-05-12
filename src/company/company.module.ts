import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../common/entity/company.entity';
import { Users } from '../common/entity/users.entity';
import { Login } from '../common/entity/login.entity';
import { Tag } from '../common/entity/tag.entity';
import { TagService } from '../tag/tag.service';


@Module({
  imports: [TypeOrmModule.forFeature([Users, Login, Company, Tag])],
  providers: [CompanyService,TagService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
