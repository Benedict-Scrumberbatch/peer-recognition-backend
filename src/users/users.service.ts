import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from 'src/entity/Users';
import { Login } from 'src/entity/Login';
//Change to a real interface
export type User = any;

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        @InjectRepository(Login)
        private loginRepo: Repository<Login>
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
        return this.loginRepo.findOne( { where: { email: username }});
    }
}
