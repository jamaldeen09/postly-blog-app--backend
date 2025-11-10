import mongoose from "mongoose";
import { BlogPost } from "../models/BlogPost.js";
import { Comment } from "../models/Comment.js";
import { deleteOperation, readOperation, writeOperation } from "../services/cache.services.js";
import { User } from "../models/User.js";
const getBlogPostComments = async (req, res) => {
    try {
        // ** Extract the validated postId and page from request ** \\
        const { postId, page } = req.data;
        // ** Extract users id attached to request ** \\
        const userId = req.accessTokenPayload.userId;
        // ** Prepare pagination data ** 
        const limit = 20;
        const offset = (page - 1) * limit;
        // ** Check if comments exist in cache ** \\
        const cacheKey = `post:${postId}-comments-page:${page}-limit:${limit}`;
        const cachedComments = readOperation(cacheKey);
        const totalComments = await Comment.countDocuments({ blogPost: postId }) || 0;
        if (!cachedComments) {
            // ** Cache Miss * \\
            const postInWhichCommentsAreNeededFrom = await BlogPost.exists({ _id: postId });
            if (!postInWhichCommentsAreNeededFrom)
                return res.status(404).json({
                    success: false,
                    message: "Post was not found",
                    statusCode: 404,
                    error: "Not found"
                });
            // ** Otherwise fetch comments that belong to that post ** \\
            const comments = await Comment.find({ blogPost: postInWhichCommentsAreNeededFrom._id })
                .lean()
                .select("_id author likes content type createdAt updatedAt")
                .populate([
                {
                    path: "author",
                    model: "User",
                    select: "_id username"
                },
            ]).skip(offset)
                .limit(limit)
                .sort({ createdAt: -1 });
            const typedComments = comments;
            const mutatedComments = typedComments.map((comment) => {
                const isCommentLikedByCurrentUser = comment.likes.some((like) => like.equals(new mongoose.Types.ObjectId(userId)));
                // ** Check if any of the replies of the current comment was liked by the requesting user ** \\
                return {
                    ...comment,
                    author: { ...comment.author, _id: comment.author._id.toString() },
                    _id: comment._id.toString(),
                    likes: comment.likes.length,
                    isLikedByCurrentUser: isCommentLikedByCurrentUser,
                    createdAt: comment.createdAt.toISOString(),
                    updatedAt: comment.updatedAt.toISOString(),
                };
            });
            // ** Store the mutated comments in cache ** \\
            writeOperation(mutatedComments, cacheKey);
            // ** Return a success response ** \\
            return res.status(200).json({
                success: true,
                message: "Comments fetched successfully",
                statusCode: 200,
                data: {
                    paginationData: {
                        offset,
                        page,
                        limit,
                        data: mutatedComments,
                    },
                    totalComments,
                }
            });
        }
        else {
            // ** Cache hit ** \\
            const parsedCachedComments = JSON.parse(cachedComments);
            return res.status(200).json({
                success: true,
                message: "Comments fetched successfully",
                statusCode: 200,
                data: {
                    paginationData: {
                        offset,
                        page,
                        limit,
                        data: parsedCachedComments,
                    },
                    totalComments,
                }
            });
        }
    }
    catch (err) {
        console.error(`Error occured in "getBlogPostComments" in file "blogPost.controllers.ts": ${err}`);
        // ** Error handling ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to fetch blog post's comments, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        });
    }
};
const addNewComment = async (req, res) => {
    try {
        // ** Extract validated post id ** \\
        const { postId, content } = req.data;
        // ** Extract the requesting users id ** \\
        const userId = req.accessTokenPayload.userId;
        const post = await BlogPost.exists({ _id: postId });
        if (!post)
            return res.status(404).json({
                success: false,
                message: "Post was not found",
                statusCode: 404,
                error: "Not found"
            });
        // ** Create the comment ** \\
        const comment = await Comment.create({ content, author: userId, blogPost: post._id, type: "text" });
        // ** Add the comments id to the posts comments ** \\
        const updatedPost = await BlogPost.findByIdAndUpdate(post._id, {
            $addToSet: { comments: comment._id }
        }, { new: true })
            .lean()
            .select("_id author category title content comments likes views createdAt updatedAt")
            .populate({ path: "author", model: "User", select: "_id username" });
        if (!updatedPost)
            return res.status(404).json({
                success: false,
                message: "Post was not found",
                statusCode: 404,
                error: "Not found"
            });
        // ** Update post in cache ** \\
        const typedRequestedPost = updatedPost;
        const mutatedPost = {
            ...typedRequestedPost,
            comments: typedRequestedPost.comments.length,
            likes: typedRequestedPost.likes.length,
            views: typedRequestedPost.views.length,
            isLikedByCurrentUser: typedRequestedPost.likes.some((like) => like.equals(userId)),
            createdAt: typedRequestedPost.createdAt.toISOString(),
            updatedAt: typedRequestedPost.updatedAt.toISOString(),
        };
        // ** Store blog post in cache ** \\
        writeOperation(mutatedPost, `post:${updatedPost._id}`);
        // ** Find the commment and send back to the frontend ** \\
        const commentBeingSent = await Comment.findById(comment._id).lean()
            .select("_id author likes content type createdAt updatedAt")
            .populate([
            {
                path: "author",
                model: "User",
                select: "_id username"
            },
        ]);
        if (!commentBeingSent)
            return res.status(404).json({
                success: false,
                message: "Comment was not found, we know this is not ideal please try again shortly",
                statusCode: 404,
                error: "Not found"
            });
        const typedCommentBeingSent = commentBeingSent;
        const isCommentLikedByCurrentUser = typedCommentBeingSent.likes.some((like) => like.equals(new mongoose.Types.ObjectId(userId)));
        // ** Check if any of the replies of the current comment was liked by the requesting user ** \\
        const mutatedComment = {
            ...typedCommentBeingSent,
            author: { ...typedCommentBeingSent.author, _id: typedCommentBeingSent.author._id.toString() },
            _id: typedCommentBeingSent._id.toString(),
            likes: typedCommentBeingSent.likes.length,
            isLikedByCurrentUser: isCommentLikedByCurrentUser,
            createdAt: typedCommentBeingSent.createdAt.toISOString(),
            updatedAt: typedCommentBeingSent.updatedAt.toISOString(),
        };
        // ** Clear cache ** \\
        deleteOperation("patterns", undefined, `post:${updatedPost._id}-comments-page:`);
        writeOperation(mutatedPost, `post:${mutatedPost._id}`);
        // ** Return a success response ** \\
        return res.status(200).json({
            success: true,
            message: "Comment successfully created",
            statusCode: 200,
            data: { comment: mutatedComment }
        });
    }
    catch (err) {
        console.error(`Error occured in "addNewComment": ${err} in file "comment.controllers.ts"`);
        // ** Error handling ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to register your post view, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        });
    }
};
const likeOrUnlikeAComment = async (req, res) => {
    try {
        // ** Extract the user's id attached to request ** \\
        const userId = req.accessTokenPayload.userId;
        // ** Extract the validated commentId attached to request ** \\
        const { commentId, postId } = req.data;
        //  ** Check if the user exists ** \\
        const user = await User.exists({ _id: userId });
        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                statusCode: 404,
                error: "Not found"
            });
        // ** Check if the post exists ** \\
        const post = await BlogPost.exists({ _id: postId });
        if (!post)
            return res.status(404).json({
                success: false,
                message: "Blog post was not found",
                statusCode: 404,
                error: "Not found"
            });
        // ** Check if the comment the user is trying to like exists ** \\
        const commentBeingLikedOrUnliked = await Comment.findById(commentId)
            .lean()
            .select("likes _id author");
        if (!commentBeingLikedOrUnliked)
            return res.status(404).json({
                success: false,
                message: "Comment was not found",
                statusCode: 404,
                error: "Not found"
            });
        if (commentBeingLikedOrUnliked.author.equals(user._id))
            return res.status(400).json({
                success: false,
                message: "Comment cannot be liked because you created this comment",
                statusCode: 400
            });
        // ** Update the comment conditionally based off of if the user has already liked it ** \\
        const isLikedByRequestingUser = commentBeingLikedOrUnliked.likes.some((like) => like.equals(user._id));
        let updatedComment = null;
        if (isLikedByRequestingUser) {
            updatedComment = await Comment.findByIdAndUpdate(commentBeingLikedOrUnliked._id, {
                $pull: { likes: user._id }
            }, { new: true })
                .select("_id");
        }
        else {
            updatedComment = await Comment.findByIdAndUpdate(commentBeingLikedOrUnliked._id, {
                $addToSet: { likes: user._id }
            }, { new: true })
                .select("_id");
        }
        ;
        // ** Add an extra check just in case also to prevent type errors ** \\
        if (!updatedComment)
            return res.status(404).json({
                success: false,
                message: "An unexpected error occured while trying to fufill your request to like/unlike the requested comment, please try again shortly",
                statusCode: 404,
                error: "Not found"
            });
        // ** Clear paginated comments cache ** \\
        deleteOperation("patterns", undefined, `post:${post._id}-comments-page:`);
        // ** Return a success response ** \\
        return res.status(200).json({
            success: true,
            message: `Comment has been ${isLikedByRequestingUser ? "unliked" : "liked"}`,
            statusCode: 200,
        });
    }
    catch (err) {
        console.error(`Error occured in "likeOrUnlikeAComment": ${err} in file "socket.service.ts"`);
        // ** Error handling ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to like/unlike your requested comment, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        });
    }
};
export { getBlogPostComments, addNewComment, likeOrUnlikeAComment };
//# sourceMappingURL=comment.controllers.js.map