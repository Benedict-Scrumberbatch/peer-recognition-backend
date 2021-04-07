import { Controller, Request, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { Company } from '../dtos/entity/company.entity';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
    constructor (private companyService: CompanyService) {}

    @Post('create')
    async createCompany(@Body() createcompanyDto: Company) {
        return await this.companyService.createCompany(createcompanyDto);
    }
}
