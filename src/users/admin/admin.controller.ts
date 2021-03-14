import { Body, Controller, Delete, Request, Get, Param, Post, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
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

    // @Delete()
    // removeUser(@Body() companyId: number, employeeId: number) {
    //     return this.adminService.removeUser(companyId, employeeId)
    // }

    @Post()
    createUser(@Body() createuserDto: CreateUserDto) {
        return this.adminService.createUser(createuserDto);
    }
   
}
