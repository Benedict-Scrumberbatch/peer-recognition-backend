import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Custom strategy that extends the `PassportStrategy` class. 
 * This strategy is used to validate a user by their email and password when the {@link LocalAuthGuard} is used.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super();
    }

    /**
     * Method that starts the user validation process using a username and password.
     * This method is called automatically by the {@link LocalAuthGuard}.
     * @param username User email.
     * @param password User password.
     * @returns User info object with companyId, 
     */
    async validate(username: string, password:string): Promise<any> {
        const user = await this.authService.validateUser(username, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}