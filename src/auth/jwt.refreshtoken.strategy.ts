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
  //   async validate(username: string, password:string): Promise<any> {
  //     const user = await this.authService.validateUser(username, password);
  //     if (!user) {
  //         throw new UnauthorizedException();
  //     }
  //     return user;
  // }
    async validate(payload: any) {
      return { employeeId: payload.sub.employeeId, role: payload.sub.role, companyId: payload.sub.companyId, email: payload.username };
  }

}