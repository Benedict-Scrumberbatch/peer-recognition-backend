
import { Controller, Request, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeleteResult } from 'typeorm';
import { Company } from '../dtos/entity/company.entity';

import { CompanyService } from './company.service';
import { Role } from 'src/dtos/enum/role.enum';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';

@Controller('company')
export class CompanyController {
    constructor (private companyService: CompanyService) {}

    /**
     * Endpoint to retrieve all companies from the database.
     * @returns List of companies including their tags.
     */
    @UseGuards(JwtAuthGuard)
    @Get('all')
    async getCompany(){
        return await this.companyService.getCompany();
    }
    
    /**
     * Retrieves company information of a specific user. User is specified by the JWT token.
     * @param req This is the request info that has been collected from the API request. Contains a user object with user info which is automatically appended by the JwtAuthGuard.
     * @returns {@link Company} object along with the company's values (tags).
     */
    @UseGuards(JwtAuthGuard)
    @Get()
    async getUserCompany(@Request() req): Promise<Company>{
        return await this.companyService.getOneCompany(req.user.companyId)
    }

    /**
     * Retrieves company information specified by the company id parameter.
     * @param id URL parameter that specifies the company id.
     * @returns {@link Company} object along with the company's values (tags).
     */
    @Get(':id')
    async getOneCompany(@Param('id') id): Promise<Company>{
        return await this.companyService.getOneCompany(id);
    }

    /**
     * Create another company in the database.
     * @param createcompanyDto Company object with information about the new company to add.
     * @returns {@link Company} object which was created in the database.
     */
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Admin)
    @Post('create')
    async createCompany(@Body() createcompanyDto: Company) {
        return await this.companyService.createCompany(createcompanyDto);
    }
    
    /**
     * Delete a company specified by the comany id parameter
     * @param id URL parameter that specifies the company id.
     * @returns {@link DeleteResult} object.
     */
    @Delete(':id')
    delete(@Param('id') id): Promise<Company[]>{
        return this.companyService.deleteComp(id);
    }
}
