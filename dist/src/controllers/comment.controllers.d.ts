import { ApiResponse } from "../types/auth.types.js";
import { Request } from "express";
declare const getBlogPostComments: (req: Request, res: ApiResponse) => Promise<ApiResponse>;
declare const addNewComment: (req: Request, res: ApiResponse) => Promise<ApiResponse>;
declare const likeOrUnlikeAComment: (req: Request, res: ApiResponse) => Promise<ApiResponse>;
export { getBlogPostComments, addNewComment, likeOrUnlikeAComment };
//# sourceMappingURL=comment.controllers.d.ts.map