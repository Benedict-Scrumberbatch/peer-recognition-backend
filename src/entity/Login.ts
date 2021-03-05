import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Company } from "./Company";
import { Users } from "./Users";

@Entity({name: "login", synchronize: false})
export class Login {
    @PrimaryColumn()
    email: string;

    @Column()
    pswd: string;

    @OneToOne(() => Users)
    @JoinColumn()
    employee: Users;

}