// ** Contains the structure of blog posts in postly ** \\
import mongoose, { Schema } from "mongoose";
;
// ** Actual schema ** \\
const BlogPostSchema = new Schema({
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
const BlogPost = mongoose.model("BlogPost", BlogPostSchema);
// ** Exports ** \\
export { BlogPost };
//# sourceMappingURL=BlogPost.js.map