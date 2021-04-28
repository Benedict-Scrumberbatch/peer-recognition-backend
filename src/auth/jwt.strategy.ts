import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

/**
 * Custom strategy that extends the `PassportStrategy` class. 
 * This strategy is used to validate the JWT token when the {@link JwtAuthGuard} is used.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.access_secret,
        });
    }

    /**
     * Method to return objecct associated with the JWT token.  
     * This function is automatically called by the {@link JwtAuthGuard}.
     * @param payload payload object associated with JWT token (Automatically passed by passport).
     * @returns Returns user info object with `employeeId`, `companyId`, `role`, and `email`.
     */
    async validate(payload: any) {
        return { employeeId: payload.sub.employeeId, role: payload.sub.role, companyId: payload.sub.companyId, email: payload.username };
    }
}