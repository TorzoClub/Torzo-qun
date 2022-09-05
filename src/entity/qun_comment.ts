import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
// import { Length, IsEmail } from "class-validator";

@Entity()
export class QunComment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 64, nullable: false })
    // @Length(10, 80)
    author: string;

    @Column({ type: "longtext", nullable: false })
    // @Length(20, 100)
    article: string;

    @Column({ type: "datetime", nullable: false })
    time: Date;
}

export const commentSchema = {
    id: { type: "number", required: true, example: 1 },
    author: { type: "string", required: true, example: "vec" },
    article: { type: "string", required: true, example: "这是一篇正文" }
};
