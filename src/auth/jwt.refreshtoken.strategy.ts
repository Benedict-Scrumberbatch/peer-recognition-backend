import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './constants';
 
@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refreshtoken') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.refresh_secret,
        });
    }
  
    async validate(payload: any) {
      return {...payload.sub, email: payload.username };
  }

}