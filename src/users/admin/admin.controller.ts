import { Body, Controller, Delete, Request, Get, Param, Post, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../create-user.dto';

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService){}

    @Get(':employeeId')
    getProfile(@Request() req) {
        return this.adminService.getUser(req.user.employeeId, req.user.companyId);
    }

    @Delete(':employeeid')
    remove(@Param('employeeid') employeeid: number) {}
}
