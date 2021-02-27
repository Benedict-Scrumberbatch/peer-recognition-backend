import { Module } from "@nestjs/common";
import "reflect-metadata"; 
import {Connection, createConnection, getManager} from "typeorm";
import {Company, Employee, Login} from "./entity/databaseStarter.js";

var connection;

export async function connect(){
createConnection().then(async connection => { 
    
    const emps = connection.manager.getRepository(Employee);
    const comps = connection.manager.getRepository(Company);
    const logs = connection.manager.getRepository(Login);

    console.log(await emps.count({companyID : 1}));
}).catch(error => console.log(error));
}

export function connected(){
    return typeof connection !== 'undefined';
}

export function getEmployeeRepository(){
    return connection.getRepository(Employee);
}
export function getCompanyRepository(){
    return connection.getRepository(Company);
}
export function getLoginRepository(){
    return connection.getRepository(Login);
}
