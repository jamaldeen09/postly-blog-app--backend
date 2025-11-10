// ** Contains the structure of the users using postly ** \\
import mongoose, { Schema } from "mongoose";
;
// ** Actual schema ** \\
const UserSchema = new Schema({
    username: { type: String, required: true, lowercase: true, trim: true, minLength: 3, maxLength: 20 },
    email: { type: String, required: true, lowercase: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    blogPosts: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "BlogPost" }], default: [] },
}, { timestamps: true });
// ** Model definition ** \\
const User = mongoose.model("User", UserSchema);
// ** Exports ** \\
export { User };
//# sourceMappingURL=User.js.map