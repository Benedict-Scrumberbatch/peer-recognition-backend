import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../../entity/users.entity';
import { CreateUserDto } from './create-user.dto';

@Injectable()
export class AdminService { 
    constructor(
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
    ) {}

    findAll(): Promise<Users[]> {
        return this.usersRepository.find();
    }
    
    findOne(employeeId: number): Promise<Users> {
        return this.usersRepository.findOne(employeeId);
    }

    async removeUser(employeeId: number): Promise<void> {
        await this.usersRepository.delete(employeeId);
    }
    

}