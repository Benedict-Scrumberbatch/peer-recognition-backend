import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../../entity/users.entity';
import { Company } from '../../entity/company.entity';
import { Recognition } from '../../entity/recognition.entity';
import { CreateUserDto } from './create-user.dto';
import { Tag } from 'src/entity/tag.entity';
import { Login } from 'src/entity/login.entity';

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

        @InjectRepository(Login)
        private loginRepository: Repository<Login>,
    ) {}

    async findAll(): Promise<Users[]> {
        return await this.usersRepository.find();
    }
    
    async findOne(employeeId: number): Promise<Users> {
        return await this.usersRepository.findOne({employeeId: employeeId});
    }

    async removeUser(employeeId: number): Promise<void> {
        await this.usersRepository.delete({ employeeId: employeeId });
    }
    
    async createUser(createuserDto: CreateUserDto): Promise<Users> {
        // // Hard-coded rec
        // const rec = new Recognition();
        // rec.recId = 1;

        // // Hard-coded tag
        // const tag = new Tag();
        // tag.tagId = 1;
        // tag.value = 'Cool';

        
        // company.tags.push(tag);        

        // tag.company = company;
        // tag.companyCompanyId = 1;
        // tag.rec = rec;

        // this.tagRepository.save(tag);
        // this.recognitionsRepository.save(rec);

        // Hard-coded Manager
        // const manager = new Users();
        // manager.companyId = 1;
        // manager.employeeId = 1;
        // manager.firstName = 'Sahil';
        // manager.lastName = 'Malhotra';
        // manager.isManager = true;
        // manager.manager = null;
        // manager.positionTitle = 'Project Manager';
        // manager.startDate = new Date(Date.now());
        // this.usersRepository.save(manager);

        // // Hard-coded company
        // const company = new Company();
        // company.companyId = 1;
        // company.name = 'Bennedict Scrumberbatch';
        // this.companyRepository.save(company);
        
        const user = new Users();
        user.company = await this.companyRepository.findOne({where:{companyId : createuserDto.companyId}})

        const store = await this.usersRepository.find();
        
        user.employeeId = store.length + 1;
        user.companyId = createuserDto.companyId;

        user.firstName = createuserDto.firstName;
        user.lastName = createuserDto.lastName;

        user.isManager = createuserDto.isManager;
        user.positionTitle = createuserDto.positionTitle;
        user.startDate = new Date(Date.now());
        
        if (store.length > 0) 
            user.manager = await this.usersRepository.findOne({where:{employeeId : 1}}) // set employeeId 1 as manager for now

        const login = new Login();
        login.email = createuserDto.firstName + createuserDto.lastName + '@ukg.com';
        login.pswd = createuserDto.pswd;
        login.employee = await this.usersRepository.save(user);
        this.loginRepository.save(login);
        
        return user;
    }
}