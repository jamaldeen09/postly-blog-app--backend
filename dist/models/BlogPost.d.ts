import mongoose, { Document } from "mongoose";
interface IBlogPost {
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    category: string;
    title: string;
    content: string;
    comments: mongoose.Types.ObjectId[];
    likes: mongoose.Types.ObjectId[];
    views: mongoose.Types.ObjectId[];
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}
type IBlogPostQuery = (IBlogPost & Document) | null;
declare const BlogPost: mongoose.Model<IBlogPost, {}, {}, {}, mongoose.Document<unknown, {}, IBlogPost, {}, {}> & IBlogPost & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export { BlogPost, IBlogPost, IBlogPostQuery };
//# sourceMappingURL=BlogPost.d.ts.map