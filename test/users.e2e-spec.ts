import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {UsersModule} from '../src/users/users.module'
import { AuthModule } from '../src/auth/auth.module';
import { Connection, getRepository, Repository } from 'typeorm';
import { Users } from '../src/dtos/entity/users.entity';
import { Login } from '../src/dtos/entity/login.entity';
import { getMaxListeners } from 'node:process';
import { Company } from '../src/dtos/entity/company.entity';
import { response } from 'express';
import * as bcrypt from 'bcrypt';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<Users>;
  let loginRepository: Repository<Login>;
  let companyRepository: Repository<Company>;
  beforeAll(async ()=>{
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, UsersModule, AuthModule],
      }).compile();
  
      app = moduleFixture.createNestApplication();
      await app.init();
      usersRepository = getRepository(Users);
      loginRepository = getRepository(Login);
      companyRepository = getRepository(Company);
      const company1 = companyRepository.create();
        company1.companyId = 1;
        company1.name = "test company";
        await companyRepository.save(company1);
        const user1 = new Users();
        user1.company = company1;
        user1.employeeId = 1;
        user1.firstName = "Joe";
        user1.lastName = "Jones";
        user1.isManager = false;
        user1.positionTitle = "employee"
        user1.startDate = new Date();
        await usersRepository.save(user1);
        const login1 = loginRepository.create();
        login1.email = "jjones@gmail.com";
        login1.employee = user1;
        const saltOrRounds = 3;
        const hash = await bcrypt.hash('password', saltOrRounds);
        login1.password = hash;
        await loginRepository.save(login1);
        
        
  })
  afterAll(async () => {
    await loginRepository.delete({email:"jjones@gmail.com"});
    await usersRepository.delete({employeeId:1});
    await companyRepository.delete({companyId:1});
    await app.close();
  })

  it('valid login', async ()=> {
    const resp = await request(app.getHttpServer()).post("/auth/login").send({"username":"jjones@gmail.com","password":"password"}).expect(201)
    expect(resp.body.access_token).toBeDefined()
  })
});
