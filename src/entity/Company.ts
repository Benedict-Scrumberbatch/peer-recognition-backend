import { Entity, Column, PrimaryColumn, OneToMany, TableForeignKey } from 'typeorm';
import { Tag } from "./Tag";

@Entity({name: "company", synchronize: false})
export class Company {
    @PrimaryColumn()
    companyId: number;

    @Column()
    name: string;

    @OneToMany(()=>Tag, tag=>tag.company)
    tags: Tag[];
}