import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, Index } from 'typeorm';
import { Company } from './company.entity';
import { Recognition } from './recognition.entity';

@Entity({name: "tag"})
@Index(["companyCompanyId", "tagId"])
export class Tag {
    @PrimaryGeneratedColumn()
    tagId: number;

    @Column()
    value: string

    @ManyToOne(()=> Company, company=>company.tags)
    company: Company;

    @Column()
    companyCompanyId: number;

    @ManyToMany(()=> Recognition, rec=> rec.tags)
    rec: Recognition;
}