import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: "users", synchronize: false})
export class Users {
    @PrimaryGeneratedColumn()
    employeeId: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    companyId: number;

    @Column()
    password: string;

    @Column()
    positionTitle: string;

    @Column()
    companyName: string;

    @Column()
    isManager: boolean;

    @Column()
    email: string;

    @Column("timestamp")
    startDate: Date;

    @Column()
    managerId: number;
}