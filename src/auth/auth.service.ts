import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Login } from '../dtos/entity/login.entity';

/**
 * Service for the {@link AuthController}. Functional logic is kept here.
 */
@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    /**
     * Retrieves user object from the {@link UsersService} and verifies that the password matches.
     * This method is called by the {@link LocalStrategy}
     * @param username Email of user sent by API request
     * @param pass Password of user sent by API request
     * @returns User information object if password is correct, `null` if not. Password is stripped before being returned.
     */
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.loginUser(username);
        if (user && user.password === pass) {
            const { password, ...result} = user;
            return result;
        }
        return null;
    }

    /**
     * Creates JWT token associated with user information.
     * Called by the {@link AuthController}
     * @param user user information that gets associated with the JWT token.
     * @returns Object with a JWT access token which can be used to authenticate future API calls.
     */
    async login(user: Login) {
        const payload = { username: user.email, sub: {...user.employee } };
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
    async refresh(user: Login) {
        const payload = { username: user.email, sub: { ...user.employee } };
        const accessTokenExpireDate = new Date();
        accessTokenExpireDate.setMinutes(accessTokenExpireDate.getMinutes() + 5)
        return {
            access_token: this.jwtService.sign(payload),
            accessTokenExpire: accessTokenExpireDate,   // expire in 5 minutes
        };
    }
}