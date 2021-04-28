import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../dtos/entity/users.entity';
import { Login } from '../dtos/entity/login.entity';
import { Company } from '../dtos/entity/company.entity';
import { TagStats } from '../dtos/entity/tagstats.entity';
import { CompanyService } from '../company/company.service';
import { Recognition } from '../dtos/entity/recognition.entity';
import { DeleteResult, Like, ILike, QueryBuilder, Repository, Brackets } from 'typeorm';
import { Query } from 'typeorm/driver/Query';
import { Role } from '../dtos/enum/role.enum';
import { throwError } from 'rxjs';
import { UserStats } from '../dtos/interface/userstats.interface';
import {
    paginate,
    Pagination,
    IPaginationOptions,
  } from 'nestjs-typeorm-paginate';
import { create } from 'node:domain';



/**
 * Service for {@link UsersController}. Functional logic is kept here.
 */
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

    //Must hash passwords
    //In reality will grab user information from the database.
    /**
     * Method called by the {@link AuthService} to retrieve the {@link Login} user object associated with the email.
     * @param username Email to specify the user.
     * @returns {@link Login} user object.
     */
    async loginUser(username: string): Promise<Login> {
        return this.loginRepo.findOne( { relations: ["employee"], where: { email: username } });
    }

    //Function retrieves user profile using their userId.
    /**
     * Returns {@link Users} object with user information and manager relation.
     * @param userId User's employee ID
     * @param companyId User's company ID
     * @returns {@link Users} object with manager relation.
     */
    async getProfile(userId: number, companyId: number): Promise<Users> {
        return this.usersRepository.findOne( { relations: ["manager"], where: { employeeId: userId, companyId: companyId } } );
    }
    /**
     * Returns {@link Users}[ ] object array with user information and manager relation.
     * @param companyId 
     * @returns object array with manager relation
     */
    //Function retrieves range of user profiles using companyID
    async getArrayOfUsers(companyId: number){
	    // I'm not sure this will work
	    let profileArray = await this.usersRepository.find({companyId: companyId});
	    console.log(profileArray);
	    return profileArray;
    }

    /**
     * Performs a soft delete on the specified user and their login information, but does not affect other relations (i.e. recs)
     * @param employeeId 
     * @param companyId 
     * @returns an array containing the user that was deleted
     */
    async removeUser(employeeId: number, companyId: number): Promise<Users[]> {
        const user = await this.usersRepository.findOne({ employeeId: employeeId, companyId: companyId });
        await this.loginRepo.softDelete({employee: user});
        return await this.usersRepository.softRemove([user]);
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

    /**
     * Method to create user: 
     * 
     * Required {@link Users} object, {@link Login} object, {@link managerId} number, {@link companyName} string
     * @param createuserDto 
     * @returns {@link Users} user is added to Database  
     */
    async createUser(createuserDto: Users & Login & {managerId: number} & {companyName: string}): Promise<Users> {    
        const user = new Users();
        if (createuserDto.company != undefined) {
            user.company = createuserDto.company;

        }
        else{
            if (createuserDto.companyId != undefined) {
                let company = await this.companyRepository.findOne({where:{companyId: createuserDto.companyId}})
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
        user.role = createuserDto.role;

        user.positionTitle = createuserDto.positionTitle;
        user.startDate = new Date(createuserDto.startDate);
        
        if (createuserDto.manager != undefined) {
            user.manager = createuserDto.manager;
        }
        else {
            if (createuserDto.managerId != undefined) {
                let Manager = await this.usersRepository.findOne({where:{companyId: createuserDto.companyId , 
                    employeeId : createuserDto.managerId}});
                if (Manager.isManager == false){
                    throw new BadRequestException('Invalid Manager')
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

    /**
     * Method to get user stats
     * @param employeeId 
     * @param companyId 
     * @returns {@link UserStats}
     */
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
    
    /**
     * Method to create array of {@link Users} object 
     * @param employeeMultiple 
     * @returns Array of {@link Users} object 
     */
    async createUserMultiple(employeeMultiple: []): Promise <any>{
        let arr_employee = [];
        for (let i = 0; i < employeeMultiple.length; i++) {
            arr_employee.push(await this.createUser(employeeMultiple[i]));
        }
        return arr_employee;
    }

    /**
     * Method to get Rockstar of the month
     * 
     * Returns {@link Users} object
     * @param companyId 
     * @returns 
     */
    async getRockstar( companyId: number): Promise<Users | undefined> {
        let date: Date = new Date();
        let prevMonth: number = -1;
        let year = date.getFullYear()
        if (date.getMonth() == 0)
        {
            prevMonth = 12;
            year = date.getFullYear() - 1;
        }
        else
        {
            //SQL takes 1 based months but the date object has 0 based months.
            prevMonth = date.getMonth();
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

    /**
     * Method to get Rockstar of the month recognitions
     * 
     * Returns: array of recognition 
     * @param rockstar 
     * @returns 
     */
    async getRockstarRecogs(rockstar: Users): Promise<any[]>{
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
            prevMonth = date.getMonth()
        }
        let recogs = await this.recognitionRepository.createQueryBuilder().select("*").where("Recognition.empToCompanyId = :compID", {compID : rockstar.company}).andWhere("Recognition.empToEmployeeId = :empID", {empID: rockstar.employeeId}).andWhere("extract(Month from Recognition.postDate) = :prvMonth",{prvMonth:prevMonth}).andWhere("extract(Year from Recognition.postDate) = :yr",{yr:year}).getRawMany();
        console.log(recogs);
        return recogs;
    }

    /**
     * Method to get Rockstar of the month stats
     * 
     * Returns: stats
     * @param rockstar 
     * @returns 
     */
    async getRockstarStats(rockstar: Users): Promise<any> {
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
            prevMonth = date.getMonth()
        }
        let results = {};
        let recogs = await this.recognitionRepository.createQueryBuilder().select("*").innerJoin("recognition_tags_tag","test","test.recognitionRecId = Recognition.recId").where("Recognition.empToCompanyId = :compID", {compID : rockstar.company}).andWhere("Recognition.empToEmployeeId = :empID", {empID: rockstar.employeeId}).andWhere("extract(Month from Recognition.postDate) = :prvMonth",{prvMonth:prevMonth}).andWhere("extract(Year from Recognition.postDate) = :yr",{yr:year}).getRawMany();
        for (let i = 0; i < recogs.length; ++i)
        {
            if (!(recogs[i].tagTagID in results))
            {
                results[recogs[i].tagTagId]= 1;
            }
            else 
            {
                let numTag = results[recogs[i].tagTagId];
                results[recogs[i].tagTagId]= numTag + 1;
            }
        }
        return results;
    }
   
    async paginate_username(options: IPaginationOptions, firstName: string, lastName: string, 
        search: string, comp_id: number): Promise<Pagination<Users>> {
        const queryBuilder = this.usersRepository.createQueryBuilder('user');
        queryBuilder.orderBy('user.firstName', 'ASC')
        // Must specify both firstname and lastname
        .where("user.companyId = :id", {id: comp_id})
        .andWhere(new Brackets (comp => {
            if (firstName != null && firstName != undefined 
                && lastName != null && lastName != undefined){
                comp.orWhere("user.firstName ilike :firstName", {firstName: '%'+firstName+'%'})
                .andWhere("user.lastName ilike :lastName", {lastName: '%'+lastName+'%'})
            }
            else {
                comp.orWhere("user.firstName ilike :firstName", {firstName: '%'+firstName+'%'})
                .orWhere("user.lastName ilike :lastName", {lastName: '%'+lastName+'%'})
            }
            // search: string return users with similar firstname and lastname
            if (search != null && search != undefined){
                const arr = search.split(' ', 2)
                if (arr.length > 1) {
                    comp.orWhere("user.firstName ilike :fn", {fn: '%'+arr[0]+'%'})
                    .andWhere("user.lastName ilike :ln", {ln: '%'+arr[1]+'%'})
                }
                else {
                    comp.orWhere("user.firstName ilike :search", {search: '%'+search+'%'})
                    .orWhere("user.lastName ilike :search", {search: '%'+search+'%'})
                }
            }
        })); 
        return paginate<Users>(queryBuilder, options);
    }

} 
