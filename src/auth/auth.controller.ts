import { Controller, Request, Post, UseGuards, Get} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthRefreshGuard } from './jwt-auth.refresh.guard';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

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
