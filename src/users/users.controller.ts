import { Controller, Request, Post, UseGuards, Get, Delete, Param, Body } from '@nestjs/common';
import { Login } from '../dtos/entity/login.entity';
import { Users } from '../dtos/entity/users.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
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
    @Get(':employ_id/company/:comp_id')
    async getUser(@Param("employ_id") employee_id: number, @Param("comp_id") company_id: number) {
        return await this.usersService.getProfile(employee_id, company_id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('company/:comp_id')
    async getUsersByCompany(@Param("comp_id") company_id: number) {
	    return await this.usersService.getArrayOfUsers(company_id);
    }

    @Delete(':employeeId/company/:companyId')
    async removeUser(@Param('employeeId') employeeId: number, @Param('companyId') companyId: number) {
        return await this.usersService.removeUser(employeeId, companyId);
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

    @UseGuards(JwtAuthGuard)
    @Get('stats/:employeeId/company/:companyId')
    getStats(@Param('employeeId') employeeId: number, @Param('companyId') companyId: number) {
        return this.usersService.userStats(employeeId, companyId);
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
    @Get('company/rockstar/:comp_id')
    async getRockstar(@Param('comp_id') companyId: number) {
        return await this.usersService.getRockstar(companyId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('company/rockstar/stats/:comp_ID')
    async getRockstarStats(@Param('comp_ID') comp_ID: number)
    {
        let rockstar: Users = await this.getRockstar(comp_ID)
        return await this.usersService.getRockstarStats(rockstar);
    }
    @UseGuards(JwtAuthGuard)
    @Get('company/rockstar/recognitions/:comp_ID')
    async getRockstarRecogs(@Param('comp_ID') comp_ID: number)
    {
        let rockstar: Users = await this.getRockstar(comp_ID)
        return await this.usersService.getRockstarRecogs(rockstar);
    }
}
