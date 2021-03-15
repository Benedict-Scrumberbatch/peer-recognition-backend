import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.loginUser(username);
        if (user && user.pswd === pass) {
            const { pswd, ...result} = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.email, sub: { employeeId: user.employee.employeeId, companyId: user.employee.companyId, role: user.employee.role } };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}