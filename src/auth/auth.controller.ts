import { Controller, Request, Post, UseGuards, Get} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthRefreshGuard } from './jwt-auth.refresh.guard';

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
    
    @UseGuards(JwtAuthRefreshGuard)
    @Post('refreshtoken')
    async refreshToken(@Request() req){
        return this.authService.refresh(req.user);
    }
}
