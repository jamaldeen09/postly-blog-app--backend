// ** Setups up mongo db database connection ** \\
import mongoose from "mongoose";
import envData from "./env.config.js";
// ** Retry logic variables ** \\
let MAX_RETRIES = 5;
let RETRY_DELAY_MS = 3000;
const initDb = async (app) => {
    // ** Retry logic variable ** \\
    let retries = 0;
    // ** While loop (main retry handler) ** \\
    while (retries < MAX_RETRIES) {
        try {
            // ** Mongodb connection ** \\
            await mongoose.connect(envData.MONGO_URI, {
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                bufferCommands: false,
                maxPoolSize: 10,
                minPoolSize: 1,
                maxIdleTimeMS: 30000
            });
            console.log("Successfully connected to mongoDb");
            // ** Run server ** \\
            app.listen(envData.PORT, () => console.log(`Server is running on: ${envData.HOST_URL}`));
            return;
        }
        catch (err) {
            // ** Error handling with retry ** \\
            retries++;
            console.error(`Mongo connection error: ${err}`);
            if (retries < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds... (Attempt ${retries}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            }
            else {
                console.error('All retry attempts failed. Exiting process.');
                return process.exit(1);
            }
        }
    }
};
export default initDb;
//# sourceMappingURL=database.config.js.map