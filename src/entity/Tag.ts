import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany } from 'typeorm';
import { Company } from './Company';

@Entity({name: "tag", synchronize: false})
export class Tag {
    @PrimaryGeneratedColumn()
    employeeId: number;

    @Column()
    value: string

    @ManyToOne(()=> Company, company=>company.tags)
    company: Company;
}