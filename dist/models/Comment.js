// ** Contains the structure of comments in postly ** \\
import mongoose, { Schema } from "mongoose";
;
// ** Actual schema ** \\
const CommentSchema = new Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] },
    content: { type: String, trim: true, required: true, minLength: 1, maxLength: 300 },
    type: { type: String, enum: ["text"], required: true, trim: true },
    blogPost: { type: mongoose.Schema.Types.ObjectId, ref: "BlogPost", required: true },
}, { timestamps: true });
// ** Model definition ** \\
const Comment = mongoose.model("Comment", CommentSchema);
// ** Exports ** \\
export { Comment };
//# sourceMappingURL=Comment.js.map