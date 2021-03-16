import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Users } from '../entity/users.entity';
import { Login } from '../entity/login.entity';
import { Company } from '../entity/company.entity';
import {Recognition} from '../entity/recognition.entity';


@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        @InjectRepository(Login)
        private loginRepo: Repository<Login>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        @InjectRepository(Recognition)
        private recognitionRepository: Repository<Recognition>
        
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

    async removeUser(employeeId: number, companyId: number): Promise<DeleteResult> {
        const user = await this.usersRepository.findOne({ employeeId: employeeId, companyId: companyId })
        await this.loginRepo.delete({employee: user});
        return await this.usersRepository.delete(user);
    }
    
    async createUser(createuserDto: Users & Login): Promise<Users> {
        
        const user = new Users();
        // user.company = createuserDto.company;
        let company = await this.companyRepository.findOne()
        if (!company ) {
            company = await this.companyRepository.save({companyId: 1, name: 'Bennedict Scrumberbatch'})
        }
        user.company = company
        // const store = await this.usersRepository.find();
        
        // user.employeeId = store.length + 1;
        user.employeeId = createuserDto.employeeId;
        user.companyId = createuserDto.companyId;

        user.firstName = createuserDto.firstName;
        user.lastName = createuserDto.lastName;

        user.isManager = Boolean(createuserDto.isManager);
        user.positionTitle = createuserDto.positionTitle;
        user.startDate = new Date(createuserDto.startDate);
        
        // if (store.length > 0) 
        //     user.manager = await this.usersRepository.findOne({where:{employeeId : 1}}) // set employeeId 1 as manager for now
        user.manager = createuserDto.manager

        const login = new Login();
        login.email = createuserDto.email;
        login.password = createuserDto.password;
        login.employee = await this.usersRepository.save(user);
        await this.loginRepo.save(login);
        
        return user;
    }
    async getRockstar( companyId: number): Promise<any | undefined> {
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
        let queryString: string = year.toString() + "-" + prevMonth.toString() + "-%";
        let query = this.recognitionRepository.query('SELECT t1."empFromEmployeeId", MAX(t1.numRecog) FROM (select recognition."empFromEmployeeId", count(recognition."empFromEmployeeId") as numRecog from Recognition where "companyCompanyId" = ${companyID} and extract(Month from recognition."postDate") = ${prevMonth} and extract(Year from recognition."postDate") = ${year}  group by recognition."empFromEmployeeId" ) t1 group by t1."empFromEmployeeId";' );
        return query;

        //calculate and return rockstar
        //recognition module
    }
} 
