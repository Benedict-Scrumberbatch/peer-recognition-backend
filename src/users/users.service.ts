import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../dtos/entity/users.entity';
import { Login } from '../dtos/entity/login.entity';
import { Company } from '../dtos/entity/company.entity';
import { TagStats } from '../dtos/entity/tagstats.entity';
import { CompanyService } from '../company/company.service';
import { Recognition } from '../dtos/entity/recognition.entity';
import { DeleteResult, Like, QueryBuilder, ILike, Repository, getConnection, Brackets } from 'typeorm';
import { Query } from 'typeorm/driver/Query';
import { Role } from '../dtos/enum/role.enum';
import { throwError } from 'rxjs';
import { UserStats } from '../dtos/interface/userstats.interface';
import {
    paginate,
    Pagination,
    IPaginationOptions,
  } from 'nestjs-typeorm-paginate';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';    
import { create } from 'node:domain';
import { Console } from 'node:console';

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

   /* async storeRefreshToken(refreshToken:string, email:string, refreshtokenexpires){
        await this.loginRepo.update(email, {refreshtoken:refreshToken, refreshtokenexpires});
    }
    */
    //Must hash passwords
    //In reality will grab user information from the database.
    /**
     * Method called by the {@link AuthService} to retrieve the {@link Login} user object associated with the email.
     * @param username Email to specify the user.
     * @returns {@link Login} user object.
     */
    async loginUser(username: string): Promise<Login> {
        return this.loginRepo.findOne( { relations: ["employee", "employee.manager"], where: { email: username } });
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
    
    /**
     * Method to create user: 
     * 
     * Required {@link Users} object, {@link Login} object, {@link managerId} number, {@link companyName} string
     * @param createuserDto 
     * @returns {@link Users} user is added to Database  
     */
    async createUser(createuserDto: Users & Login 
         & {companyName: string},
        requestId: number, creator_role: Role): Promise<Users> {    

        const user = new Users();
        let company = await this.companyRepository.findOne({companyId: requestId})
        if (!company) {
            throw new BadRequestException({error: 'Company Id does not exist'});
        }
        user.company = company
        user.employeeId = createuserDto.employeeId;
        user.companyId = requestId;

        user.firstName = createuserDto.firstName;
        user.lastName = createuserDto.lastName;
    
        user.isManager = Boolean(createuserDto.isManager);

        // Only be able to add lower ranking user 
        if (createuserDto.role != undefined){
            if (Role[creator_role] >= Role[createuserDto.role]){
                user.role = createuserDto.role;
            }
            else {
                throw new BadRequestException({error: 'Creating higher ranking user is not permitted'});
            }
        }
        user.positionTitle = createuserDto.positionTitle;
        user.startDate = new Date(createuserDto.startDate);
        user.managerId = createuserDto.managerId;
        
        const login = new Login();
        login.email = createuserDto.email;
        login.password = createuserDto.password;
        const saveduser = await this.usersRepository.save(user);
        login.employee = saveduser
        await this.loginRepo.save(login);
        // user.login = await this.loginRepo.save(login);
        
        return saveduser;
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
     * Method to create {@link Users} in the database from an array input
     * @param employeeMultiple 
     * @returns Array of {@link Users} object 
     */
    async createUserMultiple(employeeMultiple: (Users & Login & {companyName: string})[], cId: number): Promise <Users[]>{
        let users = [];
        let logins = [];
        for (let i = 0; i < employeeMultiple.length; i++) {
            const user = new Users();
            user.company = await this.companyRepository.findOne({where:{companyId: cId}})

            user.employeeId = employeeMultiple[i].employeeId;
            // ignore input company id and override with the valid company id.
            user.companyId = cId;
            user.firstName = employeeMultiple[i].firstName;
            user.lastName = employeeMultiple[i].lastName;
            user.isManager = Boolean(employeeMultiple[i].isManager);
            user.role = employeeMultiple[i].role;
            user.positionTitle = employeeMultiple[i].positionTitle;
            user.startDate = new Date(employeeMultiple[i].startDate);
            user.managerId = employeeMultiple[i].managerId;

            const login = new Login();
            login.email = employeeMultiple[i].email;
            login.password = employeeMultiple[i].password;
            login.employee = user;
            logins.push(login);
            users.push(user);
        }

        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try{
            await queryRunner.manager.insert(Users, users);
            await queryRunner.manager.insert(Login, logins);
            queryRunner.commitTransaction();
            queryRunner.release();
            return users;
        }
        catch(error){
            await queryRunner.rollbackTransaction();
            queryRunner.release();
            return [];
        }
    }

   
    async paginate(options: IPaginationOptions): Promise<Pagination<Users>> {
        return paginate<Users>(this.usersRepository, options);
    }

    /**
     * Method to get Rockstar of the month stats
     * 
     * @param rockstar 
     * @returns stats
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
   
    async paginate_username(options: IPaginationOptions, firstName: string, lastName: string, search: string, comp_id: number): Promise<Pagination<Users>> {
        const matchCase = firstName || lastName;
        const queryBuilder = this.usersRepository.createQueryBuilder('user');
        queryBuilder.orderBy('user.firstName', 'ASC')
        // Must specify both firstname and lastname
        .where("user.companyId = :id", {id: comp_id})
        .leftJoinAndSelect('user.manager', 'manager');
        if(search || matchCase){
            queryBuilder.andWhere(new Brackets (comp => {
                if (search) {
                    comp.orWhere("user.firstName ilike :search", {search: '%'+search+'%'})
                    .orWhere("user.lastName ilike :search", {search: '%'+search+'%'});
                }
                if (matchCase) {
                    comp.orWhere(new Brackets (bracket => {
                        if (firstName) {
                            bracket.andWhere("user.firstName ilike :firstName", {firstName: '%'+firstName+'%'});
                        }
        
                        if (lastName) {
                            bracket.andWhere("user.lastName ilike :lastName", {lastName: '%'+lastName+'%'});
                        }
        
                    }));
                }        
            })); 
        }
      
        return paginate<Users>(queryBuilder, options);
    }

    /**
     * 
     * @param empID ID of the logged in user
     * @param newUser new User object to update old user
     * @returns the new User object which was used to update the user
     */
    async editUserDetails(requester: Users, employeeId: number, newUser: Users){
        if(requester.employeeId !== employeeId && requester.role !== Role.Admin){
            throw new UnauthorizedException();
        }
        const user = await this.usersRepository.findOne({employeeId, companyId: requester.companyId});
        user.firstName = newUser.firstName;
        user.lastName = newUser.lastName;
        if (requester.role === Role.Admin) {
            user.positionTitle = newUser.positionTitle;
            user.startDate = newUser.startDate;
            user.isManager = newUser.isManager
        }
        return await this.usersRepository.save(user);
    }

} 
