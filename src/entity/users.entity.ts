import { Entity, Column, PrimaryColumn, JoinColumn, OneToMany, ManyToOne, OneToOne, Index } from 'typeorm';
import { Company } from "./company.entity";
import { Login } from './login.entity';
import { Recognition } from "./recognition.entity";

@Entity({name: "users"})
@Index(["companyId", "employeeId"], {unique: true})
export class Users {
    
    // @ManyToOne(()=>Company, {primary: true} )
    // @JoinColumn({name: "companyId", referencedColumnName: "companyId"})
    // company: Company;
    //FIXME: companyID is a primarycolumn but also a foreign key, still working on getting the foreign key part to work
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
    @JoinColumn()
    manager: Users;

    @OneToMany(()=>Recognition, rec=>rec.empFrom)
    recsSent: Recognition[];

    @OneToMany(()=>Recognition, rec=>rec.empTo)
    recsReceived: Recognition[];

    @OneToOne(() => Login)
    @JoinColumn()
    employee: Login;
}