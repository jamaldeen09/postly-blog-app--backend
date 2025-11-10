import { Request } from "express";
import { ApiResponse, ControllerResponse } from "../types/auth.types.js";
declare const getBlogPosts: (req: Request, res: ApiResponse) => ControllerResponse;
declare const getCreatedBlogPosts: (req: Request, res: ApiResponse) => ControllerResponse;
declare const getLikedBlogPosts: (req: Request, res: ApiResponse) => ControllerResponse;
declare const getArchivedBlogPosts: (req: Request, res: ApiResponse) => ControllerResponse;
declare const createBlogPost: (req: Request, res: ApiResponse) => ControllerResponse;
declare const likeOrUnlikeBlogPost: (req: Request, res: ApiResponse) => ControllerResponse;
declare const getSingleBlogPost: (req: Request, res: ApiResponse) => ControllerResponse;
declare const newBlogPostView: (req: Request, res: ApiResponse) => Promise<ApiResponse>;
declare const archiveOrUnarchiveBlogPost: (req: Request, res: ApiResponse) => ControllerResponse;
export { getBlogPosts, createBlogPost, getCreatedBlogPosts, getLikedBlogPosts, likeOrUnlikeBlogPost, getSingleBlogPost, newBlogPostView, getArchivedBlogPosts, archiveOrUnarchiveBlogPost };
//# sourceMappingURL=blogPost.controllers.d.ts.map