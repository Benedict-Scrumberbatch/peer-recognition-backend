import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, Index, PrimaryColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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
    
    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
}