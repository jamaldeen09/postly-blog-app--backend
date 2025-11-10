// ** Contains the structure of comments in postly ** \\
import mongoose, { Document, Model, Schema } from "mongoose"

// ** Defines the initial structure of the document in which the schema follows ** \\
interface IComment {
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    content: string;
    type: "text";
    blogPost: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
};

// ** Query Type ** \\
type ICommentQuery = (IComment & Document) | null;

// ** Actual schema ** \\
const CommentSchema = new Schema<IComment, Model<IComment>>({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] },
    content: { type: String, trim: true, required: true, minLength: 1, maxLength: 300 },
    type: { type: String, enum: ["text"], required: true, trim: true },
    blogPost: { type: mongoose.Schema.Types.ObjectId, ref: "BlogPost", required: true },
}, { timestamps: true });

// ** Model definition ** \\
const Comment = mongoose.model<IComment, Model<IComment>>("Comment", CommentSchema);

// ** Exports ** \\
export { Comment, IComment, ICommentQuery }

