import { Body, Controller, Delete, Request, Get, Param, Post, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsersService } from '../users.service';
import { CreateUserDto } from './create-user.dto';

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService){}

    @Get()
    findAll() {
        return this.adminService.findAll();
    }

    @Get(':employeeId')
    findOne(@Param('employeeId') employeeId: number) {
        return this.adminService.findOne(employeeId);
    }

    @Delete(':employeeId')
    removeUser(@Param('employeeId') employeeId: number) {
        return this.adminService.removeUser(employeeId)
    }
   
}
