import Router from "@koa/router";

import { config } from "./config";
import { comment } from "./controller";

const unprotectedRouter = new Router();
unprotectedRouter.prefix(config.prefixPath);

unprotectedRouter.get("/comment", comment.getComments);
unprotectedRouter.post("/comment", comment.createComment);

export { unprotectedRouter };
