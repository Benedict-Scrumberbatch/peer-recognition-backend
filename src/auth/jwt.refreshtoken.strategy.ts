import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './constants';
 
@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy,"jwt-refreshtoken") {
  constructor(private userService:UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('access_token'),
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true,
    });
  }
 
  async validate(req:any , payload: any) {
    
    let user = await this.userService.loginUser(payload.username);
    let refresh = await this.userService.loginUser(req.body.username);
    if(!user || !refresh){
        throw new UnauthorizedException();
    }
    // if(req.body.refreshToken != user.refreshtoken){
    //     throw new UnauthorizedException();
    // }
    // if( new Date() > new Date(user.refreshtokenexpires)){
    //   throw new UnauthorizedException();
    // }
    // return { employeeId: payload.sub.employeeId, role: payload.sub.role, companyId: payload.sub.companyId, email: payload.username };
    return user;

}
}