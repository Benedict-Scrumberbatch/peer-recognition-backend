import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {UsersModule} from './../src/users/users.module'
import { AuthModule } from 'src/auth/auth.module';
import { Connection, getRepository } from 'typeorm';
import connection from './connection';
import { Users } from 'src/dtos/entity/users.entity';
import { Login } from 'src/dtos/entity/login.entity';
import { getMaxListeners } from 'node:process';
import { Company } from 'src/dtos/entity/company.entity';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async ()=>{
      await connection.create();
  })
  afterAll(async () => {
      await connection.clear();
      await connection.close();
      await app.close();
  })
  beforeEach(async () => {
    await connection.clear();
    const usersRepository = getRepository(Users);
    const loginRepository = getRepository(Login);
    const companyRepository = getRepository(Company);
    const company1 = companyRepository.create();
    company1.companyId = 1;
    company1.name = "test company";
    companyRepository.save(company1);
    const user1 = usersRepository.create();
    user1.company = company1;
    user1.employeeId = 1;
    user1.firstName = "Joe";
    user1.lastName = "Jones";
    user1.isManager = false;
    usersRepository.save(user1);
    const login1 = loginRepository.create();
    login1.email = "jjones@gmail.com";
    login1.employee = user1;
    login1.password = "password";
    loginRepository.save(login1);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UsersModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

  });
  it('valid login', ()=> {
      return request(app.getHttpServer()).post("/auth/login").send({"username":"jjones@gmail.com","password":"password"})

  })
});
