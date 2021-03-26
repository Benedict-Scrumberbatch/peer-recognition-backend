import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entity/company.entity';


@Injectable()
export class CompanyService {

    constructor(
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,

        
    ){}
    
    async createCompany(createcompanyDto: Company): Promise<Company> {
        const company = new Company();

        company.companyId = createcompanyDto.companyId;
        company.name = createcompanyDto.name;
        
        company.recognitions = createcompanyDto.recognitions;
        company.tags = createcompanyDto.tags;

        await this.companyRepository.save(company);
        return company;
    }
} 
