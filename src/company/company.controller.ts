
import { Controller, Request, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DeleteResult } from 'typeorm';
import { Company } from '../dtos/entity/company.entity';

import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
    constructor (private companyService: CompanyService) {}

    @UseGuards(JwtAuthGuard)
    
    @Get('all')
    async getCompany(){
        return await this.companyService.getCompany();
    }
    @Get()
    async getUserCompany(@Request() req): Promise<Company>{
        return await this.companyService.getOneCompany(req.user.companyId)
    }
    @Get(':id')
    async getOneCompany(@Param('id') id): Promise<Company>{
        return await this.companyService.getOneCompany(id);
    }
    @Post('create')
    async createCompany(@Body() createcompanyDto: Company) {
        return await this.companyService.createCompany(createcompanyDto);
    }
    
    @Delete(':id')
    delete(@Param('id') id): Promise<DeleteResult>{
        return this.companyService.deleteComp(id);
    }
}
