// ** Contains the structure of blog posts in postly ** \\
import mongoose, { Document, Model, Schema } from "mongoose"


// ** Defines the initial structure of the document in which the schema follows ** \\
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
};
 
// ** Query Type ** \\
type IBlogPostQuery = (IBlogPost & Document) | null;

// ** Actual schema ** \\
const BlogPostSchema = new Schema<IBlogPost, Model<IBlogPost>>({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true, trim: true, minLength: 3, maxLength: 30 },
    title: { type: String, trim: true, required: true, minLength: 5, maxLength: 100 },
    content: { type: String, required: true, trim: true, minLength: 100, maxLength: 2000 },
    comments: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], default: [] },
    isArchived: { type: Boolean, default: false },
    likes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] },
    views: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] },
}, { timestamps: true });

// ** Model definition ** \\
const BlogPost = mongoose.model<IBlogPost, Model<IBlogPost>>("BlogPost", BlogPostSchema);

// ** Exports ** \\
export { BlogPost, IBlogPost, IBlogPostQuery }

