import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany } from 'typeorm';
import { Company } from './company.entity';

@Entity({name: "tag"})
export class Tag {
    @PrimaryGeneratedColumn()
    employeeId: number;

    @Column()
    value: string

    @ManyToOne(()=> Company, company=>company.tags)
    company: Company;
}