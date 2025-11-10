import initDb from "./config/database.config.js";
import cors from "cors"
import express, { Application } from "express";
import authRouter from "./routes/auth.routes.js";
import profileRouter from "./routes/profile.routes.js";
import blogPostRouter from "./routes/blogPost.routes.js";
import commentRouter from "./routes/comment.routes.js";

// ** Express + server initialization ** \\
const app: Application = express();

// ** Cache store ** \\
const cacheStore: Map<string, string> = new Map();   

// ** Global middlewares ** \\
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000", "https://postly-blog-app-frontend-blush.vercel.app"]
}));
   

// ** Database initialization ** \\
initDb(app);

// ** Routes ** \\
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1", blogPostRouter);
app.use("/api/v1", commentRouter);

// ** Exports ** \\  
export { app, cacheStore }

