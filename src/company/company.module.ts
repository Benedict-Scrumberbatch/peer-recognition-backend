import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../dtos/entity/company.entity';
import { Tag } from '../dtos/entity/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Tag])],
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
