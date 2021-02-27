import "reflect-metadata"; 
import {Connection, createConnection, getManager} from "typeorm";
import {Company, Employee, Login} from "./entity/databaseStarter.js";

createConnection().then(async connection => { 

    
    const testCompany = new Company();
    testCompany.id = 1; testCompany.name = "Totally Real Company Inc.";

    const testUser = new Employee();
    testUser.employeeID = 1; testUser.firstName = "Test"; testUser.lastName = "User"; 
    testUser.positionTitle = "A totally real job"; testUser.startDate = "February 29, 2021"; 
    testUser.managerID = 1; testUser.companyID = 1;

    const testLogin = new Login();
    testLogin.email = "myemail@address.com"; testLogin.pswd = "password"; 
    testLogin.empID = 1; testLogin.companyID = 1;

    const emps = connection.manager.getRepository(Employee);
    const comps = connection.manager.getRepository(Company);
    const logs = connection.manager.getRepository(Login);

    console.log(await emps.count({companyID : 1}));
}).catch(error => console.log(error));


