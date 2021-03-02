import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './users.entity';
//Change to a real interface
export type User = any;

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(Users)
        private usersRepository: Repository<Users>
    ){}

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
        // return this.users.find(user => user.username === username);
        let user = this.usersRepository.findOne({ where: { email: username } });
        console.log(user);
        return user;
    }
}
