import { Controller, Request, Post, UseGuards, Get, Delete, Param, Body } from '@nestjs/common';
import { Login } from '../entity/login.entity';
import { Users } from '../entity/users.entity';
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
    //This endpoint should be guarded
    @Delete(':employeeId/company/:companyId')
    async removeUser(@Param('employeeId') employeeId: number, @Param('companyId') companyId: number) {
        return await this.usersService.removeUser(employeeId, companyId);
    }
    //This endpoint should be guarded
    @Post('create')
    async createUser(@Body() createuserDto: Users & Login) {
        return await this.usersService.createUser(createuserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats/:employeeId/company/:companyId')
    getStats(@Param('employeeId') employeeId: number, @Param('companyId') companyId: number) {
        return this.usersService.userStats(employeeId, companyId);
    }
}