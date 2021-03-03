import { Injectable, HttpException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
    constructor(private usersService: UsersService) {}

    getUser(username: string): Promise<any> {
        return new Promise(resolve => {
            const user = this.usersService.findOne(username);
            if (!user) {
                throw new HttpException('User does not exist', 404)
            }
            resolve(user);
        });
    }
    addUser(user): Promise<any> {
        return new Promise(resolve => {
            this.usersService.users.push(user);
            resolve(this.usersService.users);
        })
    }
}
