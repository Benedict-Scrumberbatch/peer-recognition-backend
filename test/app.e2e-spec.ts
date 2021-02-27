import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {getEmployeeRepository, getCompanyRepository, getLoginRepository} from "index";

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('database', () => {
  const cRep = getCompanyRepository();
  const eRep = getEmployeeRepository();
  const lRep = getLoginRepository();

  cRep.createAndSave({id: 1, name: "Totally Real Company Inc."});

  eRep.createAndSave({employeeID: 1, firstName: 'Test', lastName: 'User', positionTitle: 'A totally real job', startDate: 'February 29, 2021', managerID = 1, companyID = 1});
  
})
