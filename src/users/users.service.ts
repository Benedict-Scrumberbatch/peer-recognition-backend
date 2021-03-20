import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Users } from '../entity/users.entity';
import { Login } from '../entity/login.entity';
import { Company } from '../entity/company.entity';
import { CompanyService } from 'src/company/company.service';


@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        @InjectRepository(Login)
        private loginRepo: Repository<Login>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        
        private companyservice: CompanyService,
    ){}

    //Must hash passwords
    //In reality will grab user information from the database.

    async loginUser(username: string): Promise<any | undefined> {
        return this.loginRepo.findOne( { relations: ["employee"], where: { email: username } });
    }

    //Function retrieves user profile using their userId.
    async getProfile(userId: number, companyId: number): Promise<any | undefined> {
        return this.usersRepository.findOne( { relations: ["manager"], where: { employeeId: userId, companyId: companyId } } );
    }

    async removeUser(employeeId: number, companyId: number): Promise<DeleteResult> {
        const user = await this.usersRepository.findOne({ employeeId: employeeId, companyId: companyId })
        await this.loginRepo.delete({employee: user});
        return await this.usersRepository.delete(user);
    }
    
    async createUser(createuserDto: Users & Login & {managerId: number} & {companyName: string}): Promise<Users> {    
        const user = new Users();
        if (createuserDto.company != undefined) {
            user.company = createuserDto.company;
        }
        else{
        if (createuserDto.companyId != undefined) {}
            let company = await this.companyRepository.findOne({where:{companyId: createuserDto.companyId}})
            if (!company ) {
                company = await this.companyservice.createCompany({companyId: createuserDto.companyId, name: createuserDto.companyName, 
                    tags: undefined, recognitions: undefined})
            }
            user.company = company
        }

        user.employeeId = createuserDto.employeeId;
        user.companyId = createuserDto.companyId;

        user.firstName = createuserDto.firstName;
        user.lastName = createuserDto.lastName;

        user.isManager = Boolean(createuserDto.isManager);
        user.positionTitle = createuserDto.positionTitle;
        user.startDate = new Date(createuserDto.startDate);
        
        if (createuserDto.manager != undefined) {
            user.manager = createuserDto.manager;
        }
        else {
        if (createuserDto.managerId != undefined) {
            let Manager = await this.usersRepository.findOne({where:{companyId: createuserDto.companyId , 
                employeeId : createuserDto.managerId}});
            // If manager status of managerId is false, then set it to true
            if (Manager != undefined && Manager.isManager == false) {
                Manager.isManager = true;
                await this.usersRepository.save(Manager);
            }
            user.manager = Manager;
        }}

        const login = new Login();
        login.email = createuserDto.email;
        login.password = createuserDto.password;
        login.employee = await this.usersRepository.save(user);
        await this.loginRepo.save(login);
        
        return user;
    }

    async createUserMultiple(employeeMultiple: []): Promise <any>{
        let arr_employee = [];
        for (let i = 0; i < employeeMultiple.length; i++) {
            arr_employee.push(await this.createUser(employeeMultiple[i]));
        }
        return arr_employee;
    }

} 
