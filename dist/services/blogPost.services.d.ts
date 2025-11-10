import { Request } from "express";
import { ApiResponse, ApiResponsePayload } from "../types/auth.types.js";
declare const getPaginatedBlogPosts: (req: Request, res: ApiResponse, blogPostType: "all-posts" | "liked-posts" | "created-posts" | "archived-posts") => Promise<ApiResponsePayload>;
export { getPaginatedBlogPosts };
//# sourceMappingURL=blogPost.services.d.ts.map