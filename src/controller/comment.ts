import { BaseContext, Context } from "koa";
import { description, request, summary, tagsAll, query, body } from "koa-swagger-decorator";
import { commentSchema, QunComment } from "../entity/qun_comment";
import { getManager, Repository } from "typeorm";
import { validate } from "class-validator";

function backData<T>(code: number, msg: string | T) {
    return {
        code,
        msg,
    };
}

@tagsAll(["General"])
export default class GeneralController {
    @request("get", "/comment")
    @summary("listing comments")
    @description("listing comments")
    @query({ page: { type: "number", required: true, description: "page" } })
    public static async getComments(ctx: BaseContext): Promise<void> {
        const page_raw = ctx.query.page;
        const page = Number(page_raw);
        if (!Number.isInteger(page)) {
            ctx.body = backData(1, "page required");
        } else if (!(page > 0)) {
            ctx.body = backData(1, "page need > 0");
        } else {
            const commentRepository: Repository<QunComment> = getManager().getRepository(QunComment);
            const per_page = 10;
            const skip = (per_page * page) - per_page;

            const comments = await commentRepository.find({
                order: { id: "DESC" },
                skip,
                take: per_page
            });
            ctx.body = backData(0, comments);
        }
    }

    @request("post", "/comment")
    @summary("create comment")
    @body(commentSchema)
    public static async createComment(ctx: Context): Promise<void> {
        const commentRepository: Repository<QunComment> = getManager().getRepository(QunComment);

        const new_comment = new QunComment();
        Object.assign(new_comment, {
            author: ctx.request.body.author,
            article: ctx.request.body.article,
            time: new Date(),
        });

        const errors = await validate(new_comment);
        if (errors.length > 0) {
            ctx.body = backData(1, errors);
        } else {
            const user = await commentRepository.save(new_comment);
            ctx.body = backData(0, user);
        }
    }
}
