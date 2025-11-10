import express from "express";
import ValidationHandler from "../services/validation.services.js";
import { expressValidationHandler, verifyAccessToken } from "../middlewares/auth.middlewares.js";
import { archiveOrUnarchiveBlogPost, createBlogPost, getArchivedBlogPosts, getBlogPosts, getCreatedBlogPosts, getLikedBlogPosts, getSingleBlogPost, likeOrUnlikeBlogPost, newBlogPostView } from "../controllers/blogPost.controllers.js";
const blogPostRouter = express.Router();
// ** Custom validation helper ** \\
const validationService = new ValidationHandler();
// ** Custom blog post route ** \\
const getRoute = (resource, controller) => {
    return (blogPostRouter.get(resource, verifyAccessToken, validationService.newBlogPostValidation("get-paginated-blog-posts"), expressValidationHandler, controller));
};
// ** Route to get paginated blog posts ** \\
getRoute("/posts", getBlogPosts);
// ** Route to get created blog posts ** \\
getRoute("/posts/created", getCreatedBlogPosts);
// ** Route to get liked blog posts ** \\
getRoute("/posts/liked", getLikedBlogPosts);
// ** Route to get archived blog posts ** \\
getRoute("/posts/archived", getArchivedBlogPosts);
// ** Route to create a blog post ** \\
blogPostRouter.post("/posts", verifyAccessToken, validationService.newBlogPostValidation("create-blog-post"), expressValidationHandler, createBlogPost);
// ** Route to like/unlike a blog post ** \\
blogPostRouter.patch("/posts/:postId", verifyAccessToken, validationService.newBlogPostValidation("postId"), expressValidationHandler, likeOrUnlikeBlogPost);
// ** Route to get a single blog post ** \\
blogPostRouter.get("/posts/:postId", verifyAccessToken, validationService.newBlogPostValidation("postId"), expressValidationHandler, getSingleBlogPost);
// ** Registers a users view on a blog post ** \\
blogPostRouter.post(`/posts/:postId/view`, verifyAccessToken, validationService.newBlogPostValidation("postId"), expressValidationHandler, newBlogPostView);
// ** Route to add/remove blog posts from a users archived ** \\
blogPostRouter.patch("/posts/:postId/archive", verifyAccessToken, validationService.newBlogPostValidation("postId"), expressValidationHandler, archiveOrUnarchiveBlogPost);
export default blogPostRouter;
//# sourceMappingURL=blogPost.routes.js.map