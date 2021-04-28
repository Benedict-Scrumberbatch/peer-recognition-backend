import { Controller, Request, Post, UseGuards, Get, Delete, Param, Body } from '@nestjs/common';
import { Login } from '../dtos/entity/login.entity';
import { Users } from '../dtos/entity/users.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';
import { Role } from '../dtos/enum/role.enum'
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
    constructor (private usersService: UsersService) {}
        
    
    
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return this.usersService.getProfile(req.user.employeeId, req.user.companyId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('employeeId/:employ_id')
    async getUser(@Param("employ_id") employee_id: number, @Request() req) {
        return await this.usersService.getProfile(employee_id, req.user.companyId);
    }

    // Not sure if request is needed here
    @UseGuards(JwtAuthGuard)
    @Get('company/:comp_id')
    async getUsersByCompany(@Param("comp_id") company_id: number) {
	    return await this.usersService.getArrayOfUsers(company_id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete(':employeeId')
    async removeUser(@Param('employeeId') employeeId: number, @Request() req) {
        return await this.usersService.removeUser(employeeId, req.user.companyId);
    }

    // TEMPORARY ONLY
    // Place holder endpoint if database is empty
    @Post('createDummy')
    async createDummy(){
        return await this.usersService.createDummy();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Post('create')
    async createUser(@Body() createuserDto: Users & Login & {managerId: number} & {companyName: string}) {
        return await this.usersService.createUser(createuserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats/:employeeId')
    getStats(@Param('employeeId') employeeId: number, @Request() req) {
        return this.usersService.userStats(employeeId, req.user.companyId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Post('create_multiple')
    async createUserMultiple(@Body() employeeMultiple: []) {
        return await this.usersService.createUserMultiple(employeeMultiple);
    }

}
