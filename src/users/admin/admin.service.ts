import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../../entity/users.entity';
import { Company } from '../../entity/company.entity';
import { Recognition } from '../../entity/recognition.entity';
import { CreateUserDto } from './create-user.dto';
import { Tag } from 'src/entity/tag.entity';

@Injectable()
export class AdminService { 
    constructor(
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,

        @InjectRepository(Company)
        private companyRepository: Repository<Company>,

        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>, 

        @InjectRepository(Recognition)
        private recognitionsRepository: Repository<Recognition>,
    ) {}

    findAll(): Promise<Users[]> {
        return this.usersRepository.find();
    }
    
    findOne(employeeId: number): Promise<Users> {
        return this.usersRepository.findOne(employeeId);
    }

    // async removeUser(companyId: number, employeeId: number): Promise<void> {
    //     await this.usersRepository.delete({ companyId: companyId, employeeId: employeeId  } );
    // }
    
    createUser(createuserDto: CreateUserDto): Promise<Users> {
        // // Hard-coded rec
        // const rec = new Recognition();
        // rec.recId = 1;

        // // Hard-coded tag
        // const tag = new Tag();
        // tag.tagId = 1;
        // tag.value = 'Cool';

        // // Hard-coded company
        // const company = new Company();
        // company.companyId = 1;
        // company.name = 'Bennedict Scrumberbatch';
        // company.tags.push(tag);        

        // tag.company = company;
        // tag.companyCompanyId = 1;
        // tag.rec = rec;

        // this.companyRepository.save(company);
        // this.tagRepository.save(tag);
        // this.recognitionsRepository.save(rec);

        const user = new Users();
        user.company = null;    // Null for now
        user.employeeId = createuserDto.employeeId;
        user.companyId = createuserDto.companyId;

        user.firstName = createuserDto.firstName;
        user.lastName = createuserDto.lastName;

        user.isManager = createuserDto.isManager;
        user.positionTitle = createuserDto.positionTitle;
        user.startDate = new Date(Date.now());
        
        user.manager = null;    // Null for now

        return this.usersRepository.save(user);
    }
}