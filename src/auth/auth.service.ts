import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}


    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.loginUser(username);
        if (user && user.password === pass) {
            const { password, ...result} = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.email, sub: { employeeId: user.employee.employeeId, companyId: user.employee.companyId, role: user.employee.role } };
        const accessTokenExpireDate = new Date();
        const refreshTokenExpireDate = new Date();
        accessTokenExpireDate.setMinutes(accessTokenExpireDate.getMinutes() + 5)
        refreshTokenExpireDate.setDate(refreshTokenExpireDate.getDate() + 7)
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d', secret: jwtConstants.refresh_secret }),
            accessTokenExpire: accessTokenExpireDate,   // expire in 5 minutes
            refreshTokenExpire: refreshTokenExpireDate   // expire in 7 days 
        };
    }
    async refresh(user: any) {
        const payload = { username: user.email, sub: { employeeId: user.employeeId, companyId: user.companyId, role: user.role } };
        const accessTokenExpireDate = new Date();
        accessTokenExpireDate.setMinutes(accessTokenExpireDate.getMinutes() + 5)
        return {
            access_token: this.jwtService.sign(payload),
            accessTokenExpire: accessTokenExpireDate,   // expire in 5 minutes
        };
    }
}