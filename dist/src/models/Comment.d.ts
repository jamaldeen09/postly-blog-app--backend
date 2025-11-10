import mongoose, { Document } from "mongoose";
interface IComment {
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    content: string;
    type: "text";
    blogPost: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
type ICommentQuery = (IComment & Document) | null;
declare const Comment: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment, {}, {}> & IComment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export { Comment, IComment, ICommentQuery };
//# sourceMappingURL=Comment.d.ts.map