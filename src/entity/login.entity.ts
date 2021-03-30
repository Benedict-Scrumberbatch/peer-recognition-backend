import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Users } from "./users.entity";


@Entity({name: "login"})
export class Login {
    @PrimaryColumn()
    email: string;

    @Column()
    password: string;

    @Column({default: '101'})
    refreshtoken: string;

    @Column({default: '101'})
    refreshtokenexpires: string;

    @OneToOne(() => Users)
    @JoinColumn()
    employee: Users;

}