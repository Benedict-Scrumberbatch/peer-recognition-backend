import { Controller, Request, Post, UseGuards, Get, Delete, Param, Body, Query } from '@nestjs/common';
import { Login } from '../dtos/entity/login.entity';
import { Users } from '../dtos/entity/users.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Observable } from 'rxjs';

@Controller('users')
export class UsersController {
    constructor (private usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return this.usersService.getProfile(req.user.employeeId, req.user.companyId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':employ_id/company/:comp_id')
    async getUser(@Param("employ_id") employee_id: number, @Param("comp_id") company_id: number) {
        return await this.usersService.getProfile(employee_id, company_id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('company/:comp_id')
    async getUsersByCompany(@Param("comp_id") company_id: number) {
	    return await this.usersService.getArrayOfUsers(company_id);
    }

    @Delete(':employeeId/company/:companyId')
    async removeUser(@Param('employeeId') employeeId: number, @Param('companyId') companyId: number) {
        return await this.usersService.removeUser(employeeId, companyId);
    }
    //This endpoint should be guarded
    @Post('create')
    async createUser(@Body() createuserDto: Users & Login & {managerId: number} & {companyName: string}) {
        return await this.usersService.createUser(createuserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats/:employeeId/company/:companyId')
    getStats(@Param('employeeId') employeeId: number, @Param('companyId') companyId: number) {
        return this.usersService.userStats(employeeId, companyId);
    }
  
    @Post('create_multiple')
    async createUserMultiple(@Body() employeeMultiple: []) {
        return await this.usersService.createUserMultiple(employeeMultiple);
    }

    @UseGuards(JwtAuthGuard)
    @Get('company/rockstar/:comp_id')
    async getRockstar(@Param('comp_id') companyId: number) {
        return await this.usersService.getRockstar(companyId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('company/rockstar/stats/:comp_ID')
    async getRockstarStats(@Param('comp_ID') comp_ID: number)
    {
        let rockstar: Users = await this.getRockstar(comp_ID)
        return await this.usersService.getRockstarStats(rockstar);
    }
    @UseGuards(JwtAuthGuard)
    @Get('company/rockstar/recognitions/:comp_ID')
    async getRockstarRecogs(@Param('comp_ID') comp_ID: number)
    {
        let rockstar: Users = await this.getRockstar(comp_ID)
        return await this.usersService.getRockstarRecogs(rockstar);
    }
    @UseGuards(JwtAuthGuard)
    @Get('search')
    async index(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('firstName') firstName: string,
        @Query('lastName') lastName: string
    ): Promise<Pagination<Users>> {
        limit = limit > 100 ? 100: limit
        return this.usersService.paginate_username(
            {page: Number(page), limit: Number(limit), route: 'http://localhost:4200/users/search'},
            firstName, lastName);
    }
}
