import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Login } from '../common/entity/login.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Users } from '../common/entity/users.entity';
import * as bcrypt from 'bcrypt';


/**
 * Service for the {@link AuthController}. Functional logic is kept here.
 */
@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService, 
        private jwtService: JwtService,
        @InjectRepository(Login)
        private loginRepo: Repository<Login>
        ) {}

    /**
     * Retrieves user object from the {@link UsersService} and verifies that the password matches.
     * This method is called by the {@link LocalStrategy}
     * @param username Email of user sent by API request
     * @param pass Password of user sent by API request
     * @returns User information object if password is correct, `null` if not. Password is stripped before being returned.
     */
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.loginUser(username);
        if (user ) {
            const passMatch = await bcrypt.compare(pass, user.password);
            if (passMatch) {
                const { password, ...result} = user;
                return result;
            }
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
    async refresh(user: Users & {email: string}) {
        const payload = { username: user.email, sub: { ...user } };
        const accessTokenExpireDate = new Date();
        accessTokenExpireDate.setMinutes(accessTokenExpireDate.getMinutes() + 5)
        return {
            access_token: this.jwtService.sign(payload),
            accessTokenExpire: accessTokenExpireDate,   // expire in 5 minutes
        };
    }

    /**
     * Method that edits the email and password of the user.
     * @param user Login details prior to change.
     * @param edits New login details (only email and password)
     * @returns
     */
    async editLogin(user: Login, edits: Login): Promise<UpdateResult> {
        let changes = {};
        if (edits.email) {
            changes['email'] = edits.email;
        }
        if (edits.password) {
            const saltOrRounds = 3;
            const hash = await bcrypt.hash(edits.password, saltOrRounds);
            changes['password'] = hash;
        }
        let result: UpdateResult = await this.loginRepo.createQueryBuilder()
            .update()
            .set(changes)
            .where("employeeCompanyId = :company", {company: user.employee.companyId})
            .andWhere("employeeEmployeeId = :employee", {employee: user.employee.employeeId})
            .execute();
        return result;
    }
}