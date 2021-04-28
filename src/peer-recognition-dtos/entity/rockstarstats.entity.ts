import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Users } from './users.entity';
import { Tag } from './tag.entity'; 
import { Rockstar } from './rockstar.entity'

@Entity({name: "rockstarstats"})
@Index(["month","year","rockstarID","tag"], {unique: true})
export class RockstarStats {
    @PrimaryGeneratedColumn('increment')
    tagstatId: number;
    
    @ManyToOne(() => Rockstar)
    rockstar: Rockstar;

    @ManyToOne(() => Tag)
    tag: Tag;


    @Column({default: 0})
    countReceived: number;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column()
    rockstarID: number

    @CreateDateColumn({ type: 'timestamp' })
    createdAt?: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt?: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt?: Date;
}