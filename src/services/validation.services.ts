import { body, param, query, ValidationChain } from "express-validator";
import { User } from "../models/User.js";

class ValidationHandler {
    basicAuthValidation = [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email address must be provided")
            .isString()
            .withMessage("Email address must be a string")
            .isEmail()
            .withMessage("Invalid email address"),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password must be provided")
            .isString()
            .withMessage("Password must be a string")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters")
    ];


    newAuthValidation(
        validationPurpose: "login" | "signup"
    ): ValidationChain[] {
        if (validationPurpose === "signup") {
            return [
                ...this.basicAuthValidation,
                body("username")
                    .trim()
                    .notEmpty()
                    .withMessage("Username must be provided")
                    .isString()
                    .withMessage("Username must be a string")
                    .matches(/^[a-z0-9-]+$/)
                    .withMessage("Username may only contain lowercase letters, numbers, and hyphens")
                    .matches(/^[a-z0-9]/)
                    .withMessage("Username must start with a letter or number")
                    .matches(/.*[a-z0-9]$/)
                    .withMessage("Username cannot end with a hyphen")
                    .matches(/^(?!.*--).*$/)
                    .withMessage("Username cannot contain consecutive hyphens")
                    .custom(async (username: string) => {
                        try {
                            // ** Check if the users username already exists ** \\
                            const lowerCasedUsername = username.toLowerCase();
                            const user = await User.exists({ username: lowerCasedUsername });
                            if (user) throw new Error("A user with that username already exists please use another one");

                            return lowerCasedUsername;
                        } catch (err) {
                            console.error(`Error occured in "newAuthValidation" in file "validation.services.ts": ${err}`);

                            // ** If it's our custom error, re-throw it to preserve the message **
                            if (err instanceof Error && err.message.includes("A user with that username already exists")) {
                                throw err;
                            }

                            // ** Only throw generic error for actual server errors **
                            throw new Error("Error occured while trying to validate the provided username");
                        }
                    })
            ]
        }

        if (validationPurpose === "login") {
            return this.basicAuthValidation;
        }

        return [];
    };

    newBlogPostValidation(
        validationPurpose: "get-paginated-blog-posts" | "create-blog-post" | "postId" | "page"
    ): ValidationChain[] {

        if (validationPurpose === "get-paginated-blog-posts") {
            return [
                query("page")
                    .optional()
                    .trim()
                    .isString()
                    .withMessage("Page must be a string")
                    .customSanitizer((page) => {
                        const convertedPage = Number(page);
                        if (isNaN(convertedPage))
                            throw new Error("Invalid page");

                        return convertedPage
                    }),

                query("searchQuery")
                    .optional({ checkFalsy: true })
                    .trim()
                    .isString()
                    .withMessage("Search query must be a string"),
            ]
        };

        if (validationPurpose === "page") {
            return [
                query("page")
                    .optional()
                    .trim()
                    .isString()
                    .withMessage("Page must be a string")
                    .customSanitizer((page) => {
                        const convertedPage = Number(page);
                        if (isNaN(convertedPage))
                            throw new Error("Invalid page");

                        return convertedPage
                    }),
            ]
        }

        if (validationPurpose === "create-blog-post") {
            return [
                body("title")
                    .trim()
                    .notEmpty()
                    .withMessage("Blog post title must be provided")
                    .isString()
                    .withMessage("Blog post title must be a string")
                    .isLength({ min: 5 })
                    .withMessage("Blog post title must be at least 5 characters")
                    .isLength({ max: 100 })
                    .withMessage("Blog post title cannot exceed 100 characters"),

                body("content")
                    .trim()
                    .notEmpty()
                    .withMessage("Blog post content must be provided")
                    .isString()
                    .withMessage("Blog post content must be a string")
                    .isLength({ min: 100 })
                    .withMessage("Blog post content must be at least 100 characters")
                    .isLength({ max: 2000 })
                    .withMessage("Blog post content cannot exceed 2000 characters"),

                body("category")
                    .trim()
                    .notEmpty()
                    .withMessage("Blog post category must be provided")
                    .isString()
                    .withMessage("Blog post category must be a string")
                    .isLength({ min: 3 })
                    .withMessage("Blog post category must be at least 3 characters")
                    .isLength({ max: 30 })
                    .withMessage("Blog post category cannot exceed 30 characters"),
            ]
        };

        if (validationPurpose === "postId") {
            return [
                param("postId")
                    .trim()
                    .notEmpty()
                    .withMessage("Post id must be provided")
                    .isString()
                    .withMessage("Post id must be a string")
                    .isLength({ min: 24, max: 24 })
                    .withMessage("Post id must be exactly 24 characters")
            ]
        }
        return [];
    };

    newCommentValidation(validationPurpose: "comment-creation" | "commentId"): ValidationChain[] {
        if (validationPurpose === "comment-creation") {
            return [
                body("content")
                    .trim()
                    .notEmpty()
                    .withMessage("Comment must be provided")
                    .isString()
                    .withMessage("Comment must be a string")
                    .isLength({ min: 1 })
                    .withMessage("Comment must be at least 1 character")
                    .isLength({ max: 300 })
                    .withMessage("Comment cannot exceed 300 characters")
            ]
        };

        if (validationPurpose === "commentId") {
            return [
                param("commentId")
                    .trim()
                    .notEmpty()
                    .withMessage("Comment id must be provided")
                    .isString()
                    .withMessage("Comment id must be a string")
                    .isLength({ min: 24, max: 24 })
                    .withMessage("Comment id must be exactly 24 characters"),
            ]
        }
        return []
    }
};



export default ValidationHandler