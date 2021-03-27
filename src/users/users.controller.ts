import { Controller, Request, Post, UseGuards, Get, Delete, Param, Body } from '@nestjs/common';
import { Login } from '../entity/login.entity';
import { Users } from '../entity/users.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';
import { Role } from '../roles/role.enum'

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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete(':employeeId/company/:companyId')
    async removeUser(@Param('employeeId') employeeId: number, @Param('companyId') companyId: number) {
        return await this.usersService.removeUser(employeeId, companyId);
    }

    // Place holder endpoint if database is empty
    @Post('createDummy')
    async createDummy(){
        return await this.usersService.createDummy();
    }

    //This endpoint should be guarded
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Post('create')
    async createUser(@Body() createuserDto: Users & Login & {managerId: number} & {companyName: string}) {
        return await this.usersService.createUser(createuserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats/:employeeId/company/:companyId')
    getStats(@Param('employeeId') employeeId: number, @Param('companyId') companyId: number) {
        return this.usersService.userStats(employeeId, companyId);
    }
    @UseGuards(JwtAuthGuard)
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
