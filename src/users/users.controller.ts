import { Controller, Request, Post, UseGuards, Get, Delete, Param, Body, Query } from '@nestjs/common';
import { Login } from '../dtos/entity/login.entity';
import { Users } from '../dtos/entity/users.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { Role } from '../dtos/enum/role.enum'
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Observable } from 'rxjs';

/**
 * Controller for users.
 * Require JWT access token from {@link auth/login} for authentication
 */
@Controller('users')
export class UsersController {
    constructor (private usersService: UsersService) {}
    /**
     * `GET` endpoint to look up profile.
     * 
     * Return {@link Users} object without {@link Login} information.
     * @param req `Request` userId and companyId
     * @returns  
     */
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return this.usersService.getProfile(req.user.employeeId, req.user.companyId);
    }
    /**
     * `GET` endpoint to look up given employeeId profile.
     * 
     * Returns {@link Users} object without showing {@link Login} information.
     * @param employee_id 
     * @returns 
     */
    @UseGuards(JwtAuthGuard)
    @Get('employeeId/:employ_id')
    async getUser(@Param("employ_id") employee_id: number, @Request() req) {
        return await this.usersService.getProfile(employee_id, req.user.companyId);
    }
    /**
     * `GET` endpoint to get all user in company
     * 
     * Returns {@link Users}[ ]
     * @param company_id 
     * @returns 
     */
    @UseGuards(JwtAuthGuard)
    @Get('company/:comp_id')
    async getUsersByCompany(@Param("comp_id") company_id: number) {
	    return await this.usersService.getArrayOfUsers(company_id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    /**
     * `DELETE` endpoint to soft delete user
     * 
     * @param employeeId 
     * @param companyId 
     * @returns 
     */
     @UseGuards(JwtAuthGuard)
     @Roles(Role.Admin)
     @Delete(':employeeId')
     async removeUser(@Param('employeeId') employeeId: number, @Request() req) {
         return await this.usersService.removeUser(employeeId, req.user.companyId);
     }

    /**
     * `POST` endpoint to create user.
     * 
     * `Body`: {@link createuuserDto}: {@link Users} {@link Login} {@link managerId} {@link companyNames}
     * 
     * Return: {@link Users} object
     * @param createuserDto include Users, Login, managerId, companyName
     * @returns adding user to Database 
     */
    //This endpoint should be guarded
    @Post('create')
    async createUser(@Body() createuserDto: Users & Login & {managerId: number} & {companyName: string}) {
        return await this.usersService.createUser(createuserDto);
    }

    /**
     * `GET` endpoint to get user stat
     * `Param` employeeId
     * @param employeeId 
     * @param companyId 
     * @returns returns stat of given employeeId
     */
    @UseGuards(JwtAuthGuard)
    @Get('stats/:employeeId')
    getStats(@Param('employeeId') employeeId: number, @Request() req) {
        return this.usersService.userStats(employeeId, req.user.companyId);
    }
    /**
     * `POST` endpoint to create multiple user.
     * 
     * `Body`: {@link createuuserDto}[ ]: {@link Users}, {@link Login}, {@link managerId}, {@link companyNames}[ ]
     * 
     * Return: {@link Users}[ ] 
     * @param employeeMultiple 
     * @returns adding multiple users to Database 
     */
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Admin)
    @Post('create_multiple')
    async createUserMultiple(@Body() employeeMultiple: []) {
        return await this.usersService.createUserMultiple(employeeMultiple);
    }
    /**
     * `GET` endpoint to get Rockstar of the month.
     * 
     * Return: {@link Users} object 
     * @param companyId 
     * @returns 
     */
    @UseGuards(JwtAuthGuard)
    @Get('rockstar')
    async getRockstar(@Request() req) {
        return await this.usersService.getRockstar(req.user.companyId);
    }
    /**
     * `GET` endpoint to get Rockstar of the month stat
     * 
     * @param comp_ID 
     * @returns 
     */
    @UseGuards(JwtAuthGuard)
    @Get('company/rockstar/stats/:comp_ID')
    async getRockstarStats(@Param('comp_ID') comp_ID: number)
    {
        let rockstar: Users = await this.getRockstar(comp_ID)
        return await this.usersService.getRockstarStats(rockstar);
    }

    /**
     * `GET` endpoint to get Rock star of the month recognitions
     * 
     * Returns: array of recognitions
     * @param comp_ID 
     * @returns 
     */
    @UseGuards(JwtAuthGuard)
    @Get('company/rockstar/recognitions/:comp_ID')
    async getRockstarRecogs(@Param('comp_ID') comp_ID: number)
    {
        let rockstar: Users = await this.getRockstar(comp_ID)
        return await this.usersService.getRockstarRecogs(rockstar);
    }
    @UseGuards(JwtAuthGuard)
    @Get('search')
    async index(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('firstName') firstName: string,
        @Query('lastName') lastName: string
    ): Promise<Pagination<Users>> {
        limit = limit > 100 ? 100: limit
        return this.usersService.paginate_username(
            {page: Number(page), limit: Number(limit), route: 'http://localhost:4200/users/search'},
            firstName, lastName);
    }
}
