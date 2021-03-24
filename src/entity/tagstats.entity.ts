import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Users } from './users.entity';
import { Tag } from './tag.entity';

@Entity({name: "tagstats"})
@Index(["employee", "tag"], {unique: true})
export class TagStats {
    @PrimaryGeneratedColumn('increment')
    tagstatId: number;
    
    @ManyToOne(() => Users, users=>users.tagStats)
    employee: Users;

    @ManyToOne(() => Tag)
    tag: Tag;

    @Column({default: 0})
    countReceived: number;

    @Column({default: 0})
    countSent: number;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;
    
    @DeleteDateColumn({type: 'timestamp'})
    deletedAt: Date;

}