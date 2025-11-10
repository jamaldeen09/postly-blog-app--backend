import { ValidationChain } from "express-validator";
declare class ValidationHandler {
    basicAuthValidation: ValidationChain[];
    newAuthValidation(validationPurpose: "login" | "signup"): ValidationChain[];
    newBlogPostValidation(validationPurpose: "get-paginated-blog-posts" | "create-blog-post" | "postId" | "page"): ValidationChain[];
    newCommentValidation(validationPurpose: "comment-creation" | "commentId"): ValidationChain[];
}
export default ValidationHandler;
//# sourceMappingURL=validation.services.d.ts.map