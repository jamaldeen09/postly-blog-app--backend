import { Request } from "express";
import { ApiResponse, ConfiguredRequest, ControllerResponse } from "../types/auth.types.js";
import { deleteOperation, readOperation, writeOperation } from "../services/cache.services.js";
import { BlogPost, IBlogPostQuery } from "../models/BlogPost.js";
import { User } from "../models/User.js";
import { getPaginatedBlogPosts } from "../services/blogPost.services.js";
import { BlogPostSchema, InitialDbBlogPosts } from "../types/blogPost.types.js";


const getBlogPosts = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {
        const dataResult = await getPaginatedBlogPosts(req, res, "all-posts");
        return res.status(dataResult.statusCode).json(dataResult);
    } catch (err) {
        console.error(`Error occured in "getBlogPosts" in file "blogPosts.controllers.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to fetch blog posts, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        })
    }
};

const getCreatedBlogPosts = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {
        const dataResult = await getPaginatedBlogPosts(req, res, "created-posts");
        return res.status(dataResult.statusCode).json(dataResult);
    } catch (err) {
        console.error(`Error occured in "getCreatedBlogPosts" in file "blogPosts.controllers.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to fetch your created blog posts, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        })
    }
};

const getLikedBlogPosts = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {
        const dataResult = await getPaginatedBlogPosts(req, res, "liked-posts");
        return res.status(dataResult.statusCode).json(dataResult);
    } catch (err) {
        console.error(`Error occured in "getLikedBlogPosts" in file "blogPosts.controllers.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to fetch your liked blog posts, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        })
    }
};

const getArchivedBlogPosts = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {
        const dataResult = await getPaginatedBlogPosts(req, res, "archived-posts");
        return res.status(dataResult.statusCode).json(dataResult);
    } catch (err) {
        console.error(`Error occured in "getLikedBlogPosts" in file "blogPosts.controllers.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to fetch your liked blog posts, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        })
    }
}

