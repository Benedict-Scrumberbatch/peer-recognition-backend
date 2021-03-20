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
        // return req.user;
    }

    @Delete(':employeeId/company/:companyId')
    async removeUser(@Param('employeeId') employeeId: number, @Param('companyId') companyId: number) {
        return await this.usersService.removeUser(employeeId, companyId);
    }

    @Post('create')
    async createUser(@Body() createuserDto: Users & Login & {managerId: number} & {companyName: string}) {
        return await this.usersService.createUser(createuserDto);
    }

    @Post('create_multiple')
    async createUserMultiple(@Body() employeeMultiple: []) {
        return await this.usersService.createUserMultiple(employeeMultiple);
    }
}
