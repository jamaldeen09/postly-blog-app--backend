// ** Types here are related to blog posts ** \\

import mongoose from "mongoose";

interface BlogPostSchema {
    _id: string;
    isLikedByCurrentUser: boolean;
    author: { _id: string; username: string };
    category: string;
    title: string;
    content: string;
    comments: number;
    likes: number;
    views: number;
    createdAt: string;
    updatedAt: string;
    isArchived: boolean;
};

interface InitialDbBlogPosts {
    _id: string;
    author: { _id: string; username: string };
    category: string;
    title: string;
    content: string;
    comments: mongoose.Types.ObjectId[];
    likes: mongoose.Types.ObjectId[];
    views: mongoose.Types.ObjectId[]
    createdAt: Date;
    updatedAt: Date;
    isArchived: boolean;
}

interface PaginationData<T> {
    offset: number;
    page: number;
    limit: number;
    totalPages: number;
    data: T;
}

export { type BlogPostSchema, type PaginationData, type InitialDbBlogPosts }