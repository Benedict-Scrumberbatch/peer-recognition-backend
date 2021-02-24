import { Injectable } from '@nestjs/common';

//Change to a real interface
export type User = any;

@Injectable()
export class UsersService {
    //Must hash passwords
    //In reality will grab user information from the database.
    private readonly users = [ //Temporary dummy users.
        {
            userId: 1,
            username: 'greg',
            password: 'password1'
        },
        {
            userId: 2,
            username: 'bob',
            password: 'password2'
        }
    ];

    async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
    }
}
