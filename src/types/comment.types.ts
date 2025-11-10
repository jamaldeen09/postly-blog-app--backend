import mongoose from "mongoose";

interface CommentSchema {
    _id: string;
    likes: number;
    content: string;
    isLikedByCurrentUser: boolean;
    author: { _id: string; username: string; };
    type: "text";
    createdAt: string;
    updatedAt: string;
}

interface InitialDbComment {
    _id: mongoose.Types.ObjectId;
    author: { _id: mongoose.Types.ObjectId, username: string; };
    likes: mongoose.Types.ObjectId[];
    content: string;
    type: "text";
    createdAt: Date;
    updatedAt: Date;
}


export { 
    type CommentSchema,
    type InitialDbComment
}