import { Entity, Column, PrimaryColumn, ManyToOne, ManyToMany } from 'typeorm';
import { Company } from './company.entity';
import { Recognition } from './recognition.entity';

@Entity({name: "tag"})
export class Tag {
    //this is not a PrimaryGeneratedColumn
    @PrimaryColumn()
    employeeId: number;

    @Column()
    value: string

    @ManyToOne(()=> Company, company=>company.tags)
    company: Company;

    @ManyToOne(()=> Recognition, rec=> rec.tags)
    rec: Recognition;
}