const createBlogPost = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {
        // ** Extract users id attached to request ** \\
        const userId = (req as ConfiguredRequest).accessTokenPayload.userId;

        // ** Extract validated data from request ** \\
        const blogPostData = (req as ConfiguredRequest).data as {
            title: string;
            content: string;
            category: string;
        };

        // ** Check if the user creating the blog post exists ** \\
        const user = await User.exists({ _id: userId });

        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                statusCode: 404,
                error: "Not found"
            });

        // ** If the user does exist then create a new blog post with them as the author ** \\
        const blogPost = await BlogPost.create({
            ...blogPostData,
            author: user._id
        });

        // ** Delete any past cache patterns ** \\
        deleteOperation("patterns", undefined, `posts-page:`);
        deleteOperation("patterns", undefined, `user:${user._id}-createdPosts-page:`);

        // ** Return a success response that contains the id of the newly created post ** \\
        return res.status(201).json({
            success: true,
            message: "Blog post successfully created",
            statusCode: 201,
            data: { postId: blogPost._id.toString() }
        });
    } catch (err) {
        console.error(`Error occured in "createBlogPost" in file "blogPosts.controllers.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to create your blog post, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        })
    }
};

const likeOrUnlikeBlogPost = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {

        // ** Extract valdiated postId attached to req.data ** \\
        const postId = ((req as ConfiguredRequest).data as { postId: string }).postId;

        // ** Extract users id attached to request ** \\
        const userId = (req as ConfiguredRequest).accessTokenPayload.userId;

        // ** Look for the user ** \\
        const user = await User.exists({ _id: userId });

        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                statusCode: 404,
                error: "Not found"
            });

        // ** Look for the post ** \\
        const blogPostBeingMutated = await BlogPost.findById(postId)
            .lean<IBlogPostQuery>()
            .select("likes _id author")

        if (!blogPostBeingMutated)
            return res.status(404).json({
                success: false,
                message: "The blog post you are trying to like/unlike was not found",
                statusCode: 404,
                error: "Not found"
            });

        // ** Check if the requesting user is the owner/creator of the post ** \\
        if (blogPostBeingMutated.author.equals(user._id))
            return res.status(400).json({
                success: false,
                message: "You cannot like/unlike your post",
                statusCode: 400,
            });

        // ** Determine liked status and update conditionally ** \\
        let updatedBlogPost: IBlogPostQuery = null;
        const isBlogPostLiked = blogPostBeingMutated.likes.some((like) => like.equals(user._id));

        if (isBlogPostLiked) {
            // ** Unlike it ** \\
            updatedBlogPost =
                await BlogPost.findByIdAndUpdate(blogPostBeingMutated._id, {
                    $pull: { likes: user._id }
                }, { new: true })
                    .lean<IBlogPostQuery>()
                    .select("_id author category title content comments likes views createdAt updatedAt")
                    .populate({ path: "author", model: "User", select: "_id username" })
        } else {
            // ** Like it ** \\
            updatedBlogPost =
                await BlogPost.findByIdAndUpdate(blogPostBeingMutated._id, {
                    $addToSet: { likes: user._id }
                }, { new: true })
                    .lean<IBlogPostQuery>()
                    .select("_id author category title content comments likes views createdAt updatedAt isArchived")
                    .populate({ path: "author", model: "User", select: "_id username" })
        };

        // ** Extra check for safety concerns just in case ** \\
        if (!updatedBlogPost)
            return res.status(404).json({
                success: false,
                message: "The blog post you are trying to like/unlike was not found",
                statusCode: 404,
                error: "Not found"
            });

        const typedRequestedPost = updatedBlogPost as unknown as InitialDbBlogPosts;
        const mutatedPost: BlogPostSchema = {
            ...typedRequestedPost,
            comments: typedRequestedPost.comments.length,
            likes: typedRequestedPost.likes.length,
            views: typedRequestedPost.views.length,
            isLikedByCurrentUser: typedRequestedPost.likes.some((like) => like.equals(userId)),
            createdAt: typedRequestedPost.createdAt.toISOString(),
            updatedAt: typedRequestedPost.updatedAt.toISOString(),
        };

        // ** Store blog post in cache ** \\
        writeOperation(mutatedPost, `post:${updatedBlogPost._id}`);

        // ** Delete any other liked posts pattern with the requesting users id ** \\
        deleteOperation("patterns", undefined, `user:${user._id}-likedPosts-page:`);
        deleteOperation("patterns", undefined, `posts-page:`);
        deleteOperation("patterns", undefined, `user:${user._id}-createdPosts-page:`);


        // ** Return a success response ** \\
        return res.status(200).json({
            success: true,
            message: `Blog post has been successfully ${isBlogPostLiked ? "unliked" : "like"}`,
            statusCode: 200,
            data: { likes: updatedBlogPost.likes.length }
        });
    } catch (err) {
        console.error(`Error occured in "likeOrUnlikeBlogPost" in file "blogPost.controllers.ts": ${err}`);
        // ** Error handling ** \\

        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to like/unlike the requested blog post, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        })
    }
};


const getSingleBlogPost = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {
        // ** Extract the user's id attached to request ** \\
        const userId = (req as ConfiguredRequest).accessTokenPayload.userId;

        // ** Extract the requested posts id ** \\
        const postId = ((req as ConfiguredRequest).data as { postId: string }).postId;

        // ** Check if the post exists in cache ** \\
        const cacheKey = `post:${postId}`
        const cachedPost = readOperation(cacheKey);

        if (!cachedPost) {
            // ** Check if the post the user is requesting exists ** \\
            const requestedPost: IBlogPostQuery = await BlogPost.findById(postId)
                .lean<IBlogPostQuery>()
                .select("_id author category title content comments likes views createdAt updatedAt isArchived")
                .populate({ path: "author", model: "User", select: "_id username" })

            if (!requestedPost)
                return res.status(404).json({
                    success: false,
                    message: "Post was not found",
                    statusCode: 404,
                    error: "Not found"
                });

            if (requestedPost.isArchived)
                return res.status(406).json({
                    success: false,
                    message: "The creator of this blog post has archived it",
                    statusCode: 406,
                })


            // ** Mutate the post to return the expected data ** \\
            const typedRequestedPost = requestedPost as unknown as InitialDbBlogPosts;
            const mutatedPost: BlogPostSchema = {
                ...typedRequestedPost,
                content: typedRequestedPost.content,
                comments: typedRequestedPost.comments.length,
                likes: typedRequestedPost.likes.length,
                views: typedRequestedPost.views.length,
                isLikedByCurrentUser: typedRequestedPost.likes.some((like) => like.equals(userId)),
                createdAt: typedRequestedPost.createdAt.toISOString(),
                updatedAt: typedRequestedPost.updatedAt.toISOString(),
            };

            // ** Store the data in cache ** \\
            writeOperation(mutatedPost, cacheKey);

            // ** Return a success response ** \\
            return res.status(200).json({
                success: true,
                message: "Post fetched successfully",
                statusCode: 200,
                data: { post: mutatedPost }
            });
        } else {
            // ** Cache hit (simply just return the cached post) ** \\
            const parsedCachedPost: BlogPostSchema = JSON.parse(cachedPost);

            return res.status(200).json({
                success: true,
                message: "Post fetched successfully",
                statusCode: 200,
                data: { post: parsedCachedPost }
            })
        }
    } catch (err) {
        console.error(`Error occured in "getSingleBlogPost" in file "blogPost.controllers.ts": ${err}`);
        // ** Error handling ** \\

        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to fetch your requeste blog post, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        })
    }
};


const newBlogPostView = async (
    req: Request,
    res: ApiResponse
) => {
    try {
        // ** Extract users's id attached to request ** \\
        const userId = (req as ConfiguredRequest).accessTokenPayload.userId;
        const postId = ((req as ConfiguredRequest).data as { postId: string }).postId;

        // ** Check if the user requesting to view the post exists ** \\
        const userRequestingPost = await User.exists({ _id: userId });

        if (!userRequestingPost) {
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                statusCode: 404,
                error: "Not found"
            });
        }

        // ** Check if the post exists ** \\
        const postBeingViewed = await BlogPost.findById(postId)
            .lean<IBlogPostQuery>()
            .select("author _id views");

        if (!postBeingViewed) {
            return res.status(404).json({
                success: false,
                message: "Post was not found",
                statusCode: 404
            });
        }

        // ** Extra check to prevent view update for blog post owners ** \\
        if (postBeingViewed.author.equals(userRequestingPost._id)) {
            return res.status(406).json({
                success: false,
                message: "Post view cannot be registered if you are the owner of the post",
                statusCode: 406
            });
        }

        // ** Extra check to prevent people that have already viewed the post from registering a new view ** \\
        if (postBeingViewed.views.some((view) => view.equals(userRequestingPost._id))) {
            return res.status(406).json({
                success: false,
                message: "Post view cannot be registered if you have already viewed it before",
                statusCode: 406
            });
        }

        // ** If the post does exist update its views ** \\
        const updatedPost: IBlogPostQuery = await BlogPost.findByIdAndUpdate(
            postBeingViewed._id,
            {
                $addToSet: { views: userRequestingPost._id }
            },
            {
                new: true
            }
        ).lean<IBlogPostQuery>()
            .select("_id author category title content comments likes views createdAt updatedAt isArchived");

        if (!updatedPost) {
            return res.status(404).json({
                success: false,
                message: "Post was not found",
                statusCode: 404,
                error: "Not found"
            });
        }

        // ** Mutate the updated post to store in cache ** \\
        const typedRequestedPost = updatedPost as unknown as InitialDbBlogPosts;
        const mutatedPost: BlogPostSchema = {
            ...typedRequestedPost,
            comments: typedRequestedPost.comments.length,
            likes: typedRequestedPost.likes.length,
            views: typedRequestedPost.views.length,
            isLikedByCurrentUser: typedRequestedPost.likes.some((like) => like.equals(userRequestingPost._id)),
            createdAt: typedRequestedPost.createdAt.toISOString(),
            updatedAt: typedRequestedPost.updatedAt.toISOString(),
        };

        // ** Store the mutated post in cache ** \\
        writeOperation(mutatedPost, `post:${mutatedPost._id}`);

        // ** Delete some cache patterns to prevent stale data ** \\
        deleteOperation("patterns", undefined, `posts-page:`);
        deleteOperation("patterns", undefined, `user:${userRequestingPost._id}-createdPosts-page:`);
        deleteOperation("patterns", undefined, `user:${userRequestingPost._id}-likedPosts-page:`);

        // ** Return a success response ** \\
        return res.status(200).json({
            success: true,
            message: "Post view registered",
            statusCode: 200
        });

    } catch (err) {
        console.error(`Error occured in "newBlogPostView": ${err} in file "blogPost.controllers.ts"`);

        // ** Error handling ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to register your post view, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        });
    }
};

const archiveOrUnarchiveBlogPost = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {
        // ** Extract the requesting user's id attached to request ** \\
        const userId = (req as ConfiguredRequest).accessTokenPayload.userId;

        // ** Extract the validated post id from request ** \\
        const postId = ((req as ConfiguredRequest).data as { postId: string }).postId;

        // ** Check if the user exists in the database ** \\
        const user = await User.exists({ _id: userId });
        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                statusCode: 404,
                error: "Not found"
            });

        // ** Check if the blog post exists ** \\
        const postBeingArchived = await BlogPost.findById(postId)
            .lean<IBlogPostQuery>()
            .select("author _id isArchived");

        if (!postBeingArchived)
            return res.status(404).json({
                success: false,
                message: "The blog post you requested to archive was not found",
                statusCode: 404,
                error: "Not found"
            });

        // ** Check if the owner of the blog post is the requesting user ** \\
        if (!postBeingArchived.author.equals(user._id))
            return res.status(400).json({
                success: false,
                message: "You cannot archive a blog post that does not belong to you",
                statusCode: 400
            });

        // ** Update the blog post ** \\
        let updatedBlogPost: IBlogPostQuery = await BlogPost.findByIdAndUpdate(postBeingArchived._id, {
            $set: { isArchived: postBeingArchived.isArchived ? false : true }
        }, { new: true }).lean<IBlogPostQuery>()
            .select("_id author category title content comments likes views createdAt updatedAt isArchived")
            .populate({ path: "author", model: "User", select: "_id username" });

        if (!updatedBlogPost)
            return res.status(404).json({
                success: false,
                message: `An unexpected error occured while trying to
                ${postBeingArchived.isArchived ? "add the requested blog post to your archived" : "remove the requested blog post from your archived"}, 
                please try again shortly`,
                statusCode: 404,
            });

        const typedUpdatedBlogPost = updatedBlogPost as unknown as InitialDbBlogPosts;
        const mutatedPost: BlogPostSchema = {
            ...typedUpdatedBlogPost,
            _id: typedUpdatedBlogPost._id.toString(),
            comments: typedUpdatedBlogPost.comments.length,
            likes: typedUpdatedBlogPost.likes.length,
            views: typedUpdatedBlogPost.views.length,
            isLikedByCurrentUser: typedUpdatedBlogPost.likes.some((like) => like.equals(user._id)),
            createdAt: typedUpdatedBlogPost.createdAt.toISOString(),
            updatedAt: typedUpdatedBlogPost.updatedAt.toISOString(),
        };

        // ** Delete cache patterns to prevent stale data ** \\
        deleteOperation("patterns", undefined, `user:${user._id}-likedPosts-page:`);
        deleteOperation("patterns", undefined, `posts-page:`);
        deleteOperation("patterns", undefined, `user:${user._id}-createdPosts-page:`);
        deleteOperation("patterns", undefined, `user:${user._id}-archivedPosts-page:`);

        // ** Update the blog post in cache ** \\
        writeOperation(mutatedPost, `post:${updatedBlogPost._id}`);


        // ** Return a success response ** \\
        return res.status(200).json({
            success: true,
            message: `Post has been successfully ${postBeingArchived.isArchived ? "archived" : "removed from your archived blog posts"}`,
            statusCode: 200,
        });
    } catch (err) {
        console.error(`Error occured in "archiveBlogPost": ${err} in file "blogPost.controllers.ts"`);

        // ** Error handling ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to archive your requested blog post please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        });
    }
}

export {
    getBlogPosts,
    createBlogPost,
    getCreatedBlogPosts,
    getLikedBlogPosts,
    likeOrUnlikeBlogPost,
    getSingleBlogPost,
    newBlogPostView,
    getArchivedBlogPosts,
    archiveOrUnarchiveBlogPost
}