import mongoose, { Document } from "mongoose";
interface IUser {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password: string;
    blogPosts: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
type IUserQuery = (IUser & Document) | null;
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export { User, IUser, IUserQuery };
//# sourceMappingURL=User.d.ts.map