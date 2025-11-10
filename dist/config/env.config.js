// ** Reads and grabs all values in .env file for easy usage across all files ** \\
// ** Imports ** \\
import dotenv from "dotenv";
// ** Reads .env file ** \\
dotenv.config();
// ** Actual data ** \\
const envData = {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT,
    HOST_URL: process.env.HOST_URL,
};
// ** Export ** \\
export default envData;
//# sourceMappingURL=env.config.js.map