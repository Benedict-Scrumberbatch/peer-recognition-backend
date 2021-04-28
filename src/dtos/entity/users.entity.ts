import { Entity, Column, PrimaryColumn, JoinColumn, OneToMany, ManyToOne, OneToOne, Index, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Company } from "./company.entity";
import { Login } from './login.entity';
import { Recognition } from "./recognition.entity";
import { Role } from "../enum/role.enum";
import { TagStats} from './tagstats.entity';
import { Report } from './report.entity';
import { Rockstar} from './rockstar.entity';

@Entity({name: "users"})
@Index(['companyId', 'employeeId'], {unique: true})
export class Users {
    
    @ManyToOne(()=>Company, {primary: true} )
    @JoinColumn({name: "companyId", referencedColumnName: "companyId"})
    company: Company;
    
    // This looks duplicated, but don't delete it. It is just the same as the JoinColumn. 
    // This is necessary to make the foreign key also act as a primary key for Users.
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

    @Column({ 
        type: "enum", 
        enum: Role, 
        default: Role.Employee})
    role: Role;

    @Column("timestamp")
    startDate: Date;

    @ManyToOne(()=> Users)
    @JoinColumn()
    manager: Users;

    @OneToMany(()=>Users, emp=>emp.manager)
    managed: Users[];

    @OneToMany(()=>Recognition, rec=>rec.empFrom)
    recsSent: Recognition[];

    @OneToMany(()=>Recognition, rec=>rec.empTo)
    recsReceived: Recognition[];

    @Column({default: 0})
    numRecsReceived: number;

    @Column({default: 0})
    numRecsSent: number;

    // This relation was making it impossible to create rows in the table.
    @OneToOne(() => Login)
    login: Login;

    @OneToMany(() => TagStats, tagstats => tagstats.employee)
    tagStats: TagStats[];

    @OneToMany(()=>Recognition, rec=>rec.deletedBy)
    recsDeleted?: Recognition[];

    @OneToMany(() => Report, report=>report.employeeFrom)
    report: Report[];

    @OneToMany(() => Rockstar, rockstar=>rockstar.rockstar)
    rockstar: Rockstar[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt?: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt?: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt?: Date;
}