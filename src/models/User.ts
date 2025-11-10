// ** Contains the structure of the users using postly ** \\
import mongoose, { Document, Model, Schema } from "mongoose"


// ** Defines the initial structure of the document in which the schema follows ** \\
interface IUser {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password: string;
    blogPosts: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
};

// ** Query Type ** \\
type IUserQuery = (IUser & Document) | null;

// ** Actual schema ** \\
const UserSchema = new Schema<IUser, Model<IUser>>({
    username: { type: String, required: true, lowercase: true, trim: true, minLength: 3, maxLength: 20 },
    email: { type: String, required: true, lowercase: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    blogPosts: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "BlogPost" }], default: [] },
}, { timestamps: true });

// ** Model definition ** \\
const User = mongoose.model<IUser, Model<IUser>>("User", UserSchema);

// ** Exports ** \\
export { User, IUser, IUserQuery }

