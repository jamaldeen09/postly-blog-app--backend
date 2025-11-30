// ** Reads and grabs all values in .env file for easy usage across all files ** \\

// ** Imports ** \\
import dotenv from "dotenv"


// ** Reads .env file ** \\
dotenv.config();

// ** Interface to define the structure of the values in .env file ** \\
interface EnvData {
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    MONGO_URI: string;
    PORT: string
    HOST_URL: string;
    FRONTEND_URL: string;
}

// ** Actual data ** \\
const envData: EnvData = {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
    MONGO_URI: process.env.MONGO_URI!,
    PORT: process.env.PORT!,
    HOST_URL: process.env.HOST_URL!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
}


// ** Export ** \\
export default envData