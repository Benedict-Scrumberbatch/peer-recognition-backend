import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Company } from "./company.entity";
import { Users } from "./users.entity";

@Entity({name: "login"})
export class Login {
    @PrimaryColumn()
    email: string;

    @Column()
    pswd: string;

    @OneToOne(() => Users)
    @JoinColumn()
    employee: Users;

}