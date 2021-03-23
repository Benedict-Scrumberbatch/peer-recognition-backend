import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Users } from '../entity/users.entity';
import { Login } from '../entity/login.entity';
import { Company } from '../entity/company.entity';
import { TagStats } from '../entity/tagstats.entity';
import { CompanyService } from 'src/company/company.service';
import { Recognition } from '../entity/recognition.entity';
import { Query } from 'typeorm/driver/Query';


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
        private tagStatsRepo: Repository<TagStats>
        @InjectRepository(Recognition)
        private recognitionRepository: Repository<Recognition>,
        private companyservice: CompanyService,
    ){}

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
        await this.loginRepo.delete({employee: user});
        return await this.usersRepository.delete(user);
    }
    
    async createUser(createuserDto: Users & Login & {managerId: number} & {companyName: string}): Promise<Users> {    
        const user = new Users();
        if (createuserDto.company != undefined) {
            user.company = createuserDto.company;
        }
        else{
            if (createuserDto.companyId != undefined) {
                let company = await this.companyRepository.findOne({where:{companyId: createuserDto.companyId}})
                if (!company ) {
                    company = await this.companyservice.createCompany({
                        companyId: createuserDto.companyId, 
                        name: createuserDto.companyName, 
                        tags: undefined, recognitions: undefined,
                        users: [createuserDto]
                    });
                }
                user.company = company
            }
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

    async getRockstar( companyId: number): Promise<Users | undefined> {
        let date: Date = new Date();
        let prevMonth: number = -1;
        let year = date.getFullYear()
        if (date.getMonth() == 1)
        {
            prevMonth = 12;
            year = date.getFullYear() - 1;
        }
        else
        {
            prevMonth = date.getMonth() - 1
        }
        let queryString :string = `SELECT * FROM (SELECT t1."empToEmployeeId", MAX(t1.numRecog) as numRecognitions FROM (select recognition."empToEmployeeId", count(recognition."empToEmployeeId") as numRecog from Recognition where recognition."empToCompanyId" = ${companyId} and extract(Month from recognition."postDate") = ${ prevMonth } and extract(Year from recognition."postDate") = ${ year } group by recognition."empToEmployeeId" ) t1 group by t1."empToEmployeeId") t2, users where t2."empToEmployeeId" = users."employeeId";`
        let retQuery= await this.recognitionRepository.query(queryString);
        let maxRecog: number = 0;
        let maxIndex: number = 0;
        for (let i = 0; i < retQuery.length;i++ )
        {
            if (retQuery[i].max > maxRecog)
            {
                maxRecog = retQuery.max;
                maxIndex = i;
            }
        }
        let rawRockstar = retQuery[maxIndex];
        let rockstar: Users = new Users();
        rockstar.company = rawRockstar.companyId;
        rockstar.employeeId = rawRockstar.employeeId;

        rockstar.firstName = rawRockstar.firstName;
        rockstar.lastName = rawRockstar.lastName;

        rockstar.isManager = rawRockstar.isManager;
        rockstar.positionTitle = rawRockstar.positionTitle;
        rockstar.startDate = new Date(rawRockstar.startDate);
        rockstar.role = rawRockstar.role;

        rockstar.manager = await this.usersRepository.findOne({where:{employeeId : rawRockstar.managerEmployeeId}})


        return rockstar;

        //calculate and return rockstar
        //recognition module
    }
} 
