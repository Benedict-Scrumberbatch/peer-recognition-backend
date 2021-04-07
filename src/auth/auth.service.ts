import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

var randtoken = require('rand-token');
@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    async generateRefreshToken(email):  Promise<string>{
        var refreshToken = randtoken.generate(16);
        var expirydate =new Date();
        expirydate.setDate(expirydate.getDate() + 7);   // refreshtoken expires in 7 days
        await this.usersService.storeRefreshToken(refreshToken, email, expirydate);
        return refreshToken
      }

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
        return {
            access_token: this.jwtService.sign(payload),
            // refreshToken: await this.generateRefreshToken(user.email),
            refreshToken: this.jwtService.sign(payload, { expiresIn: '3600s'}),
        };
    }
}