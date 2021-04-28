import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../peer-recognition-dtos/entity/company.entity';
import { DeleteResult} from 'typeorm';


@Injectable()
export class CompanyService {

    constructor(
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,

        
    ){}
    async getCompany(): Promise<Company[]>{
        return await this.companyRepository.find({relations:["tags"]});
    }
    async getOneCompany(id:number): Promise<Company>{
        return await this.companyRepository.findOne({relations:["tags"], where:{companyId:id}})
    }
    async createCompany(createcompanyDto: Company): Promise<Company> {
        const company = new Company();

        company.companyId = createcompanyDto.companyId;
        company.name = createcompanyDto.name;
        
        company.recognitions = createcompanyDto.recognitions;
        //Will need to create tags in the tag table.
        company.tags = createcompanyDto.tags;

        company.users = createcompanyDto.users;

        await this.companyRepository.save(company);
        return company;
    }
    
    async deleteComp(id: number):Promise<DeleteResult>{
        return await this.companyRepository.delete(id)
    }
} 
