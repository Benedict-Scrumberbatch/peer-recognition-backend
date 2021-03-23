import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, Index, PrimaryColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Recognition } from './recognition.entity';
import { TagStats } from './tagstats.entity';

@Entity({name: "tag"})
export class Tag {
    @PrimaryGeneratedColumn()
    tagId: number;

    @Column()
    value: string

    @Index()
    @ManyToOne(()=> Company, company=>company.tags)
    company: Company;

    @ManyToMany(()=> Recognition, rec=> rec.tags)
    rec: Recognition;

    @OneToMany(() => TagStats, stats => stats.tag)
    tagstats: TagStats[];
}