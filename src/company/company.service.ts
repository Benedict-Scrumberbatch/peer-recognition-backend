import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Company } from '../dtos/entity/company.entity';

@Injectable()
export class CompanyService {

    /**
     * Constructor is called automatically by Nest.
     * @param companyRepository 
     */
    constructor(
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,

        
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
        //Will need to create tags in the tag table.
        company.tags = createcompanyDto.tags;

        await this.companyRepository.save(company);
        return company;
    }
    

    /**
     * Deletes a company from the database.
     * @param id specifies the id of the company that should be deleted.
     * @returns {@link DeleteResult} object.
     */
    async deleteComp(id: number):Promise<DeleteResult>{
        return await this.companyRepository.delete(id)
    }
} 
