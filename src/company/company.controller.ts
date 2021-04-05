import { Controller, Request, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { Company } from '../entity/company.entity';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
    constructor (private companyService: CompanyService) {}

    @Post('create')
    async createCompany(@Body() createcompanyDto: Company) {
        return await this.companyService.createCompany(createcompanyDto);
    }
    @Get('all')
    async getCompany(){
        return await this.companyService.getCompany();
    }
    @Delete(':id')
    delete(@Param('id') id): Promise<DeleteResult>{
        return this.companyService.deleteComp(id);
    }
}
