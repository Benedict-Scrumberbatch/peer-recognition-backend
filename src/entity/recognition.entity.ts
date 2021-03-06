import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, Index, OneToMany } from 'typeorm';
import { Company } from "./company.entity";
import { Users } from "./users.entity";
import { Tag } from "./tag.entity";

@Entity({name: "recognition"})
@Index(["company", "recID"], {unique: true})
export class Recognition {
    @PrimaryGeneratedColumn()
    recId: number;

    @ManyToOne(()=> Company, company=>company.tags)
    company: Company;

    @Column("timestamp")
    postDate: Date;

    @ManyToOne(()=> Users, users=>users.recsSent)
    @JoinColumn()
    empFrom: Users;

    @ManyToOne(()=> Users, users=>users.recsReceived)
    @JoinColumn()
    empTo: Users;

    @OneToMany(()=>Tag, tag=>tag.rec)
    @JoinColumn()
    tags: Tag[];

}