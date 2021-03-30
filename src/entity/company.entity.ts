import { Entity, Column, PrimaryColumn, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Tag } from "./tag.entity";
import { Recognition } from "./recognition.entity";
import { Users } from './users.entity';

@Entity({name: "company"})
export class Company {
    @PrimaryColumn()
    companyId: number;

    @Column()
    name: string;

    @OneToMany(()=>Tag, tag=>tag.company)
    @JoinColumn()
    tags: Tag[];

    @OneToMany(()=>Recognition, rec=>rec.company)
    recognitions: Recognition[];

    @OneToMany(()=>Users, user => user.company)
    users: Users[];

    @CreateDateColumn({default: () => "clock_timestamp()", type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({default: () => "clock_timestamp()", type: 'timestamp'})
    updatedAt: Date;
    
    @DeleteDateColumn({default: () => "null", type: 'timestamp'})
    deletedAt: Date;

}