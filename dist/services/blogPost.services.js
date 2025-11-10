import { BlogPost } from "../models/BlogPost.js";
import { readOperation, writeOperation } from "./cache.services.js";
import mongoose from "mongoose";
import { User } from "../models/User.js";
const getData = async (sortingOrPaginationData, blogPostType, userId) => {
    try {
        // ** Pagination data setup 
        const page = sortingOrPaginationData.page || 1;
        const limit = 16;
        const offset = (page - 1) * limit;
        // ** Create a cache key based on the paginated posts being fetched ** \\
        let cacheKey = ``;
        // ** Conditional query being used (for if search query exists) ** \\
        let query = {};
        if (blogPostType === "all-posts") {
            cacheKey = cacheKey += `posts-page:${page}-limit:${limit}`;
            query = { ...query, isArchived: false };
        }
        if (blogPostType === "created-posts") {
            cacheKey = cacheKey += `user:${userId}-createdPosts-page:${page}-limit:${limit}`;
            query = { ...query, author: userId, isArchived: false };
        }
        if (blogPostType === "liked-posts") {
            cacheKey = cacheKey += `user:${userId}-likedPosts-page:${page}-limit:${limit}`;
            query = { ...query, likes: { $in: [userId] }, isArchived: false };
        }
        if (blogPostType === "archived-posts") {
            cacheKey = cacheKey += `user:${userId}-archivedPosts-page:${page}-limit:${limit}`;
            query = { ...query, isArchived: true, author: userId };
        }
        // ** Conditionally set the query ** \\
        if (sortingOrPaginationData.searchQuery) {
            query = {
                ...query,
                $or: [
                    { category: { $regex: sortingOrPaginationData.searchQuery, $options: 'i' } },
                    { title: { $regex: sortingOrPaginationData.searchQuery, $options: 'i' } },
                    { content: { $regex: sortingOrPaginationData.searchQuery, $options: 'i' } }
                ]
            };
            cacheKey = cacheKey += `-searchQuery:${sortingOrPaginationData.searchQuery}`;
        }
        ;
        // ** Check if posts under the cache key have already been cached ** \\
        const cachedPosts = readOperation(cacheKey);
        if (!cachedPosts) {
            // ** Run BOTH queries in parallel for better performance ** \\
            const [totalCount, initialBlogPosts] = await Promise.all([
                // ** Count total documents that match the query *8
                BlogPost.countDocuments(query),
                // ** Get paginated results ** 
                BlogPost.find(query)
                    .lean()
                    .select("_id author category title content comments likes views createdAt updatedAt isArchived")
                    .populate({ path: "author", model: "User", select: "_id username" })
                    .sort({ createdAt: -1 })
                    .skip(offset)
                    .limit(limit)
            ]);
            // ** Calculate total pages based on TOTAL count ** \\
            const totalPages = Math.ceil(totalCount / limit);
            // ** Prepare actual blog posts being sent ** \\
            const blogPostsBeingSent = initialBlogPosts.map((post) => {
                const isLikedByCurrentUser = post.likes.some((like) => like.equals(new mongoose.Types.ObjectId(userId)));
                return {
                    ...post,
                    comments: post.comments.length,
                    views: post.views.length,
                    likes: post.likes.length,
                    createdAt: post.createdAt.toISOString(),
                    updatedAt: post.updatedAt.toISOString(),
                    isLikedByCurrentUser,
                };
            });
            // ** Store fetched paginated data in cache ** \\
            const cacheData = {
                data: blogPostsBeingSent,
                totalPages: totalPages,
            };
            writeOperation(cacheData, cacheKey);
            // ** Return paginated data ** \\
            return {
                success: true,
                message: "Blog posts fetched successfully",
                statusCode: 200,
                data: {
                    paginationData: {
                        offset,
                        limit,
                        page,
                        totalPages,
                        data: blogPostsBeingSent,
                    }
                }
            };
        }
        else {
            // ** Cache hit ** \\ 
            const parsedCacheData = JSON.parse(cachedPosts);
            const parsedCachedPosts = parsedCacheData.data;
            const totalPages = parsedCacheData.totalPages;
            return {
                success: true,
                message: "Blog posts fetched successfully",
                statusCode: 200,
                data: {
                    paginationData: {
                        offset,
                        limit,
                        page,
                        totalPages,
                        data: parsedCachedPosts,
                    }
                }
            };
        }
    }
    catch (err) {
        const postType = blogPostType === "all-posts" ? "blog posts" :
            blogPostType === "liked-posts" ? "your liked posts" :
                blogPostType === "created-posts" ? "your created posts" : "blog posts";
        console.error(`Error occured in "getData" service in file "blogPosts.services.ts": ${err}`);
        return {
            success: false,
            message: `A server error occured while trying to fetch ${postType}, please try again shortly`,
            statusCode: 500,
            error: "Internal server error"
        };
    }
};
const getPaginatedBlogPosts = async (req, res, blogPostType) => {
    try {
        // ** Extract users id attached to request ** \\
        const userId = req.accessTokenPayload.userId;
        const sortingOrPaginationData = req.data;
        // ** This is needed to get the users identity IF they are requesting for their liked or created posts ** \\
        let user = null;
        if (blogPostType === "created-posts" || blogPostType === "liked-posts") {
            user = await User.exists({ _id: userId });
            if (!user)
                return {
                    success: false,
                    message: "Account was not found",
                    statusCode: 404,
                    error: "Not found"
                };
            const stringifiedUserId = user._id.toString();
            return await getData(sortingOrPaginationData, blogPostType, stringifiedUserId);
        }
        if (blogPostType === "archived-posts") {
            return await getData(sortingOrPaginationData, "archived-posts", userId);
        }
        return await getData(sortingOrPaginationData, "all-posts", userId);
    }
    catch (err) {
        // ** Error handling ** \\
        const postType = blogPostType === "all-posts" ? "blog posts" :
            blogPostType === "liked-posts" ? "your liked posts" :
                blogPostType === "created-posts" ? "your created posts" : "blog posts";
        console.error(`Error occured in "getPaginatedBlogPosts" service in file "blogPosts.services.ts": ${err}`);
        return {
            success: false,
            message: `A server error occured while trying to fetch ${postType}, please try again shortly`,
            statusCode: 500,
            error: "Internal server error"
        };
    }
};
export { getPaginatedBlogPosts };
//# sourceMappingURL=blogPost.services.js.map