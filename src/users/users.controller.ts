import { Controller, Request, Post, UseGuards, Get, Delete, Param, Body, Query, Patch, UseInterceptors, UploadedFile} from '@nestjs/common';
import { Login } from '../common/entity/login.entity';
import { Users } from '../common/entity/users.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { Role } from '../common/enum/role.enum'
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Observable } from 'rxjs';
import * as multer from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

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
     @UseGuards(JwtAuthGuard, RolesGuard)
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
    async createUser(@Body() createuserDto: Users & Login & {companyName: string}, @Request() req) {
        return await this.usersService.createUser(createuserDto, req.user.companyId, req.user.role);
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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Post('create_multiple')
    async createUserMultiple(@Body() employeeMultiple: [], @Request() req) {
        return await this.usersService.createUserMultiple(employeeMultiple, req.user.companyId);
    }

    // Posts a JSON to the backend to be uploaded into the db
    // Guard admin
    @Post('uploadJSON')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage()
    }))
    async uploadSingleFileWithPost(@UploadedFile() file, @Request() req): Promise<Users[]> {
        const data = JSON.parse(file.buffer);
        return await this.usersService.createUserMultiple(data, req.user.companyId);
    }
    
   
    @UseGuards(JwtAuthGuard)
    @Get('search')
    async index(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('firstName') firstName: string,
        @Query('lastName') lastName: string,
        @Query('search') search: string,
        @Request() req
    ): Promise<Pagination<Users>> {
        let path: string = req.url;
        let [host, query] = path.split('?');
        const params = new URLSearchParams(query);
        
        params.delete('page');
        params.delete('limit');
        limit = limit > 100 ? 100: limit
        limit = limit <= 0 ? 1: limit
        return this.usersService.paginate_username(
            {page: Number(page), limit: Number(limit), route: host + '?' + params.toString()},
            firstName, lastName, search, req.user.companyId);
    }

    /**
     * 
     * @param req request object
     * @param user User object which to be used to update 
     * @returns User object
     */
    @UseGuards(JwtAuthGuard)
    @Patch(':employeeId/edit')
    async editUserDetails(@Param('employeeId') employeeId: number, @Request() req, @Body() user: Users){
        return this.usersService.editUserDetails(req.user, employeeId, user);
    }

    /**
     * Retrieves user email from JWT token.
     * @param req 
     * @returns 
     */
    @UseGuards(JwtAuthGuard)
    @Get('email')
    async getUserEmail(@Request() req): Promise<{ email: string }> {
        return { email: req.user.email };
    }
}
    