import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/create-user.dto';

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService){}

    @Get(':username')
    async getUser(@Param('username') username) {
        const user = await this.adminService.getUser(username);
        return user;
    }

    @Post()
    async addUser(@Body() createUserDto: CreateUserDto) {
        const user = await this.adminService.addUser(createUserDto);
        return user;
    }
}
