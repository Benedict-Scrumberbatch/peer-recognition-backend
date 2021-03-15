import { Body, Controller, Delete, Request, Get, Param, Post, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateUserDto } from './create-user.dto';

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService){}

    @Get()
    async findAll() {
        return await this.adminService.findAll();
    }

    @Get(':employeeId')
    async findOne(@Param('employeeId') employeeId: number) {
        return await this.adminService.findOne( employeeId );
    }

    @Delete('delete/:employeeId')
    async removeUser(@Param('employeeId') employeeId: number) {
        return await this.adminService.removeUser(employeeId)
    }

    @Post('create')
    async createUser(@Body() createuserDto: CreateUserDto) {
        return await this.adminService.createUser(createuserDto);
    }
   
}
