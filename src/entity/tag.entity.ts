import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, Index, PrimaryColumn } from 'typeorm';
import { Company } from './company.entity';
import { Recognition } from './recognition.entity';

@Entity({name: "tag"})
@Index(["tagId"], {unique: true})
export class Tag {
    @PrimaryGeneratedColumn()
    tagId: number;

    @Column()
    value: string

    // @Index()
    @ManyToOne(()=> Company, company=>company.tags, {primary: true})
    company: Company;

    @Index()
    @Column()
    companyCompanyId: number;

    @ManyToMany(()=> Recognition, rec=> rec.tags)
    rec: Recognition;
}