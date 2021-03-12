import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../../entity/users.entity'

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Users)
        private usersRepository: Repository<Users>
    ) {}

    async getUser(employeeId: number, companyId: number): Promise<any | undefined> {
        return this.usersRepository.findOne( { relations: ["manager"], where: { employeeId: employeeId, companyId: companyId } } );
    }

    async removeUser(employeeId: number): Promise<void> {
        await this.usersRepository.delete(employeeId);
    }
}