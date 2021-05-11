import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../dtos/entity/tag.entity';
import { DeleteResult, Repository } from 'typeorm';
import { Company } from '../dtos/entity/company.entity';
import { Users } from '../dtos/entity/users.entity';
import { Role } from '../dtos/enum/role.enum';
import { Login } from '../dtos/entity/login.entity';
import { TagService } from '../tag/tag.service';
import { create } from 'node:domain';


@Injectable()
export class CompanyService {
    /**
     * Constructor is called automatically by Nest.
     * @param companyRepository 
     */
    constructor(
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        @InjectRepository(Login)
        private loginRepo: Repository<Login>,
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>, 
        private tagservice: TagService,
    
    ){}

    /**
     * Retrieves all companies in database.
     * @returns Array of Company objects.
     */
    async getCompany(): Promise<Company[]>{
        return await this.companyRepository.find({relations:["tags"]});
    }

    /**
     * Retrieves company specified by ID.
     * @param id Specifies the companyID to search for.
     * @returns {@link Company} object.
     */
    async getOneCompany(id:number): Promise<Company>{
        return await this.companyRepository.findOne({relations:["tags"], where:{companyId:id}})
    }

    /**
     * Creates a company in the database.
     * @param createcompanyDto Company object that specifies new company information.
     * @returns {@link Company} object that was created in the database.
     */
    async createCompany(createcompanyDto: Company): Promise<Company> {
        const company = new Company();

        company.companyId = createcompanyDto.companyId;
        company.name = createcompanyDto.name;
        
        company.recognitions = createcompanyDto.recognitions;
        // Create tags if tags do not exist in DB
        company.tags = createcompanyDto.tags;
        if (createcompanyDto.tags != null && createcompanyDto.tags != undefined){
            for (let i = 0; i < createcompanyDto.tags.length; i++){ 
                let tag = await this.tagRepository.findOne({where:{tagId: createcompanyDto.tags[i].tagId}})
                if (!tag ) {
                    await this.tagservice.createTag(createcompanyDto.companyId, createcompanyDto.tags[i].value);
                }
            }
        }
        // if there is no initial employee 
        if (createcompanyDto.users == undefined || createcompanyDto.users == null) {
            // Create a default admin account when create empty company 
            const user = new Users();
            user.role = Role.Admin;
            user.employeeId = 0;
            user.firstName = 'Admin';
            user.lastName = 'Admin';
            user.isManager = true;
            user.positionTitle = 'Admin';
            user.startDate = new Date("2014-12-18");
            user.company = company;
            user.companyId = createcompanyDto.companyId;

            const login = new Login();
            login.email = `admin@${company.name.toLowerCase().replace(/\s/g, '')}.com`
            login.password = 'password';

            // company.users = [user];

            await this.companyRepository.save(company)
            login.employee = await this.usersRepository.save(user);
            await this.loginRepo.save(login);
        }
        else {
            company.users = createcompanyDto.users;
            await this.companyRepository.save(company);
        }
        return company;
    }
    
    // Soft Delete Company 
    /**
     * Deletes a company from the database.
     * @param id specifies the id of the company that should be deleted.
     * @returns {@link DeleteResult} object.
     */
    async deleteComp(id: number): Promise<Company[]>{
        const company = await this.companyRepository.createQueryBuilder('company')
        .where('company.companyId = :id', {id: id})
        .leftJoinAndSelect('company.users', 'users')
        .leftJoinAndSelect('users.login', 'login')
        .leftJoinAndSelect('company.recognitions', 'recognitions')
        .leftJoinAndSelect('company.tags', 'tags')
        .getOne();
        return await this.companyRepository.softRemove([company]);
    }
} 
