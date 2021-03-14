import { Entity, Column, PrimaryColumn, JoinColumn, OneToMany, ManyToOne, OneToOne, Index } from 'typeorm';
import { Company } from "./company.entity";
import { Login } from './login.entity';
import { Recognition } from "./recognition.entity";

@Entity({name: "users"})
export class Users {
    
    @ManyToOne(()=>Company, {primary: true} )
    @JoinColumn({name: "companyId", referencedColumnName: "companyId"})
    company: Company;
    
    //for some reason this works... I feel like this should be making two columns with the same name, so if there is an error that looks like that it might be here.
    @PrimaryColumn()
    companyId: number;

    @PrimaryColumn()
    employeeId: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    positionTitle: string;

    @Column()
    isManager: boolean;

    @Column("timestamp")
    startDate: Date;

    @ManyToOne(()=> Users)
    @JoinColumn([
        {referencedColumnName: "companyId"},
        {referencedColumnName: "employeeId"}
    ])
    manager: Users;

    @OneToMany(()=>Recognition, rec=>rec.empFrom)
    recsSent: Recognition[];

    @OneToMany(()=>Recognition, rec=>rec.empTo)
    recsReceived: Recognition[];

    // This relation was making it impossible to create rows in the table.
    // @OneToOne(() => Login)
    // @JoinColumn()
    // employee: Login;
}