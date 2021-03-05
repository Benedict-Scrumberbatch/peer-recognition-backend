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
    positionTitle: string;

    @Column()
    companyName: string;

    @Column()
    isManager: boolean;

    @Column("timestamp")
    startDate: Date;

    @Column()
    managerId: number;
}