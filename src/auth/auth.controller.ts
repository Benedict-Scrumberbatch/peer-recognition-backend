import { Controller, Request, Post, UseGuards, Get, Body, Patch} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthRefreshGuard } from './jwt-auth.refresh.guard';
import { EditLoginDto } from '../dtos/dto/edit-login.dto';
import { UpdateResult } from 'typeorm';

/**
 * Controller for user authentication.
 */
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * POST api endpoint to authenticate a user using a username (email) and password.  
     * `LocalAuthGuard` intercepts the request, validates the user login info, and attaches the user object to the request before the `login()` method is hit.
     * @param req Request object specified by the POST request
     * @returns  Endpoint sends back a JWT token which can be used to authorize other restricted API requests.
     */
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }
    
    /**
     * POST api endpoint to retrieve a JWT refresh token.
     * @param req Request object specified by the POST request
     * @returns sends back a new JWT token, and the expiration date.
     */
    @UseGuards(JwtAuthRefreshGuard)
    @Post('refreshtoken')
    async refreshToken(@Request() req){
        return this.authService.refresh(req.user);
    }

    /**
     * PATCH api endpoint to modify user login details.
     * @param req Request object specified by the post request.
     * @param edits Object that specifies the current username and password, and the new changes to the {@link Login} details.
     * @returns 
     */
    @UseGuards(LocalAuthGuard)
    @Patch()
    async editLogin(@Request() req, @Body() edits: EditLoginDto): Promise<UpdateResult> {
        return this.authService.editLogin(req.user, edits.newDetails);
    }

}
