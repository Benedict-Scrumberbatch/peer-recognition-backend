import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, JoinTable, ManyToOne, Index, ManyToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Company } from "./company.entity";
import { Users } from "./users.entity";
import { Tag } from "./tag.entity";

@Entity({name: "recognition"})
@Index(["company", "postDate"])
export class Recognition {
    @PrimaryGeneratedColumn()
    recId: number;

    @ManyToOne(()=> Company, company=>company.recognitions)
    company: Company;

    @Column("timestamp")
    postDate: Date;

    @ManyToOne(()=> Users, users=>users.recsSent)
    @JoinColumn()
    empFrom: Users;

    @ManyToOne(()=> Users, users=>users.recsReceived)
    @JoinColumn()
    empTo: Users;

    @ManyToMany(()=>Tag, tag=>tag.rec)
    @JoinTable()
    tags: Tag[];

    @Column()
    msg: string;
    
    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    @DeleteDateColumn({type: 'timestamp'})
    deletedAt: Date;

    @ManyToOne(()=> Users, users=>users.recsDeleted)
    @JoinColumn()
    deletedBy: Users;

}