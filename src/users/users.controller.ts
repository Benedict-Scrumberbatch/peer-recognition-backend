import { Controller, Request, Post, UseGuards, Get, Delete, Param, Body } from '@nestjs/common';
import { Login } from '../dtos/entity/login.entity';
import { Users } from '../dtos/entity/users.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

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
}
