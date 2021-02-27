import {Entity, PrimayGeneratedColumn, PrimaryColumn, Column, OneToMany, ManyToOne, JoinColumn, Index} from "typeorm";

@Entity()
export class Company {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(type => Employee, employee => employee.companyID)
    employees: Employee[];
}

@Entity()
@Index(["companyID", "employeeID"], {unique: true}) //specifies a composite primary key
export class Employee {
    @Column()
    employeeID: number;
    @Column()
    firstName: string;
    @Column()
    lastName: string;
    @Column()
    positionTitle: string;
    @Column()
    startDate: date;
    @Column()
    managerID: number;
    @Column()
    isManager: boolean;
    @Column()
    @ManyToOne(type => Company, company => company.employees)
    companyID: number;
}

@Entity()
export class Login {
    @PrimaryColumn()
    email: String;
    @Column()
    pswd: String;
    @Column()
    empID: number;
    @Column()
    compID: number;
}