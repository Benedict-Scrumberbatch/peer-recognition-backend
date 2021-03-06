import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, JoinTable, ManyToOne, Index, ManyToMany } from 'typeorm';
import { Company } from "./company.entity";
import { Users } from "./users.entity";
import { Tag } from "./tag.entity";

@Entity({name: "recognition"})
@Index(["company", "postDate"], {unique: true})
export class Recognition {
    @PrimaryGeneratedColumn()
    recId: number;

    @ManyToOne(()=> Company, company=>company.tags)
    company: Company;

    @Column("timestamp")
    postDate: Date;

    @ManyToOne(()=> Users, users=>users.recsSent)
    @JoinColumn([
        {referencedColumnName: "companyId"},
        {referencedColumnName: "employeeId"}
    ])
    empFrom: Users;

    @ManyToOne(()=> Users, users=>users.recsReceived)
    @JoinColumn([
        {referencedColumnName: "companyId"},
        {referencedColumnName: "employeeId"}
    ])
    empTo: Users;

    @ManyToMany(()=>Tag, tag=>tag.rec)
    @JoinTable()
    tags: Tag[];

    @Column()
    msg: string;
}