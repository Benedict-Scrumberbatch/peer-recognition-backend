import { Entity, Column, PrimaryGeneratedColumn, Generated } from 'typeorm';

@Entity("login")
export class Login {
    @PrimaryGeneratedColumn('increment')
    employeeId: number;

    @Column({type: 'int' })
    companyId: number;

    @Column()
    email: string;

    @Column()
    password: string;
}