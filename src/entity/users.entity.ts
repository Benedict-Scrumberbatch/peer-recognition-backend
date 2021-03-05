import { Entity, Column, PrimaryColumn, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { Company } from "./company.entity";
import { Recognition } from "./recognition.entity";

@Entity({name: "user", synchronize: false})
export class Users {
    @PrimaryColumn()
    employeeId: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @PrimaryColumn()
    @JoinColumn()
    companyId: number;

    @Column()
    positionTitle: string;

    @Column()
    companyName: string;

    @Column()
    isManager: boolean;

    @Column("timestamp")
    startDate: Date;

    @ManyToOne(()=> Users)
    @JoinColumn()
    manager: Users;

    @OneToMany(()=>Recognition, rec=>rec.empFrom)
    recsSent: Recognition[];

    @OneToMany(()=>Recognition, rec=>rec.empTo)
    recsReceived: Recognition[];

    @Column()
    msg: string;
}