import express from "express";
import ValidationHandler from "../services/validation.services.js";
import { expressValidationHandler, verifyAccessToken } from "../middlewares/auth.middlewares.js";
import { addNewComment, getBlogPostComments, likeOrUnlikeAComment } from "../controllers/comment.controllers.js";
const commentRouter = express.Router();
// ** Custom validation helper ** \\
const validationService = new ValidationHandler();
// ** Get blog post comments ** \\
commentRouter.get("/posts/:postId/comments", verifyAccessToken, validationService.newBlogPostValidation("postId"), validationService.newBlogPostValidation("page"), expressValidationHandler, getBlogPostComments);
// ** Add a new comment ** \\
commentRouter.post("/comments/:postId", verifyAccessToken, validationService.newBlogPostValidation("postId"), validationService.newCommentValidation("comment-creation"), expressValidationHandler, addNewComment);
// ** Like or unlike a comment ** \\
commentRouter.patch("/comments/:commentId/:postId", verifyAccessToken, validationService.newBlogPostValidation("postId"), validationService.newCommentValidation("commentId"), expressValidationHandler, likeOrUnlikeAComment);
export default commentRouter;
//# sourceMappingURL=comment.routes.js.map