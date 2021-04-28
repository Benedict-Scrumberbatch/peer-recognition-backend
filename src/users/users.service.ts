import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../peer-recognition-dtos/entity/users.entity';
import { Login } from '../peer-recognition-dtos/entity/login.entity';
import { Company } from '../peer-recognition-dtos/entity/company.entity';
import { TagStats } from '../peer-recognition-dtos/entity/tagstats.entity';
import { CompanyService } from '../company/company.service';
import { Recognition } from '../peer-recognition-dtos/entity/recognition.entity';
import { DeleteResult, QueryBuilder, Repository } from 'typeorm';
import { Query } from 'typeorm/driver/Query';
import { Role } from '../peer-recognition-dtos/enum/role.enum';


export interface UserStats {
    numRecsReceived: number,
    numRecsSent: number,
    tagStats: TagStats[]
}

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        @InjectRepository(Login)
        private loginRepo: Repository<Login>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        @InjectRepository(TagStats)
        private tagStatsRepo: Repository<TagStats>,
        @InjectRepository(Recognition)
        private recognitionRepository: Repository<Recognition>,
        private companyservice: CompanyService,
    ){}

   /* async storeRefreshToken(refreshToken:string, email:string, refreshtokenexpires){
        await this.loginRepo.update(email, {refreshtoken:refreshToken, refreshtokenexpires});
    }
    */
    //Must hash passwords
    //In reality will grab user information from the database.

    async loginUser(username: string): Promise<Login> {
        return this.loginRepo.findOne( { relations: ["employee"], where: { email: username } });
    }

    //Function retrieves user profile using their userId.
    async getProfile(userId: number, companyId: number): Promise<Users> {
        return this.usersRepository.findOne( { relations: ["manager"], where: { employeeId: userId, companyId: companyId } } );
    }

    //Function retrieves range of user profiles using companyID
    async getArrayOfUsers(companyId: number){
	    // I'm not sure this will work
	    let profileArray = await this.usersRepository.find({companyId: companyId});
	    console.log(profileArray);
	    return profileArray;
    }

    async removeUser(employeeId: number, companyId: number): Promise<DeleteResult> {
        const user = await this.usersRepository.findOne({ employeeId: employeeId, companyId: companyId })
        await this.loginRepo.delete({employee: user});  // if delete performs a hard delete, I think this is the behavior we want: removing the email and password record
        return await this.usersRepository.softDelete(user);
    }
    // TEMPORARY ONLY
    // Create Dummy if Database is empty.
    // This endpoint will add admin Dummy
    async createDummy(): Promise<Users> {
        const user = new Users();
        user.role = Role.Admin;
        user.employeeId = 0;
        user.firstName = 'dummy';
        user.lastName = 'dummy';
        user.isManager = true;
        user.positionTitle = 'dummy';
        user.startDate = new Date("2014-12-18");

        let company = await this.companyservice.createCompany({
            companyId: 1, 
            name: 'dummy', 
            tags: undefined, recognitions: undefined,
            users: undefined
        });
        user.company = company

        const login = new Login();
        login.email = 'dummy';
        login.password = 'dummy';
        login.employee = await this.usersRepository.save(user);
        await this.loginRepo.save(login);
        return user
    }

    async createUser(createuserDto: Users & Login & {managerId: number} & {companyName: string}): Promise<Users> {    
        const user = new Users();
        if (createuserDto.company != undefined) {
            user.company = createuserDto.company;

        }
        else{
            if (createuserDto.companyId != undefined) {
                let company = await this.companyRepository.findOne({where:{companyId: createuserDto.companyId}})
                // If company.name to companyName if they are not the same
                // Don't 
                if (company.name != createuserDto.companyName){
                    company.name = createuserDto.companyName; 
                    await this.companyRepository.save(company)
                }

                if (!company ) {
                    let createCompany = new Company();
                    createCompany.companyId = createuserDto.companyId;
                    createCompany.name = createuserDto.lastName;
                    createCompany.tags = undefined;
                    createCompany.recognitions = undefined;
                    createCompany.users = [createuserDto];
                    company = await this.companyservice.createCompany(createCompany);
                }
                user.company = company
            }
        }
        user.employeeId = createuserDto.employeeId;
        user.companyId = createuserDto.companyId;

        user.firstName = createuserDto.firstName;
        user.lastName = createuserDto.lastName;

        // Will add different level of admin 
        user.isManager = Boolean(createuserDto.isManager);
        if (createuserDto.role === Role.Admin){
            user.role = createuserDto.role;
        }
        // else {
        //     if (user.isManager) {
        //         user.role = Role.Admin
        //     }
        // }

        user.positionTitle = createuserDto.positionTitle;
        user.startDate = new Date(createuserDto.startDate);
        
        if (createuserDto.manager != undefined) {
            user.manager = createuserDto.manager;
        }
        else {
            if (createuserDto.managerId != undefined) {
                let Manager = await this.usersRepository.findOne({where:{companyId: createuserDto.companyId , 
                    employeeId : createuserDto.managerId}});
                // If manager status of managerId is false, then set it to true and set role to Admin
                if (Manager != undefined && Manager.isManager == false) {
                    Manager.isManager = true;
                    Manager.role = Role.Admin;
                    await this.usersRepository.save(Manager);
                }
                user.manager = Manager;
            }
        }

        const login = new Login();
        login.email = createuserDto.email;
        login.password = createuserDto.password;
        login.employee = await this.usersRepository.save(user);
        await this.loginRepo.save(login);
        
        return user;
    }


    async userStats(employeeId: number, companyId: number): Promise<UserStats> {
        let user = await this.usersRepository.findOne({
            relations: ["tagStats", "tagStats.tag"],
            where: { employeeId: employeeId, companyId: companyId } 
        });

        let userStats: UserStats = {
            numRecsSent: user.numRecsSent,
            numRecsReceived: user.numRecsReceived,
            tagStats: user.tagStats
        }
        
        return userStats;
    }
    
    async createUserMultiple(employeeMultiple: []): Promise <any>{
        let arr_employee = [];
        for (let i = 0; i < employeeMultiple.length; i++) {
            arr_employee.push(await this.createUser(employeeMultiple[i]));
        }
        return arr_employee;
    }
} 
