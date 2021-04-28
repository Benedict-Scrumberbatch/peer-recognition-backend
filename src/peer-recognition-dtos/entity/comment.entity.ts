import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn, DeleteDateColumn} from 'typeorm';
import { Users } from './users.entity';
import { Recognition } from './recognition.entity';

@Entity({name: "comment"})
@Index(["employeeFrom","recognition", "CommentDate"], {unique: true})
export class Comment {
    @PrimaryGeneratedColumn('increment')
    commentID: number;
    
    @ManyToOne(() => Users)
    @JoinColumn()
    employeeFrom: Users;

    @ManyToOne(() => Recognition, Recognition => Recognition.comments)
    recognition: Recognition ;

    @Column("timestamp")
    CommentDate: Date

    @CreateDateColumn({ type: 'timestamp' })
    createdAt?: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt?: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt?: Date;

}