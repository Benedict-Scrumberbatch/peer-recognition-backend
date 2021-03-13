import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
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

    @UseGuards(JwtAuthGuard)
    @Get(':employ_id/company:comp_id')
    async getUser(@param("employ_id") employee_id: number, @param("comp_id") company_id: number) {
        return await this.usersService.getProfile(employee_id, company_id);
    }
}
