import { Entity, Column, PrimaryColumn, OneToMany, TableForeignKey } from 'typeorm';
import { Tag } from "./tag.entity";
import { Recognition } from "./recognition.entity";
import { Users } from "./users.entity";

@Entity({name: "company"})
export class Company {
    @PrimaryColumn()
    companyId: number;

    @Column()
    name: string;

    @OneToMany(()=>Tag, tag=>tag.company)
    tags: Tag[];

    @OneToMany(()=>Recognition, rec=>rec.company)
    recognitions: Recognition[];

    @OneToMany(()=>Users, employee=>employee.company)
    employees: Users[];

}